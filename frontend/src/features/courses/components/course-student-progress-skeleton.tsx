export default function CourseStudentProgressSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải tiến độ học viên">
      <div className="h-52 animate-pulse rounded-xl border border-admin-border/30 bg-admin-surface-low" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-admin-border/30 bg-admin-surface-low"
          />
        ))}
      </div>
    </div>
  );
}
