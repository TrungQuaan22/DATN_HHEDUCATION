import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import SmoothScroll from '@/components/layout/smooth-scroll';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen bg-brand-dark">
        <SiteHeader />
        <main className="flex-grow w-full">
          {children}
        </main>
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
