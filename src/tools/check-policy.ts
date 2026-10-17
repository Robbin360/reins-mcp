import { z } from "zod";
import { evaluatePolicy } from "../types/shared.js";

export const checkPolicySchema = {
  action: z
    .enum(["purchase", "provision_resource", "hire_freelancer"])
    .describe("Type of action to validate"),
  amount: z.number().positive().describe("Amount in USD"),
  category: z.string().describe("Category of the action"),
  agent_id: z.string().describe("Unique identifier of the agent"),
};

export async function handleCheckPolicy(args: {
  action: string;
  amount: number;
  category: string;
  agent_id: string;
}) {
  const decision = evaluatePolicy({
    amount: args.amount,
    category: args.category,
  });

  const result = {
    action: args.action,
    agent_id: args.agent_id,
    allowed: decision.status === "approved",
    status: decision.status,
    reason: decision.message,
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
}
