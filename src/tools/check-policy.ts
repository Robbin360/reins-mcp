import { z } from 'zod';
import { ReinsClient } from '../client/governance-client.js';

export const checkPolicySchema = {
  agent_id: z.string().describe('Agent identifier'),
  action_type: z.string().describe('Type of action: db_write, db_read, api_call, infra_provision, data_export'),
  target_resource: z.string().describe('Target resource: production_db, stripe_api, aws_ec2, customer_pii, etc.'),
  sensitivity_level: z.enum(['public', 'internal', 'confidential', 'restricted']).describe('Data sensitivity level of the target resource'),
  environment: z.enum(['staging', 'production']).optional(),
  urgency: z.enum(['low', 'normal', 'critical']).optional(),
  actor_identity: z.string().optional().describe('Corporate SSO identity of the actor (if applicable)'),
};

export async function handleCheckPolicy(args: {
  agent_id: string;
  action_type: string;
  target_resource: string;
  sensitivity_level: 'public' | 'internal' | 'confidential' | 'restricted';
  environment?: string;
  urgency?: string;
  actor_identity?: string;
}) {
  const client = new ReinsClient({
    apiUrl: process.env.REINS_API_URL,
    apiKey: process.env.REINS_API_KEY,
  });

  const decision = await client.evaluatePolicy(args);

  if (!decision) {
    return { content: [{ type: 'text' as const, text: 'Policy engine unavailable' }] };
  }

  const text = [
    `POLICY_${decision.status.toUpperCase()}`,
    `agent:${args.agent_id}`,
    `action:${args.action_type}`,
    `resource:${args.target_resource}`,
    `sensitivity:${args.sensitivity_level}`,
    `decision:${decision.decision_by}`,
    `reason:${decision.reason}`,
    ...(decision.expires_at ? [`expires:${decision.expires_at}`] : []),
  ].join(' | ');

  return { content: [{ type: 'text' as const, text }] };
}
