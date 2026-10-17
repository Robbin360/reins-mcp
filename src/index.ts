#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  requestPurchaseSchema,
  handleRequestPurchase,
} from "./tools/request-purchase.js";
import {
  checkBudgetSchema,
  handleCheckBudget,
} from "./tools/check-budget.js";
import {
  checkPolicySchema,
  handleCheckPolicy,
} from "./tools/check-policy.js";
import {
  getAuditTrailSchema,
  handleGetAuditTrail,
} from "./tools/get-audit-trail.js";

const server = new McpServer({
  name: "reins-mcp",
  version: "0.1.0",
});

server.tool(
  "request_purchase",
  "Request a purchase on behalf of an agent. Auto-approves if within policy limits, otherwise routes to human approval.",
  requestPurchaseSchema,
  handleRequestPurchase
);

server.tool(
  "check_budget",
  "Check the current budget status (limit, used, remaining) for an agent.",
  checkBudgetSchema,
  handleCheckBudget
);

server.tool(
  "check_policy",
  "Dry-run check: returns whether an action would be allowed by current policy, without executing it.",
  checkPolicySchema,
  handleCheckPolicy
);

server.tool(
  "get_audit_trail",
  "Retrieve the immutable approval history for an agent.",
  getAuditTrailSchema,
  handleGetAuditTrail
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Reins MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
