export const AUTO_APPROVE_LIMIT_USD = 100;
export const BLOCKED_CATEGORIES = ["hardware"] as const;

export type PurchaseCategory =
  | "software"
  | "hardware"
  | "services"
  | "ads"
  | "infrastructure"
  | "other";

export interface PolicyDecision {
  status: "approved" | "pending" | "rejected";
  decisionBy: string;
  message: string;
}

export function evaluatePolicy(args: {
  amount: number;
  category: string;
}): PolicyDecision {
  const { amount, category } = args;

  if ((BLOCKED_CATEGORIES as readonly string[]).includes(category)) {
    return {
      status: "pending",
      decisionBy: "policy:category_requires_human",
      message: `Category '${category}' always requires human approval`,
    };
  }

  if (amount <= AUTO_APPROVE_LIMIT_USD) {
    return {
      status: "approved",
      decisionBy: "policy:auto_approve_under_limit",
      message: `Auto-approved (amount ${amount} <= ${AUTO_APPROVE_LIMIT_USD})`,
    };
  }

  return {
    status: "pending",
    decisionBy: "policy:over_auto_approve_limit",
    message: `Amount ${amount} exceeds auto-approve limit of ${AUTO_APPROVE_LIMIT_USD}`,
  };
}
