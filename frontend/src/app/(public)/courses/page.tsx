import CourseCatalog from '@/features/courses/components/course-catalog';
import { getCatalogCourses } from '@/features/courses/api';
import { Metadata } from 'next';
import { CourseSummary } from '@/features/courses/types';

export const metadata: Metadata = {
  title: 'Danh sách Khóa học | HH Education',
  description: 'Khám phá hệ thống khóa học chất lượng cao từ lớp 9 đến lớp 12 môn Toán, Lý, Hóa, Ngữ Văn, Tiếng Anh. Lộ trình ôn thi THPT hiệu quả.',
  keywords: 'khóa học toán, khóa học lý, khóa học hóa, ôn thi thpt quốc gia, học trực tuyến',
};

export default async function CoursesPage() {
  let courses: CourseSummary[] = [];
  try {
    const data = await getCatalogCourses({ limit: 100 });
    courses = data.items;
  } catch (error) {
    console.error('Error loading courses from API:', error);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Trang chủ',
        'item': 'http://localhost:3000',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Khóa học',
        'item': 'http://localhost:3000/courses',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full">
        <CourseCatalog initialCourses={courses} />
      </div>
    </>
  );
}
