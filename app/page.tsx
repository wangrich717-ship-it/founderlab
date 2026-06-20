import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthLanding } from "@/components/auth-landing";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; verify?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const sp = await searchParams;

  return <AuthLanding verified={sp.verified === "1"} invalid={sp.verify === "invalid"} />;
}
