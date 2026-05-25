'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';

import type { BlogPostSummary } from '@/types/common';
import { getBlogCategories, getBlogPosts } from '../api/blogs';

const ALL_CATEGORIES_LABEL = 'Tất cả';
const POSTS_PER_PAGE = 6;

type BlogCatalogProps = {
  initialPosts?: BlogPostSummary[];
};

const fallbackCategories = [
  'Phương pháp học',
  'Hướng nghiệp',
  'Công nghệ giáo dục',
  'Kỹ năng mềm',
  'Tin tức',
];

export default function BlogCatalog({ initialPosts = [] }: BlogCatalogProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_LABEL);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedCategoryParam =
    selectedCategory === ALL_CATEGORIES_LABEL ? undefined : selectedCategory;

  const isFiltering = useMemo(() => {
    return searchQuery.trim() !== '' || selectedCategoryParam !== undefined;
  }, [searchQuery, selectedCategoryParam]);

  const postsQuery = useQuery({
    queryKey: [
      'blog-posts',
      { page: currentPage, search: searchQuery, category: selectedCategoryParam },
    ],
    queryFn: () =>
      getBlogPosts({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        search: searchQuery.trim() || undefined,
        category: selectedCategoryParam,
      }),
    placeholderData: (previousData) => previousData,
  });

  const featuredQuery = useQuery({
    queryKey: ['blog-posts', 'featured', 3],
    queryFn: () => getBlogPosts({ page: 1, limit: 3, featured: true }),
    staleTime: 10 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ['blog-post-categories', 5],
    queryFn: () => getBlogCategories(5),
    staleTime: 10 * 60 * 1000,
  });

  const categoriesList = [
    ALL_CATEGORIES_LABEL,
    ...((categoriesQuery.data?.items?.length
      ? categoriesQuery.data.items.map((category) => category.name)
      : null) ?? fallbackCategories),
  ];

  const filteredMockPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES_LABEL || post.category === selectedCategory;
      const normalizedSearch = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.excerpt.toLowerCase().includes(normalizedSearch) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, searchQuery, selectedCategory]);

  const posts = postsQuery.data?.items?.length
    ? postsQuery.data.items
    : filteredMockPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const totalPages = postsQuery.data?.items?.length
    ? (postsQuery.data?.pagination.totalPages ?? 1)
    : Math.ceil(filteredMockPosts.length / POSTS_PER_PAGE) || 1;

  const featuredPosts = featuredQuery.data?.items?.length
    ? featuredQuery.data.items
    : initialPosts.slice(0, 3);
  const featuredLarge = featuredPosts[0];
  const featuredSides = featuredPosts.slice(1, 3);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryColorClass = (category: string) => {
    const classes: Record<string, string> = {
      'Bí kíp luyện thi': 'text-brand-pink border-brand-pink/20 bg-brand-pink/5',
      'Công nghệ giáo dục': 'text-accent-orange border-accent-orange/20 bg-accent-orange/5',
      'Hướng nghiệp': 'text-sky-blue border-sky-blue/20 bg-sky-blue/5',
      'Phương pháp học': 'text-brand-pink border-brand-pink/20 bg-brand-pink/5',
      'Kỹ năng mềm': 'text-sky-blue border-sky-blue/20 bg-sky-blue/5',
      'Tin tức': 'text-muted-taupe border-border-dark bg-surface-input',
    };
    return classes[category] || 'text-brand-pink border-brand-pink/20 bg-brand-pink/5';
  };

  const submitSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory(ALL_CATEGORIES_LABEL);
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen pb-20 pt-24 bg-brand-dark transition-colors duration-200">
      <section className="mb-16 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-[36px] md:text-[56px] font-extrabold text-cream mb-6 tracking-tight leading-tight">
          Góc Tri Thức &amp; Cảm Hứng
        </h1>
        <p className="text-[16px] md:text-[18px] text-muted-taupe mb-10 leading-relaxed">
          Khám phá những chia sẻ chuyên sâu về giáo dục, phương pháp học tập hiện đại và hành trình phát triển bản thân cùng HH Education.
        </p>

        <div className="relative group max-w-2xl mx-auto flex bg-off-black border border-border-dark rounded-xl overflow-hidden focus-within:border-brand-pink transition-all shadow-sm">
          <div className="pl-4 flex items-center pointer-events-none">
            <Search className="text-muted-taupe w-5 h-5" />
          </div>
          <input
            className="w-full bg-transparent border-none text-[14px] text-cream placeholder-muted-taupe px-4 py-4 outline-none"
            placeholder="Tìm kiếm bài viết..."
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitSearch();
              }
            }}
          />
          <button
            className="px-6 py-2 bg-brand-pink text-white text-[13px] font-bold hover:opacity-90 transition-opacity rounded-r-lg cursor-pointer"
            onClick={submitSearch}
            type="button"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      <section className="mb-12 flex flex-wrap justify-center gap-3 px-6">
        {categoriesList.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-6 py-2.5 rounded-full text-[13px] font-semibold cursor-pointer transition-all duration-200 border ${
                isActive
                  ? 'bg-brand-pink text-white border-brand-pink shadow-md'
                  : 'bg-deep-black border-border-dark text-muted-taupe hover:border-brand-pink hover:text-brand-pink'
              }`}
              type="button"
            >
              {category}
            </button>
          );
        })}
      </section>

      <div className="max-w-[1200px] mx-auto px-6">
        {!isFiltering && featuredLarge && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
            <article className="md:col-span-8 group relative overflow-hidden rounded-xl border border-border-dark cursor-pointer bg-deep-black shadow-2xl flex flex-col justify-end min-h-[450px]">
              <div className="absolute inset-0 w-full h-full">
                <img
                  alt={featuredLarge.title}
                  className="w-full h-full object-cover transition-all duration-300"
                  src={featuredLarge.thumbnailUrl || ''}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/50 to-transparent" />
              </div>

              <div className="relative z-10 p-8 text-cream w-full space-y-4">
                <span className="inline-block px-3 py-1 bg-brand-pink text-white text-[10px] font-bold rounded uppercase tracking-wider">
                  Tiêu điểm
                </span>
                <Link href={`/blog/${featuredLarge.slug}`}>
                  <h2 className="text-[24px] md:text-[32px] font-bold leading-tight group-hover:text-brand-pink transition-colors">
                    {featuredLarge.title}
                  </h2>
                </Link>
                <p className="text-muted-taupe text-[14px] leading-relaxed max-w-2xl line-clamp-2">
                  {featuredLarge.excerpt}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <img
                    alt={featuredLarge.author.fullName}
                    className="w-10 h-10 rounded-full border-2 border-brand-pink/30 object-cover bg-brand-dark"
                    src={featuredLarge.author.avatarUrl || '/window.svg'}
                  />
                  <div className="text-[12px]">
                    <p className="font-bold text-cream">{featuredLarge.author.fullName}</p>
                    <p className="text-muted-taupe">
                      {formatDate(featuredLarge.publishedAt)} • {featuredLarge.readingMinutes} phút đọc
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <div className="md:col-span-4 flex flex-col gap-6">
              {featuredSides.map((post) => (
                <article
                  key={post.id}
                  className="flex-1 bg-deep-black p-6 rounded-xl border border-border-dark hover:border-brand-pink transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-brand-pink text-[10px] font-bold uppercase tracking-widest block mb-2">
                      {post.category || 'Chia sẻ'}
                    </span>
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-[16px] md:text-[18px] font-bold text-cream mb-2 leading-snug group-hover:text-brand-pink transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-[13px] text-muted-taupe line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-dark/50">
                    <span className="text-[11px] text-muted-taupe">{post.readingMinutes} phút đọc</span>
                    <span className="text-brand-pink transition-transform group-hover:translate-x-1">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <h2 className="text-[20px] md:text-[24px] font-bold text-cream mb-8 flex items-center gap-3">
          <span className="w-8 h-1 bg-brand-pink rounded-full" />
          {isFiltering ? 'Kết quả tìm kiếm' : 'Bài viết mới nhất'}
          {postsQuery.isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-taupe" />}
        </h2>

        {postsQuery.isError && posts.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="text-[20px] font-bold text-cream mb-2">Không tải được bài viết</h3>
            <p className="text-muted-taupe text-[14px]">Vui lòng thử lại sau.</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => {
                const category = post.category || 'Chia sẻ';
                return (
                  <article
                    key={post.id}
                    className="bg-deep-black rounded-xl border border-border-dark overflow-hidden hover:border-brand-pink/40 hover:shadow-[0_0_25px_rgba(52,211,153,0.22)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group cursor-pointer flex flex-col justify-between h-full"
                  >
                    <div className="aspect-video overflow-hidden relative bg-brand-dark/50">
                      <img
                        alt={post.title}
                        className="w-full h-full object-cover transition-all duration-300"
                        src={post.thumbnailUrl || ''}
                        onError={(event) => {
                          event.currentTarget.src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%231D0C14"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23AF9DA6" font-family="sans-serif">No Image</text></svg>';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm border ${getCategoryColorClass(category)}`}>
                          {category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <Link href={`/blog/${post.slug}`}>
                          <h3 className="text-[16px] md:text-[18px] font-bold text-cream mb-3 group-hover:text-brand-pink transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-[13px] text-muted-taupe line-clamp-2 leading-relaxed mb-6">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-border-dark/60 mt-auto">
                        <img
                          alt={post.author.fullName}
                          className="w-8 h-8 rounded-full border border-border-dark object-cover bg-brand-dark"
                          src={post.author.avatarUrl || '/window.svg'}
                        />
                        <div className="text-[11px]">
                          <p className="font-bold text-cream leading-tight">{post.author.fullName}</p>
                          <p className="text-muted-taupe leading-none mt-0.5">
                            {formatDate(post.publishedAt)} • {post.readingMinutes} phút
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                  type="button"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-[13px] cursor-pointer transition-all ${
                      currentPage === index + 1
                        ? 'bg-brand-pink text-white'
                        : 'border border-border-dark text-cream hover:bg-deep-black'
                    }`}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-dark text-cream hover:bg-deep-black disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                  type="button"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <h3 className="text-[20px] font-bold text-cream mb-2">Không tìm thấy bài viết</h3>
            <p className="text-muted-taupe text-[14px] max-w-sm mb-6 leading-relaxed">
              Không có bài viết nào phù hợp với yêu cầu tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác.
            </p>
            <button
              onClick={resetFilters}
              className="bg-brand-pink text-white px-6 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all"
              type="button"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
