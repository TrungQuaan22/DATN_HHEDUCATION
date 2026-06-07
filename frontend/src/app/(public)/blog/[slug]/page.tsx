import { getBlogPostDetail } from "@/features/blog/api";
import { getBlogDetail } from "@/features/blog/mock";
import RichContentRenderer from "@/components/editor/rich-content-renderer";
import TableOfContents from "@/features/blog/components/table-of-contents";
import type { RichNode } from "@/types/common";
import { Share2, Bookmark, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import BlogHeader from "./components/blog-header";
import BlogRelatedPosts from "./components/blog-related-posts";
import BlogNewsletterBox from "./components/blog-newsletter-box";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getBlogPostDetail(slug);
  } catch {
    post = getBlogDetail(slug);
  }
  if (!post) {
    return {
      title: "Bài viết không tìm thấy | HH Education",
    };
  }

  return {
    title: `${post.title} | HH Education`,
    description:
      post.excerpt ||
      "Chi tiết bài viết tại góc chia sẻ tri thức HH Education.",
  };
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getBlogPostDetail(slug);
  } catch {
    post = getBlogDetail(slug);
  }

  if (!post) {
    notFound();
  }

  const isHeadingNode = (
    node: RichNode
  ): node is Extract<RichNode, { type: "heading" }> => node.type === "heading";

  // Extract headings from rich content for TableOfContents
  const headings = post.content.content
    .filter(isHeadingNode)
    .map((node) => {
      const text = node.content
        ? node.content
            .map((child) => (child.type === "text" ? child.text : ""))
            .join("")
        : "";
      const id = text
        .toLowerCase()
        .replace(
          /[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/g,
          ""
        )
        .trim()
        .replace(/\s+/g, "-");
      return { text, id, level: node.attrs?.level || 2 };
    });

  // SEO BlogPosting JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnailUrl,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.fullName,
    },
    publisher: {
      "@type": "Organization",
      name: "HH Education",
      logo: {
        "@type": "ImageObject",
        url: "http://localhost:3000/favicon.ico",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen pt-20 pb-20 bg-brand-dark transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto px-6 pt-12">
          <BlogHeader post={post} formattedDate={formatDate(post.publishedAt)} />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column - Article Body */}
            <article className="w-full lg:col-span-8">
              <RichContentRenderer content={post.content} />

              {/* Extra Interactive Formulas Block */}
              <div className="bg-deep-black p-8 rounded shadow-lg border border-border-dark my-10 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <span className="text-[11px] font-bold text-muted-taupe uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={14} className="text-brand-pink" /> Công thức
                    điểm 10
                  </span>
                  <div className="text-[20px] md:text-[24px] font-extrabold text-cream leading-normal">
                    <span className="text-brand-pink">Mở bài ấn tượng</span> +{" "}
                    <span className="text-sky-blue">Thân bài mạch lạc</span> +{" "}
                    <span className="text-brand-pink">Kết luận cô đọng</span>
                    <br />
                    <span className="text-cream font-bold text-[28px] mt-2 block">
                      = 100% Chinh phục đề thi
                    </span>
                  </div>
                </div>
              </div>

              {/* Shared Footer (Share / Bookmark / Time updated) */}
              <div className="mt-12 pt-8 border-t border-border-dark flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2">
                  <button className="p-2.5 bg-deep-black rounded-full border border-border-dark hover:text-brand-pink hover:border-brand-pink text-cream transition-all active:scale-90 cursor-pointer">
                    <Share2 size={16} />
                  </button>
                  <button className="p-2.5 bg-deep-black rounded-full border border-border-dark hover:text-brand-pink hover:border-brand-pink text-cream transition-all active:scale-90 cursor-pointer">
                    <Bookmark size={16} />
                  </button>
                </div>
                <div className="text-muted-taupe text-[12px] italic">
                  Cập nhật lần cuối: {formatDate(post.publishedAt)}
                </div>
              </div>
            </article>

            {/* Right Column - Sidebar */}
            <aside className="w-full lg:col-span-4 space-y-8">
              {/* Sticky TOC Wrapper */}
              <div className="lg:sticky lg:top-24 space-y-8">
                <TableOfContents headings={headings} />

                {/* Related Articles Widget */}
                <BlogRelatedPosts
                  relatedArticles={post.relatedPosts}
                  formatDate={formatDate}
                />

                {/* Newsletter Box */}
                <BlogNewsletterBox />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
