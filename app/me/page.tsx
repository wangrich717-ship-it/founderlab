import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ModuleShell } from "@/components/module-shell";
import { ProfileForm } from "@/components/profile-form";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <ModuleShell no="" en="Account" title="个人中心" desc="完善你的资料；这些信息会作为 AI 分析你的背景。">
      <ProfileForm
        init={{
          nickname: user.nickname || "",
          gender: user.gender || "",
          age: user.age != null ? String(user.age) : "",
          background: user.background || "",
        }}
      />
    </ModuleShell>
  );
}
