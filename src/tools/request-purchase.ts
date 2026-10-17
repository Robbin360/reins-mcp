import { z } from "zod";
import { evaluatePolicy, type PurchaseCategory } from "../types/shared.js";

export const requestPurchaseSchema = {
  amount: z.number().positive().describe("Amount in USD"),
  category: z
    .enum(["software", "hardware", "services", "ads", "infrastructure", "other"])
    .describe("Purchase category"),
  vendor: z.string().describe("Vendor or supplier name"),
  reason: z.string().describe("Business justification for the purchase"),
  agent_id: z.string().describe("Unique identifier of the requesting agent"),
};

export async function handleRequestPurchase(args: {
  amount: number;
  category: PurchaseCategory;
  vendor: string;
  reason: string;
  agent_id: string;
}) {
  const decision = evaluatePolicy({
    amount: args.amount,
    category: args.category,
  });

  const text = [
    `PURCHASE_${decision.status.toUpperCase()}`,
    `agent:${args.agent_id}`,
    `amount:${args.amount}`,
    `vendor:${args.vendor}`,
    `decision:${decision.decisionBy}`,
    `message:${decision.message}`,
  ].join(" | ");

  return { content: [{ type: "text" as const, text }] };
}
