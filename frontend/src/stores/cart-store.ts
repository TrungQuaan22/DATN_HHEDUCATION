import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CourseSummary } from '@/features/courses/types';

export type CartItem = {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  thumbnailUrl: string | null;
  teacherName: string;
  subject: string;
  grade: number;
};

type CartState = {
  items: CartItem[];
  addItem: (course: CourseSummary) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (course) => {
        const items = get().items;
        const exists = items.some((item) => item.id === course.id);
        if (!exists) {
          set({
            items: [
              ...items,
              {
                id: course.id,
                title: course.title,
                slug: course.slug,
                price: course.price,
                salePrice: course.salePrice,
                thumbnailUrl: course.thumbnailUrl,
                teacherName: course.teacher.fullName,
                subject: course.subject,
                grade: course.grade,
              },
            ],
          });
        }
      },
      removeItem: (courseId) => {
        set({
          items: get().items.filter((item) => item.id !== courseId),
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'hh-education-cart-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (null as any))),
    }
  )
);
