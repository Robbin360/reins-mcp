# Reins — Security & Compliance Gateway for MCP

**Your agents don't get root access. Neither should their tools.**

Reins is the runtime security layer for the Model Context Protocol (MCP). It intercepts every action your autonomous agents attempt to execute on your internal systems, evaluates it against security policies, and either blocks, auto-approves, or routes to a human for approval — all while generating an immutable audit trail for EU AI Act, SOC 2, and GDPR compliance.

## The Problem

Your agents are connecting to your production databases, payment APIs, and infrastructure. But:

- **Shadow MCP:** You don't know how many agent-to-system connections exist in your org
- **Identity gaps:** Agents operate with static API keys, not corporate SSO identities
- **Blast radius unknowns:** A single misconfigured agent can delete production data in 9 seconds
- **Compliance blind spots:** Auditors need evidence of every action, but your logs are scattered

EU AI Act fines reach 7% of global revenue. SOC 2 auditors demand agent-level traceability. You can't afford to wait for an incident.

## Try it in 30 seconds

Add this to your MCP config (Claude Desktop, Cursor, Windsurf):

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
> "Write a new user record to the production database with admin privileges"

Watch Reins block it and route it to your Telegram for approval.

**Note:** Demo key is read-only (evaluates policies, cannot modify). For production use, see Self-Hosted Setup below.

## What Reins protects against

| Threat | How Reins stops it |
|---|---|
| Agent deletes production DB | Policy blocks `db_write` on `restricted` resources without human approval |
| Data exfiltration at 3 AM | Time-based policies block `data_export` outside business hours |
| Shadow MCP connections | Centralized gateway with inventory of all agent-to-system connections |
| Static API keys | Identity-based access control tied to corporate SSO (Okta/Entra ID) |
| Compliance audits | Immutable audit log with actor, action, context, decision, and timestamp |

## Policy examples

Reins policies are **contextual** — same action, different context, different decision:

| Action | Resource | Environment | Time | Decision |
|---|---|---|---|---|
| `db_write` | `production_db` | production | 10 AM | ⏸️ Pending (human approval required) |
| `db_write` | `staging_db` | staging | 10 AM | ✅ Auto-approved |
| `data_export` | `customer_pii` | production | 2 AM | ❌ Blocked (outside hours) |
| `api_call` | `stripe_charge` | production | 10 AM | ⏸️ Pending (restricted resource) |

## Architecture

```
AI Agent → MCP Server → Reins Gateway → Internal Systems
                              ↓
                    [Policy Engine]
                    [Identity Check]  
                    [Blast Radius Eval]
                              ↓
                    Block / Approve / Route to Human
                              ↓
                    [Immutable Audit Log]
```

## Self-Hosted Setup

For teams needing full control over security policies and audit data:

1. Create a Supabase project and run `schema.sql`
2. Deploy the API to Render with your env vars
3. Configure your MCP clients to point to your gateway

Full setup guide: [reins-platform repo](https://github.com/Robbin360/reins-platform)

## Why not just use LangSmith or MCP's built-in auth?

LangSmith provides observability **after** the action. Reins enforces policies **before** the action executes, with synchronous blocking and human-in-the-loop approval. MCP's native OAuth handles authentication but doesn't evaluate blast radius, time-of-day, or sensitivity levels.

Reins is the missing **runtime security layer** between your agents and your systems.

## Roadmap

- [ ] SSO integration (Okta, Entra ID, Google Workspace)
- [ ] Shadow MCP discovery and inventory
- [ ] Automated EU AI Act compliance reports
- [ ] SOC 2 evidence package generator
- [ ] Slack/Teams approval workflows (in addition to Telegram)

## License

Apache 2.0

---

Built for security teams who refuse to let agents have root access.
