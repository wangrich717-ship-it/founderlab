import { getSettings, resolvedAi } from "@/lib/settings";
import { AiSettingsForm } from "@/components/ai-settings-form";

export default async function AdminAiPage() {
  const initial = await getSettings();
  const effective = await resolvedAi();

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 980 }}>
      <p className="kicker">AI Config</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 1.6rem" }}>AI 设置</h1>
      <AiSettingsForm initial={initial} effective={effective} />
    </main>
  );
}
