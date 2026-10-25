import { z } from 'zod';
import { ReinsClient } from '../client/governance-client.js';

export const getAuditTrailSchema = {
  limit: z.number().min(1).max(200).optional().describe('Number of entries to return (default: 20)'),
};

export async function handleGetAuditTrail(args: { limit?: number }) {
  const client = new ReinsClient({
    apiUrl: process.env.REINS_API_URL,
    apiKey: process.env.REINS_API_KEY,
  });

  const entries = await client.getAuditTrail(args.limit ?? 20);

  if (!entries || entries.length === 0) {
    return { content: [{ type: 'text' as const, text: 'No audit entries found' }] };
  }

  const lines = entries.map((e: any) =>
    `[${e.created_at}] ${e.event_type} | actor:${e.actor} | entity:${e.entity_type}/${e.entity_id} | ${JSON.stringify(e.metadata)}`
  );
  return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
}
