import BlogCatalog from "@/features/blog/components/blog-catalog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Góc Chia Sẻ | HH Education",
  description:
    "Khám phá những chia sẻ chuyên sâu về giáo dục, phương pháp học tập hiện đại, bí quyết ôn thi và định hướng nghề nghiệp.",
  keywords:
    "phương pháp học tập, bí quyết ôn thi, định hướng nghề nghiệp, kỹ năng mềm, góc chia sẻ",
};

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "http://localhost:3000",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "http://localhost:3000/blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full">
        <BlogCatalog />
      </div>
    </>
  );
}

