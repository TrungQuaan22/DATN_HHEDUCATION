import { redirect } from "next/navigation";

export default function LegacyLearningDashboardPage() {
  redirect("/student/courses");
}
