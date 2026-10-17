import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";

// Resuelve la ruta del server compilado relativo a este archivo
const serverPath = fileURLToPath(new URL("../build/index.js", import.meta.url));

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
  });

  const client = new Client({
    name: "reins-test-client",
    version: "0.1.0",
  });

  console.log("Conectando al server...");
  await client.connect(transport);
  console.log("Conectado.\n");

  // 1. Descubrimiento de tools (lo que hace cualquier agente al iniciar)
  const { tools } = await client.listTools();
  console.log("Tools disponibles:");
  for (const tool of tools) {
    console.log(`  - ${tool.name}`);
  }
  console.log();

  // 2. Los dos casos de prueba del motor de políticas
  const cases = [
    {
      label: "Caso 1: software de $45 (esperado: APPROVED)",
      args: {
        amount: 45,
        category: "software" as const,
        vendor: "Figma",
        reason: "Licencia de diseño para el equipo",
        agent_id: "agent-marketing-001",
      },
    },
    {
      label: "Caso 2: hardware de $2000 (esperado: PENDING)",
      args: {
        amount: 2000,
        category: "hardware" as const,
        vendor: "NVIDIA",
        reason: "GPU para entrenamiento",
        agent_id: "agent-marketing-001",
      },
    },
  ];

  for (const testCase of cases) {
    console.log(testCase.label);
    const result = await client.callTool({
      name: "request_purchase",
      arguments: testCase.args,
    });

    const content = result.content as Array<{ type: string; text?: string }>;
    console.log(`  -> ${content[0]?.text}\n`);
  }

  await client.close();
  console.log("Listo. Conexión cerrada.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
