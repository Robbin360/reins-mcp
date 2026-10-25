import { z } from "zod";
import { ReinsClient } from "../client/governance-client.js";
import { evaluatePolicy as localEvaluatePolicy } from "../types/shared.js";

export const requestPurchaseSchema = {
  amount: z.number().positive().describe("Amount in USD"),
  category: z.enum(["software", "hardware", "services", "ads", "infrastructure", "other"]).describe("Purchase category"),
  vendor: z.string().describe("Vendor or supplier name"),
  reason: z.string().describe("Business justification for the purchase"),
  agent_id: z.string().describe("Unique identifier of the requesting agent"),
};

export async function handleRequestPurchase(args: {
  amount: number;
  category: string;
  vendor: string;
  reason: string;
  agent_id: string;
}) {
  const apiUrl = process.env.REINS_API_URL;
  const apiKey = process.env.REINS_API_KEY;
  const client = new ReinsClient({ apiUrl, apiKey });

  if (client.isRemoteConfigured) {
    const remoteDecision = await client.requestPurchase({
      agent_id: args.agent_id,
      category: args.category,
      amount: args.amount,
      vendor: args.vendor,
      reason: args.reason,
    });

    if (remoteDecision) {
      const text = [
        `PURCHASE_${remoteDecision.status.toUpperCase()}`,
        `agent:${args.agent_id}`,
        `amount:${args.amount}`,
        `vendor:${args.vendor}`,
        `decision:${remoteDecision.decision_by}`,
        `message:${remoteDecision.reason}`,
        `id:${remoteDecision.purchase_id}`,
      ].join(" | ");
      return { content: [{ type: "text" as const, text }] };
    }
  }

  // Fallback local
  const localDecision = localEvaluatePolicy({ amount: args.amount, category: args.category });
  const text = [
    `PURCHASE_${localDecision.status.toUpperCase()} (LOCAL)`,
    `agent:${args.agent_id}`,
    `amount:${args.amount}`,
    `vendor:${args.vendor}`,
    `decision:${localDecision.decisionBy}`,
    `message:${localDecision.message}`,
  ].join(" | ");

  return { content: [{ type: "text" as const, text }] };
}
