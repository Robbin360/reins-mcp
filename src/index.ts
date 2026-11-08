import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { requestActionSchema, handleRequestAction } from './tools/request-action.js';
import { checkPolicySchema, handleCheckPolicy } from './tools/check-policy.js';
import { getAuditTrailSchema, handleGetAuditTrail } from './tools/get-audit-trail.js';

const server = new McpServer({ name: 'reins', version: '0.3.0' });

server.tool('request_action', 'Request an action execution through the security gateway (evaluates blast radius, sensitivity and identity)', requestActionSchema, handleRequestAction);
server.tool('check_policy', 'Dry-run security policy evaluation without creating an action request', checkPolicySchema, handleCheckPolicy);
server.tool('get_audit_trail', 'Get recent audit trail entries', getAuditTrailSchema, handleGetAuditTrail);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reins MCP Server v0.3.0 running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
