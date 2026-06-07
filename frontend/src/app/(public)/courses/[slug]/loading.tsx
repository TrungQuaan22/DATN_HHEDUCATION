export default function CourseDetailLoading() {
  return (
    <main className="min-h-screen bg-brand-dark pt-20">
      <header className="border-b border-border-dark bg-deep-black py-16 md:py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="h-7 w-40 animate-pulse rounded-full bg-brand-pink/10" />
            <div className="h-14 w-full max-w-2xl animate-pulse rounded bg-muted-text/15" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded bg-muted-text/10" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted-text/10" />
            <div className="flex gap-3">
              <div className="h-11 w-36 animate-pulse rounded bg-brand-pink/20" />
              <div className="h-11 w-32 animate-pulse rounded bg-muted-text/10" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-video animate-pulse rounded border border-border-dark bg-off-black" />
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted-text/15" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded border border-border-dark bg-deep-black" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded border border-border-dark bg-deep-black" />
      </section>
    </main>
  );
}
