import type { Metadata } from "next";
import { PublicPracticeDetail } from "@/features/assessments/components/public-practice-detail";

export const metadata: Metadata = {
  title: "Chi tiet de luyen | HH Education",
  description: "Xem truoc de luyen public va dang nhap de bat dau lam bai.",
};

export default function PracticeDetailPage() {
  return <PublicPracticeDetail />;
}
