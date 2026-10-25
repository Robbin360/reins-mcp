import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'src/index.ts'],
  });

  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await client.connect(transport);

  console.log('Conectando al server...');
  const tools = await client.listTools();
  console.log('Conectado.\n');
  console.log('Tools disponibles:');
  tools.tools.forEach((t) => console.log(`  - ${t.name}`));

  console.log('\nCaso 1: software de $45 (esperado: APPROVED)');
  const r1 = await client.callTool({
    name: 'request_purchase',
    arguments: {
      agent_id: 'agent-marketing-001',
      amount: 45,
      category: 'software',
      vendor: 'Figma',
      reason: 'Diseño de campañas Q4',
      environment: 'staging',
      urgency: 'normal',
    },
  });
  console.log('  ->', (r1.content as any)[0].text);

  console.log('\nCaso 2: hardware de $2000 (esperado: PENDING)');
  const r2 = await client.callTool({
    name: 'request_purchase',
    arguments: {
      agent_id: 'agent-marketing-001',
      amount: 2000,
      category: 'hardware',
      vendor: 'NVIDIA',
      reason: 'GPU para entrenamiento',
      environment: 'production',
      urgency: 'critical',
    },
  });
  console.log('  ->', (r2.content as any)[0].text);

  console.log('\nCaso 3: check policy sin comprar');
  const r3 = await client.callTool({
    name: 'check_policy',
    arguments: {
      agent_id: 'agent-marketing-001',
      amount: 150,
      category: 'software',
      vendor: 'Adobe',
      environment: 'production',
    },
  });
  console.log('  ->', (r3.content as any)[0].text);

  console.log('\nCaso 4: audit trail');
  const r4 = await client.callTool({
    name: 'get_audit_trail',
    arguments: { limit: 5 },
  });
  console.log('  ->', (r4.content as any)[0].text);

  console.log('\nListo. Conexión cerrada.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
