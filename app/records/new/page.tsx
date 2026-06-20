import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ModuleShell, BackToDash } from "@/components/module-shell";
import { RecordEditor } from "@/components/record-editor";

export default async function NewRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <ModuleShell no="02" en="Records · New" title="写一条记录" desc="像写手账一样，把此刻记下来。">
      <RecordEditor />
      <BackToDash />
    </ModuleShell>
  );
}
