export default function CourseStudentsSkeleton() {
  return (
    <div
      aria-label="Đang tải danh sách học viên"
      className="overflow-hidden rounded-xl border border-admin-border/30 bg-admin-surface-low"
    >
      <div className="h-12 animate-pulse border-b border-admin-border/20 bg-admin-deep/50" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-admin-border/20 px-5 py-4 last:border-0"
        >
          <div className="h-9 w-9 animate-pulse rounded-full bg-admin-border/30" />
          <div className="min-w-44 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-admin-border/30" />
            <div className="h-3 w-52 animate-pulse rounded bg-admin-border/20" />
          </div>
          <div className="hidden h-3 w-28 animate-pulse rounded bg-admin-border/20 md:block" />
          <div className="hidden h-3 w-32 animate-pulse rounded bg-admin-border/20 lg:block" />
        </div>
      ))}
    </div>
  );
}
