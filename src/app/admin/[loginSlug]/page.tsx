import { notFound } from "next/navigation";
import { getAdminLoginSlug } from "@/lib/admin-auth";
import AdminLoginPage from "../login/AdminLoginPage";

type Props = { params: Promise<{ loginSlug: string }> };

export default async function SecretAdminLoginPage({ params }: Props) {
  const { loginSlug } = await params;
  const expected = getAdminLoginSlug();
  if (!expected || loginSlug !== expected) notFound();
  return <AdminLoginPage />;
}
