import type { Metadata } from "next";
import { PublicPracticeCatalog } from "@/features/assessments/components/public-practice-catalog";

export const metadata: Metadata = {
  title: "Luyen de mien phi | HH Education",
  description:
    "Danh sach de luyen public mien phi cho hoc sinh lop 9 den lop 12, khong can mua khoa hoc.",
};

export default function PracticePage() {
  return <PublicPracticeCatalog />;
}
