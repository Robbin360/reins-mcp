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
    return Boolean(this.apiUrl);
  }

  async evaluatePolicy(payload: {
    agent_id: string;
    category: string;
    amount: number;
  }): Promise<{
    status: "approved" | "pending" | "rejected";
    decision_by: string;
    reason: string;
  } | null> {
    if (!this.isRemoteConfigured) return null;

    try {
      const response = await fetch(`${this.apiUrl}/v1/policy/evaluate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Reins API error: ${response.status}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error("Failed to connect to Reins API:", error);
      return null;
    }
  }
}
