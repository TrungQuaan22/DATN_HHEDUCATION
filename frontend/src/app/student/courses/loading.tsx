export default function StudentCoursesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-muted-text/15" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted-text/10" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-96 overflow-hidden rounded border border-border-dark bg-deep-black"
          >
            <div className="h-40 animate-pulse bg-off-black" />
            <div className="space-y-4 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted-text/10" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted-text/15" />
              <div className="h-3 w-full animate-pulse rounded bg-muted-text/10" />
              <div className="h-10 w-full animate-pulse rounded bg-muted-text/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
