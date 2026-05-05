import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWorkspacePathByRole, type AppRole } from "@/lib/auth";

export default async function AuthRoutePage() {
  const role = (await cookies()).get("opsflow-role")?.value as AppRole | undefined;
  if (!role) redirect("/forbidden");
  redirect(getWorkspacePathByRole(role));
}
