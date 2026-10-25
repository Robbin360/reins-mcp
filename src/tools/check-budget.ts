import { z } from 'zod';
import { ReinsClient } from '../client/governance-client.js';

export const checkBudgetSchema = {
  agent_id: z.string().describe('Agent identifier to check budget for'),
};

export async function handleCheckBudget(args: { agent_id: string }) {
  const client = new ReinsClient({
    apiUrl: process.env.REINS_API_URL,
    apiKey: process.env.REINS_API_KEY,
  });

  const budget = await client.getBudget(args.agent_id);

  if (!budget || budget.length === 0) {
    return { content: [{ type: 'text' as const, text: `No budget data for agent ${args.agent_id}` }] };
  }

  const lines = budget.map((b: any) =>
    `${b.period} (${b.period_start}): used=$${b.amount_used} approved=$${b.amount_approved} pending=$${b.amount_pending}`
  );
  return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
}
