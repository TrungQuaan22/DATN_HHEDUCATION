'use client';

import Link from 'next/link';
import { mockBlogPosts } from '@/data/mock-data';

export default function BlogPreviewSection() {
  const tagColorClasses: Record<string, string> = {
    'Bí kíp luyện thi': 'text-brand-pink',
    'Công nghệ giáo dục': 'text-accent-orange',
    'Hướng nghiệp': 'text-sky-blue',
  };

  return (
    <section className="py-24 bg-deep-black" id="blog">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <h2 className="text-[36px] font-[700] text-cream mb-4">Góc chia sẻ</h2>
            <p className="text-[16px] text-muted-taupe max-w-2xl">
              Kinh nghiệm học tập và bí quyết luyện thi từ các chuyên gia.
            </p>
          </div>
          <Link href="/blog" className="text-brand-pink text-[14px] font-semibold flex items-center gap-2 hover:underline">
            Xem tất cả bài viết
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockBlogPosts.slice(0, 3).map((post) => {
            const tag = post.tags[0] || 'Tin tức';
            const tagColor = tagColorClasses[tag] || 'text-brand-pink';

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex flex-col space-y-4 group block"
              >
                <div className="aspect-video rounded-lg overflow-hidden bg-brand-dark border border-border-dark group-hover:border-brand-pink/40 group-hover:shadow-[0_0_25px_rgba(52,211,153,0.22)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] relative">
                  <img
                    alt={post.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    src={post.thumbnailUrl || ''}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%231D0C14"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23AF9DA6" font-family="sans-serif">No Image</text></svg>';
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <span className={`text-[11px] font-semibold uppercase ${tagColor}`}>
                    {tag}
                  </span>
                  <h3 className="text-[18px] font-bold text-cream group-hover:text-brand-pink transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-[14px] text-muted-taupe line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
