import { z } from 'zod';
import { ReinsClient } from '../client/governance-client.js';

export const requestActionSchema = {
  agent_id: z.string().describe('Agent identifier'),
  action_type: z.string().describe('Type of action: db_write, db_read, api_call, infra_provision, data_export'),
  target_resource: z.string().describe('Target resource: production_db, stripe_api, aws_ec2, customer_pii, etc.'),
  sensitivity_level: z.enum(['public', 'internal', 'confidential', 'restricted']).describe('Data sensitivity level of the target resource'),
  environment: z.enum(['staging', 'production']).optional(),
  urgency: z.enum(['low', 'normal', 'critical']).optional(),
  reason: z.string().optional().describe('Reason for the action'),
  actor_identity: z.string().optional().describe('Corporate SSO identity of the actor (if applicable)'),
};

export async function handleRequestAction(args: {
  agent_id: string;
  action_type: string;
  target_resource: string;
  sensitivity_level: 'public' | 'internal' | 'confidential' | 'restricted';
  environment?: string;
  urgency?: string;
  reason?: string;
  actor_identity?: string;
}) {
  const client = new ReinsClient({
    apiUrl: process.env.REINS_API_URL,
    apiKey: process.env.REINS_API_KEY,
  });

  const result = await client.requestAction(args);

  if (!result) {
    return { content: [{ type: 'text' as const, text: 'Policy engine unavailable' }] };
  }

  const isDemo = result.demo === true;
  const reason = result.decision_reason ?? result.reason ?? 'unknown';

  const text = [
    `ACTION_${result.status.toUpperCase()}`,
    isDemo ? '[DRY-RUN]' : '[LIVE]',
    `agent:${args.agent_id}`,
    `action:${args.action_type}`,
    `resource:${args.target_resource}`,
    `sensitivity:${args.sensitivity_level}`,
    `decision:${result.decision_by}`,
    `reason:${reason}`,
    ...(result.expires_at ? [`expires:${result.expires_at}`] : []),
    ...(isDemo && result.note ? [`note:${result.note}`] : []),
  ].join(' | ');

  return { content: [{ type: 'text' as const, text }] };
}
