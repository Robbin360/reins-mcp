import { z } from "zod";

export const getAuditTrailSchema = {
  agent_id: z.string().describe("Unique identifier of the agent"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe("Number of records to return"),
};

export async function handleGetAuditTrail(args: {
  agent_id: string;
  limit?: number;
}) {
  const trail = [
    {
      timestamp: "2026-10-15T10:30:00Z",
      action: "purchase",
      status: "approved",
      amount: 45,
      vendor: "Figma",
      decision_by: "policy:auto_approve_under_limit",
    },
    {
      timestamp: "2026-10-15T09:15:00Z",
      action: "purchase",
      status: "approved",
      amount: 150,
      vendor: "OpenAI",
      decision_by: "human:user@empresa.com",
    },
  ];

  const limit = args.limit ?? 10;

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(trail.slice(0, limit), null, 2) },
    ],
  };
}
