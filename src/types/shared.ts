export type DecisionStatus = 'approved' | 'rejected' | 'pending' | 'expired';
export type Environment = 'staging' | 'production';
export type Urgency = 'low' | 'normal' | 'critical';
export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted';

export interface PolicyDecision {
  status: DecisionStatus;
  decision_by: string;
  reason: string;
  policy_id?: string;
  expires_at?: string;
}

export interface ActionRequestPayload {
  agent_id: string;
  action_type: string; // 'db_write', 'db_read', 'api_call', 'infra_provision', 'data_export'
  target_resource: string; // 'production_db', 'stripe_api', 'aws_ec2', 'customer_pii'
  sensitivity_level: SensitivityLevel;
  actor_identity?: string;
  environment?: Environment;
  urgency?: Urgency;
  reason?: string;
}

export interface LocalDecision {
  status: DecisionStatus;
  decisionBy: string;
  message: string;
}

// Fallback local: se usa cuando el backend no responde o para pruebas offline.
// Es fail-safe: por defecto pending, nunca aprueba acciones sensibles sin revisión.
export function evaluatePolicy(data: {
  action_type: string;
  target_resource?: string;
  sensitivity_level?: SensitivityLevel;
  environment?: Environment;
}): LocalDecision {
  const { action_type, sensitivity_level, environment } = data;

  // Hard block local: exportar PII siempre bloqueado
  if (action_type === 'data_export' && sensitivity_level === 'restricted') {
    return {
      status: 'rejected',
      decisionBy: 'local:hard_block_pii',
      message: 'Local hard block: PII data export always rejected',
    };
  }

  // Producción + restricted/confidential → requiere aprobación humana
  if (environment === 'production' && (sensitivity_level === 'restricted' || sensitivity_level === 'confidential')) {
    return {
      status: 'pending',
      decisionBy: 'local:production_sensitive',
      message: `Production action on ${sensitivity_level} resource requires human approval`,
    };
  }

  // DB writes en producción siempre requieren humano
  if (action_type === 'db_write' && environment === 'production') {
    return {
      status: 'pending',
      decisionBy: 'local:production_db_write',
      message: 'Production database writes always require human approval',
    };
  }

  // Infraestructura en producción requiere humano
  if (action_type === 'infra_provision' && environment === 'production') {
    return {
      status: 'pending',
      decisionBy: 'local:production_infra',
      message: 'Production infrastructure provisioning requires human approval',
    };
  }

  // Acciones de baja sensibilidad en staging → auto-aprobadas
  if ((sensitivity_level === 'public' || sensitivity_level === 'internal') && environment === 'staging') {
    return {
      status: 'approved',
      decisionBy: 'local:low_sensitivity_staging',
      message: `Auto-approved: ${sensitivity_level} sensitivity in staging`,
    };
  }

  // Read-only en cualquier entorno → auto-aprobado si no es restricted
  if (action_type === 'db_read' && sensitivity_level !== 'restricted') {
    return {
      status: 'approved',
      decisionBy: 'local:readonly',
      message: 'Auto-approved: read-only action',
    };
  }

  // Fail-safe: cualquier otra cosa queda pendiente de revisión
  return {
    status: 'pending',
    decisionBy: 'local:default',
    message: 'Action requires human review (local fallback)',
  };
}
