import { redirect } from "next/navigation";

// 编辑器已合并到 /records，这里保留旧链接的兼容跳转
export default function NewRecordPage() {
  redirect("/records");
}
