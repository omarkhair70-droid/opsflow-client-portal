export const REQUEST_STATUSES = [
  "submitted",
  "triaged",
  "in_progress",
  "waiting_on_client",
  "closed",
] as const;

export const REQUEST_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "Submitted",
  triaged: "Triaged",
  in_progress: "In Progress",
  waiting_on_client: "Waiting on Client",
  closed: "Closed",
};

export const REQUEST_PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};
