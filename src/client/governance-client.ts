/**
 * Thin client for the Reins Platform backend.
 *
 * Today the MCP server evaluates policies locally (see src/types/shared.ts).
 * Once the private backend (reins-platform) is live, this client will forward
 * every decision to it over HTTP, keeping this repo as a thin protocol layer.
 */

export interface ReinsClientConfig {
  apiUrl?: string;
  apiKey?: string;
}

export class ReinsClient {
  private apiUrl: string | undefined;
  private apiKey: string | undefined;

  constructor(config: ReinsClientConfig = {}) {
    this.apiUrl = config.apiUrl ?? process.env.REINS_API_URL;
    this.apiKey = config.apiKey ?? process.env.REINS_API_KEY;
  }

  get isRemoteConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiKey);
  }

  async evaluatePolicy(payload: unknown): Promise<unknown> {
    if (!this.isRemoteConfigured) {
      return null;
    }

    const response = await fetch(`${this.apiUrl}/v1/policy/evaluate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Reins API error: ${response.status}`);
    }

    return response.json();
  }
}
