export const QUOTE_STATUSES = [
  "draft",
  "published",
  "superseded",
  "approved",
  "rejected",
  "changes_requested",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  published: "Published",
  superseded: "Superseded",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes Requested",
};

export const APPROVAL_DECISIONS = ["approved", "rejected", "changes_requested"] as const;

export type ApprovalDecision = (typeof APPROVAL_DECISIONS)[number];

export const APPROVAL_DECISION_LABELS: Record<ApprovalDecision, string> = {
  approved: "Approve",
  rejected: "Reject",
  changes_requested: "Request Changes",
};

export function formatMoney(amount: number | string, currency: string) {
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  return `${currency} ${Number.isFinite(parsed) ? parsed.toFixed(2) : amount}`;
}
