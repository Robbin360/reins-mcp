# Reins — Contextual Approval Layer for AI Agents

Reins is the approval layer for when your autonomous AI agents need to execute actions with financial consequences (SaaS subscriptions, API batches, infrastructure provisioning).

It's not a token counter. It's your agents' finance department.

## Try it in 30 seconds

No install, no signup. Add this to your MCP config (Claude Desktop, Cursor, Windsurf):

```json
{
  "mcpServers": {
    "reins": {
      "command": "npx",
      "args": ["-y", "github:Robbin360/reins-mcp"],
      "env": {
        "REINS_API_URL": "https://reins-api.onrender.com",
        "REINS_API_KEY": "reins_demo_public_2026"
      }
    }
  }
}
```

Then ask your agent:

> "Request a $2000 GPU purchase from NVIDIA for ML training, production environment, normal urgency"

Watch what happens.

**Note:** This demo key is read-only. You can evaluate policies but can't modify them or write to the shared database. For your own instance, see Self-Hosted Setup below.

## What makes Reins different

Most agent spend tools are simple firewalls: set a hard cap, block vendors, require approval for everything over $X.

Reins is **contextual**. The same purchase gets different decisions based on context:

| Purchase | Environment | Urgency | Decision |
|----------|-------------|---------|----------|
| Software $300 | staging | normal | Auto-approved (under $500 limit) |
| Software $300 | production | normal | Pending (production requires human) |
| Software $300 | production | critical | Fast-tracked (critical urgency override) |
| Hardware $2000 | staging | normal | Pending (hardware always requires human) |

Your policies can depend on:

- **Amount:** Auto-approve under $100
- **Category:** Hardware always requires human approval
- **Environment:** Production spend over $100 needs approval
- **Urgency:** Critical issues fast-tracked up to $500
- **Time:** Infrastructure blocked on weekends
- **Vendor:** Block specific suppliers

## Available MCP Tools

- **request_purchase** — Submit a purchase request for policy evaluation
- **check_policy** — Dry-run policy evaluation without creating a request
- **check_budget** — Check an agent's budget usage (daily/monthly)
- **get_audit_trail** — Retrieve recent audit log entries

### Example: auto-approved purchase

Input:

```json
{
  "agent_id": "agent-marketing-001",
  "amount": 45,
  "category": "software",
  "vendor": "Figma",
  "reason": "Design tool for Q4 campaigns",
  "environment": "staging",
  "urgency": "normal"
}
```

Output:

```text
PURCHASE_APPROVED | agent:agent-marketing-001 | amount:45 | vendor:Figma | decision:policy:4b8f40de | reason:Auto-approved (amount 45 <= 100)
```

### Example: purchase requiring human approval

Input:

```json
{
  "agent_id": "agent-marketing-001",
  "amount": 2000,
  "category": "hardware",
  "vendor": "NVIDIA",
  "reason": "GPU for ML training",
  "environment": "production",
  "urgency": "normal"
}
```

Output:

```text
PURCHASE_PENDING | agent:agent-marketing-001 | amount:2000 | vendor:NVIDIA | decision:policy:1d176c42 | reason:Requires human approval
```

The human receives a Telegram message with approve/reject buttons. When approved, the request flips to approved in the database and the agent can proceed.

## Why not just use token limits?

OpenRouter, Anthropic and OpenAI let you set hard caps on API keys. But:

- They cut the agent off blindly when the limit is hit
- They don't tell you **why** the money was spent
- They don't let you approve exceptions without changing account-wide settings
- They don't provide an audit trail for compliance

Reins governs **actions**, not just tokens. It's the layer between "the agent wants to do X" and "X actually happens".

## Self-Hosted Setup (Advanced)

**Note:** Self-hosting requires comfort with SQL, Supabase and Render. If you just want to try Reins, use the 30-second demo above.

1. Create a Telegram bot with @BotFather and get the token
2. Create a Supabase project (free tier)
3. Run the schema SQL from the reins-platform repo in the Supabase SQL Editor
4. Deploy the API to Render from your fork of reins-platform, setting: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `REINS_API_KEY`
5. Point your MCP client at your Render URL with your API key

Need help? Open an issue and I'll guide you through setup.

## Architecture

```text
AI Agent (LangChain, CrewAI, AutoGen)
        |  MCP tool call
        v
Reins MCP Server (local) --> Reins API (Render) --> Supabase (policies, audit log)
                                     |
                                     | if pending
                                     v
                              Telegram Bot  <-- human approves from phone
```

## Roadmap

- Multi-tenant organizations
- Web dashboard for policy management
- Slack integration
- Budget alerts and forecasting

## License

Apache 2.0

---

Built by Felix Tremigual. Questions? Open an issue on GitHub.
