export default function StudentLearningRouteLoading() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="h-[56px] border-b border-border-dark/60 bg-deep-black" />
      <div className="flex h-[calc(100vh-56px)]">
        <aside className="hidden w-[320px] border-r border-border-dark/60 bg-deep-black md:block">
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded bg-muted-text/10" />
            ))}
          </div>
        </aside>
        <main className="flex-1 overflow-hidden p-4 sm:p-6">
          <div className="mx-auto max-w-[900px] space-y-4">
            <div className="space-y-2 border-b border-border-dark/60 pb-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted-text/15" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted-text/10" />
            </div>
            <div className="aspect-video animate-pulse rounded border border-border-dark bg-deep-black" />
            <div className="h-12 animate-pulse rounded border border-border-dark bg-deep-black" />
            <div className="h-24 animate-pulse rounded border border-border-dark bg-deep-black" />
          </div>
        </main>
      </div>
    </div>
  );
}
