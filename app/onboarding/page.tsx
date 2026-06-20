import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingFlow } from "@/components/onboarding-flow";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.onboarded) redirect("/dashboard");

  return <OnboardingFlow nickname={user.nickname || ""} />;
}
