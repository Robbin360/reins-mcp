import { z } from 'zod';
import { ReinsClient } from '../client/governance-client.js';

export const checkPolicySchema = {
  agent_id: z.string().describe('Agent identifier'),
  amount: z.number().positive().describe('Amount to evaluate'),
  category: z.string().describe('Category'),
  vendor: z.string().describe('Vendor'),
  environment: z.enum(['staging', 'production']).optional(),
  urgency: z.enum(['low', 'normal', 'critical']).optional(),
};

export async function handleCheckPolicy(args: {
  agent_id: string;
  amount: number;
  category: string;
  vendor: string;
  environment?: string;
  urgency?: string;
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
    `amount:${args.amount}`,
    `category:${args.category}`,
    `decision:${decision.decision_by}`,
    `reason:${decision.reason}`,
    ...(decision.expires_at ? [`expires:${decision.expires_at}`] : []),
  ].join(' | ');

  return { content: [{ type: 'text' as const, text }] };
}
