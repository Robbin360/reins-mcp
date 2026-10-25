export interface ReinsClientConfig {
  apiUrl?: string;
  apiKey?: string;
}

export interface PolicyDecision {
  status: 'approved' | 'pending' | 'rejected';
  decision_by: string;
  reason: string;
  policy_id?: string;
  expires_at?: string;
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

  private headers(): Record<string, string> {
    return {
      'content-type': 'application/json',
      ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
    };
  }

  async evaluatePolicy(payload: {
    agent_id: string;
    category: string;
    amount: number;
    vendor?: string;
    reason?: string;
    environment?: string;
    urgency?: string;
  }): Promise<PolicyDecision | null> {
    if (!this.isRemoteConfigured) return null;
    try {
      const res = await fetch(`${this.apiUrl}/v1/policy/evaluate`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(`Reins API error: ${res.status}`);
        return null;
      }
      return res.json();
    } catch (error) {
      console.error('Failed to connect to Reins API:', error);
      return null;
    }
  }

  async requestPurchase(payload: {
    agent_id: string;
    category: string;
    amount: number;
    vendor: string;
    reason?: string;
    environment?: string;
    urgency?: string;
  }): Promise<any | null> {
    if (!this.isRemoteConfigured) return null;
    try {
      const res = await fetch(`${this.apiUrl}/v1/purchases/request`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error(`Reins API error: ${res.status}`);
        return null;
      }
      return res.json();
    } catch (error) {
      console.error('Failed to connect to Reins API:', error);
      return null;
    }
  }

  async getAuditTrail(limit = 20): Promise<any[] | null> {
    if (!this.isRemoteConfigured) return null;
    try {
      const res = await fetch(`${this.apiUrl}/v1/audit?limit=${limit}`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async getPurchase(id: string): Promise<any | null> {
    if (!this.isRemoteConfigured) return null;
    try {
      const res = await fetch(`${this.apiUrl}/v1/purchases/${id}`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async getBudget(agentId: string): Promise<any[] | null> {
    if (!this.isRemoteConfigured) return null;
    try {
      const res = await fetch(`${this.apiUrl}/v1/budget/${agentId}`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
}
