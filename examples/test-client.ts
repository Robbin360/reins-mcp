import 'dotenv/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['build/index.js'],
  });

  const client = new Client({ name: 'test-client', version: '0.3.0' });
  await client.connect(transport);

  const tools = await client.listTools();
  console.log('Tools disponibles:');
  tools.tools.forEach((t) => console.log(`  - ${t.name}`));
  console.log();

  // CASO 1: db_write en production restricted → ACCIÓN REAL (crea fila + notifica Telegram)
  console.log('Caso 1: db_write production restricted (esperado: ACTION_PENDING + Telegram)');
  const r1 = await client.callTool({
    name: 'request_action',
    arguments: {
      agent_id: 'agent-sre-001',
      action_type: 'db_write',
      target_resource: 'production_db',
      sensitivity_level: 'restricted',
      environment: 'production',
      reason: 'Update user permissions table',
    },
  });
  console.log('  ->', (r1.content as any)[0].text);
  console.log();

  // CASO 2: data_export restricted → esperado REJECTED (hard block)
  console.log('Caso 2: data_export restricted (esperado: REJECTED)');
  const r2 = await client.callTool({
    name: 'check_policy',
    arguments: {
      agent_id: 'agent-analytics-001',
      action_type: 'data_export',
      target_resource: 'customer_pii',
      sensitivity_level: 'restricted',
      environment: 'production',
    },
  });
  console.log('  ->', (r2.content as any)[0].text);
  console.log();

  // CASO 3: db_read staging public → esperado APPROVED
  console.log('Caso 3: db_read staging public (esperado: APPROVED)');
  const r3 = await client.callTool({
    name: 'check_policy',
    arguments: {
      agent_id: 'agent-analytics-001',
      action_type: 'db_read',
      target_resource: 'staging_db',
      sensitivity_level: 'public',
      environment: 'staging',
    },
  });
  console.log('  ->', (r3.content as any)[0].text);
  console.log();

  // CASO NEGATIVO 1: sensitivity_level inválido → debería dar error, NO aprobar
  console.log('Negativo 1: sensitivity_level inválido (esperado: ERROR)');
  try {
    const rn1 = await client.callTool({
      name: 'check_policy',
      arguments: {
        agent_id: 'attacker-001',
        action_type: 'db_write',
        target_resource: 'production_db',
        sensitivity_level: 'super-secret',
        environment: 'production',
      },
    });
    console.log('  ->', (rn1.content as any)[0]?.text);
  } catch (e) {
    console.log('  -> RECHAZADO correctamente:', (e as Error).message);
  }
  console.log();

  // CASO NEGATIVO 2: campo requerido faltante → debería dar error
  console.log('Negativo 2: sin action_type (esperado: ERROR)');
  try {
    const rn2 = await client.callTool({
      name: 'check_policy',
      arguments: {
        agent_id: 'attacker-001',
        target_resource: 'production_db',
        sensitivity_level: 'restricted',
      },
    });
    console.log('  ->', (rn2.content as any)[0]?.text);
  } catch (e) {
    console.log('  -> RECHAZADO correctamente:', (e as Error).message);
  }
  console.log();

  await client.close();
}

main().catch(console.error);
