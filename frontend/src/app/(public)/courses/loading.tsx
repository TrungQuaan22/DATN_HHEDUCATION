export default function CoursesLoading() {
  return (
    <main className="min-h-screen bg-brand-dark px-6 py-24">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div className="space-y-3">
          <div className="h-10 w-72 animate-pulse rounded bg-muted-text/15" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded bg-muted-text/10" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded border border-border-dark bg-deep-black"
            >
              <div className="aspect-video animate-pulse bg-off-black" />
              <div className="space-y-4 p-5">
                <div className="h-4 w-24 animate-pulse rounded bg-muted-text/10" />
                <div className="h-6 w-4/5 animate-pulse rounded bg-muted-text/15" />
                <div className="h-4 w-full animate-pulse rounded bg-muted-text/10" />
                <div className="h-10 w-full animate-pulse rounded bg-muted-text/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
