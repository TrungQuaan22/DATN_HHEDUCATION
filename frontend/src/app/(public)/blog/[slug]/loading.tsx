export default function BlogDetailLoading() {
  return (
    <main className="min-h-screen bg-brand-dark px-6 py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
        <article className="space-y-6">
          <div className="h-6 w-32 animate-pulse rounded-full bg-brand-pink/10" />
          <div className="h-12 w-full max-w-3xl animate-pulse rounded bg-muted-text/15" />
          <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted-text/10" />
          <div className="aspect-[16/7] animate-pulse rounded border border-border-dark bg-off-black" />
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`h-4 animate-pulse rounded bg-muted-text/10 ${
                index % 3 === 0 ? "w-5/6" : "w-full"
              }`}
            />
          ))}
        </article>
        <aside className="hidden space-y-4 lg:block">
          <div className="h-8 w-40 animate-pulse rounded bg-muted-text/15" />
          <div className="h-56 animate-pulse rounded border border-border-dark bg-deep-black" />
        </aside>
      </div>
    </main>
  );
}
