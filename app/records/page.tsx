import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ModuleShell } from "@/components/module-shell";
import { RecordEditor } from "@/components/record-editor";
import { IconBook } from "@/components/icons";

export default async function RecordsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <ModuleShell
      no="02"
      en="Records"
      title="写一条记录"
      desc="像写手账一样，把此刻记下来。保存后 AI 会自动归类并提取关键词。"
      action={
        <Link href="/records/history" className="btn" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem" }}>
          <IconBook size={16} /> 历史记录
        </Link>
      }
    >
      <RecordEditor />
    </ModuleShell>
  );
}
