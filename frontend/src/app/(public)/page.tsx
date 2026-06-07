import HeroSection from "@/features/landing/components/hero-section";
import TeachersSection from "@/features/landing/components/teachers-section";
import FeaturedCoursesSection from "@/features/landing/components/featured-courses-section";
import ReviewsSection from "@/features/landing/components/reviews-section";
import BlogPreviewSection from "@/features/landing/components/blog-preview-section";
import AboutSection from "@/features/landing/components/about-section";
import FinalCTA from "@/features/landing/components/final-cta";
import { ScrollReveal } from "@/components/layout/scroll-reveal";

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* 1. Hero Carousel Section */}
      <HeroSection />

      {/* 2. Teacher Profile Slider Section */}
      <TeachersSection />

      {/* 3. Featured Courses Section */}
      <ScrollReveal>
        <FeaturedCoursesSection />
      </ScrollReveal>

      {/* 4. Student Reviews Section */}
      <ScrollReveal>
        <ReviewsSection />
      </ScrollReveal>

      {/* 5. Knowledge Sharing (Blog) Section */}
      <ScrollReveal>
        <BlogPreviewSection />
      </ScrollReveal>

      {/* 6. Who We Are & What We Offer Section */}
      <ScrollReveal>
        <AboutSection />
      </ScrollReveal>

      {/* 7. Final CTA Section */}
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </div>
  );
}
