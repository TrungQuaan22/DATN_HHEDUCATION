"use client";

import { Star } from "lucide-react";

export default function ReviewsSection() {
  const reviews = [
    {
      name: "Ngọc Tú",
      class: "Lớp 12A1, THPT Chuyên",
      badge: "9.2 Ngữ Văn - THPTQG 2024",
      badgeColorClass: "bg-brand-pink/10 text-brand-pink border-brand-pink/30",
      avatarUrl:
        "https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/626027687_934967042325550_3654724351854008020_n.jpg?stp=dst-jpg_tt6&cstp=mx1152x1152&ctp=s1152x1152&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=KKlPZDJzrcAQ7kNvwEaFtMo&_nc_oc=AdrZyCsRUmGxkOAwPREoKkMBMFsi4Lec4DuWzwB-lHp09ujWjdUCaCiUcTNfh92TsXc&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=fg_QCfrw8dtEQgu7yN6cvQ&_nc_ss=7b2a8&oh=00_AQBUjqKEMAiYAjEgnoF60CgXVZfX66_lODUq67QK2dsR7Q&oe=6A4965B2",
      quote:
        '"Nhờ phương pháp dạy của cô Hà, em đã bứt phá từ 6 điểm lên 9.2 điểm Ngữ Văn trong kỳ thi vừa rồi. Cách giảng bài rất truyền cảm hứng!"',
      rating: 5,
    },
    {
      name: "Hoàng Minh",
      class: "Đại học Bách Khoa HN",
      badge: "9.8 Toán - THPTQG 2024",
      badgeColorClass: "bg-sky-blue/10 text-sky-blue border-sky-blue/30",
      avatarUrl:
        "https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/626027687_934967042325550_3654724351854008020_n.jpg?stp=dst-jpg_tt6&cstp=mx1152x1152&ctp=s1152x1152&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=KKlPZDJzrcAQ7kNvwEaFtMo&_nc_oc=AdrZyCsRUmGxkOAwPREoKkMBMFsi4Lec4DuWzwB-lHp09ujWjdUCaCiUcTNfh92TsXc&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=fg_QCfrw8dtEQgu7yN6cvQ&_nc_ss=7b2a8&oh=00_AQBUjqKEMAiYAjEgnoF60CgXVZfX66_lODUq67QK2dsR7Q&oe=6A4965B2",
      quote:
        '"Kho đề luyện tập cực kỳ sát với đề thi thật. Lời giải chi tiết giúp em hiểu rõ bản chất vấn đề chứ không chỉ là học vẹt."',
      rating: 5,
    },
    {
      name: "Anh Linh",
      class: "Học sinh lớp 11",
      badge: "9.0 Tiếng Anh - THPTQG 2024",
      badgeColorClass: "bg-brand-pink/10 text-brand-pink border-brand-pink/30",
      avatarUrl:
        "https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/626027687_934967042325550_3654724351854008020_n.jpg?stp=dst-jpg_tt6&cstp=mx1152x1152&ctp=s1152x1152&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=KKlPZDJzrcAQ7kNvwEaFtMo&_nc_oc=AdrZyCsRUmGxkOAwPREoKkMBMFsi4Lec4DuWzwB-lHp09ujWjdUCaCiUcTNfh92TsXc&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=fg_QCfrw8dtEQgu7yN6cvQ&_nc_ss=7b2a8&oh=00_AQBUjqKEMAiYAjEgnoF60CgXVZfX66_lODUq67QK2dsR7Q&oe=6A4965B2",
      quote:
        '"Giao diện học tập hiện đại, mượt mà. Em có thể học mọi lúc mọi nơi trên điện thoại, rất tiện lợi cho học sinh cuối cấp."',
      rating: 4.5,
    },
  ];

  return (
    <section className="py-24 bg-brand-dark">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-[700] text-cream mb-4">
            Cảm nhận từ học viên
          </h2>
          <p className="text-base text-muted-taupe max-w-2xl mx-auto">
            Những kết quả thực tế là niềm tự hào lớn nhất của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-deep-black p-8 rounded border border-border-dark shadow-l2 space-y-4"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  alt={rev.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-pink"
                  src={rev.avatarUrl}
                />
                <div>
                  <div className="text-base font-bold text-cream">
                    {rev.name}
                  </div>
                  <div className="text-xs text-muted-taupe">
                    {rev.class}
                  </div>
                </div>
              </div>

              <div
                className={`inline-block px-3 py-1 border rounded-full text-xs font-bold mb-4 ${rev.badgeColorClass}`}
              >
                {rev.badge}
              </div>

              <div className="flex text-accent-orange gap-0.5">
                {[...Array(5)].map((_, sIdx) => {
                  const starVal = sIdx + 1;
                  return (
                    <Star
                      key={sIdx}
                      size={18}
                      className={
                        starVal <= rev.rating
                          ? "fill-accent-orange stroke-accent-orange"
                          : "stroke-accent-orange fill-transparent"
                      }
                    />
                  );
                })}
              </div>

              <p className="text-sm text-muted-taupe italic leading-relaxed">
                {rev.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
