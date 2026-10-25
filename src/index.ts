import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { requestPurchaseSchema, handleRequestPurchase } from './tools/request-purchase.js';
import { checkBudgetSchema, handleCheckBudget } from './tools/check-budget.js';
import { checkPolicySchema, handleCheckPolicy } from './tools/check-policy.js';
import { getAuditTrailSchema, handleGetAuditTrail } from './tools/get-audit-trail.js';

const server = new McpServer({ name: 'reins', version: '0.2.0' });

server.tool('request_purchase', 'Request a purchase with governance approval', requestPurchaseSchema, handleRequestPurchase);
server.tool('check_budget', 'Check budget usage for an agent', checkBudgetSchema, handleCheckBudget);
server.tool('check_policy', 'Evaluate policy without creating a purchase', checkPolicySchema, handleCheckPolicy);
server.tool('get_audit_trail', 'Get recent audit trail entries', getAuditTrailSchema, handleGetAuditTrail);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reins MCP Server v0.2.0 running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
