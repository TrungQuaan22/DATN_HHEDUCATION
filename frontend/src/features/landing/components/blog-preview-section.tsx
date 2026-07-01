"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBlogPosts } from "@/features/blog/api";
import { SafeImage } from "@/components/media/safe-image";

export default function BlogPreviewSection() {
  const postsQuery = useQuery({
    queryKey: ["blog-posts", "landing"],
    queryFn: () => getBlogPosts({ page: 1, limit: 3 }),
  });
  const posts = postsQuery.data?.items ?? [];
  const tagColorClasses: Record<string, string> = {
    "Bí kíp luyện thi": "text-brand-pink",
    "Công nghệ giáo dục": "text-accent-orange",
    "Hướng nghiệp": "text-sky-blue",
  };

  return (
    <section className="py-24 bg-deep-black" id="blog">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <h2 className="text-4xl font-[700] text-cream mb-4">
              Góc chia sẻ
            </h2>
            <p className="text-base text-muted-taupe max-w-2xl">
              Kinh nghiệm học tập và bí quyết luyện thi từ các chuyên gia.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-brand-pink text-sm font-semibold flex items-center gap-2 hover:underline"
          >
            Xem tất cả bài viết
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => {
            const tag = post.tags[0] || "Tin tức";
            const tagColor = tagColorClasses[tag] || "text-brand-pink";

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex flex-col space-y-4 group block"
              >
                <div className="aspect-video rounded-lg overflow-hidden bg-brand-dark border border-border-dark group-hover:border-brand-pink/40 group-hover:shadow-[0_0_25px_rgba(52,211,153,0.22)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] relative">
                  <SafeImage
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-all duration-300"
                    src={post.thumbnailUrl}
                  />
                </div>

                <div className="space-y-2">
                  <span
                    className={`text-xs font-semibold uppercase ${tagColor}`}
                  >
                    {tag}
                  </span>
                  <h3 className="text-lg font-bold text-cream group-hover:text-brand-pink transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-taupe line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            );
          })}
          {!postsQuery.isLoading && posts.length === 0 && (
            <p className="col-span-full text-center text-muted-taupe">Chưa có bài viết được xuất bản.</p>
          )}
        </div>
      </div>
    </section>
  );
}

