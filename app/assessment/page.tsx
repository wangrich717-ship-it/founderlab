import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssessmentFlow } from "@/components/assessment-flow";

export default async function AssessmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const questions = await prisma.question.findMany({
    where: { active: true },
    orderBy: { orderNo: "asc" },
    select: { id: true, dimension: true, text: true, placeholder: true },
  });

  return <AssessmentFlow questions={questions} />;
}
