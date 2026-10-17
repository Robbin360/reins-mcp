import { z } from "zod";

export const checkBudgetSchema = {
  agent_id: z.string().describe("Unique identifier of the agent"),
};

export async function handleCheckBudget(args: { agent_id: string }) {
  const budget = {
    agent_id: args.agent_id,
    period: new Date().toISOString().slice(0, 7),
    currency: "USD",
    limit: 1000,
    used: 350,
    remaining: 650,
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(budget, null, 2) }],
  };
}
