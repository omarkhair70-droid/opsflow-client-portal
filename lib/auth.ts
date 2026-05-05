export type AppRole = "internal_admin" | "internal_member" | "client_admin" | "client_member";

export function getWorkspacePathByRole(role: AppRole) {
  if (role === "internal_admin" || role === "internal_member") return "/internal";
  return "/portal";
}
