export type PurchaseStatus = 'approved' | 'rejected' | 'pending' | 'expired';
export type Environment = 'staging' | 'production';
export type Urgency = 'low' | 'normal' | 'critical';

export interface PolicyDecision {
  status: PurchaseStatus;
  decision_by: string;
  reason: string;
  policy_id?: string;
  expires_at?: string;
}

export interface PurchaseRequestPayload {
  agent_id: string;
  amount: number;
  category: string;
  vendor: string;
  reason?: string;
  environment?: Environment;
  urgency?: Urgency;
}

export interface LocalDecision {
  status: PurchaseStatus;
  decisionBy: string;
  message: string;
}

export function evaluatePolicy(data: { amount: number; category: string }): LocalDecision {
  if (data.category === 'hardware') {
    return {
      status: 'pending',
      decisionBy: 'policy:category_requires_human',
      message: "Category 'hardware' always requires human approval",
    };
  }
  if (data.amount <= 100) {
    return {
      status: 'approved',
      decisionBy: 'policy:auto_approve_under_limit',
      message: `Auto-approved (amount ${data.amount} <= 100)`,
    };
  }
  return {
    status: 'pending',
    decisionBy: 'policy:default',
    message: 'Amount exceeds auto-approve threshold',
  };
}
