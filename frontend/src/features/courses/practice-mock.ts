export interface MockQuestion {
  id: string;
  content: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  score: number;
  totalScore: number;
  questionCount: number;
  date: string;
}

export const mockQuestionsData: Record<string, MockQuestion[]> = {
  math: [
    {
      id: "q-math-1",
      content: "Tìm tập xác định D của hàm số y = log2(x - 3).",
      options: [
        { key: "A", text: "D = (3; +∞)" },
        { key: "B", text: "D = [3; +∞)" },
        { key: "C", text: "D = R \\ {3}" },
        { key: "D", text: "D = (0; +∞)" },
      ],
      correctAnswer: "A",
      explanation:
        "Điều kiện xác định của hàm số logarit y = log2(u) là u > 0. Do đó x - 3 > 0 <=> x > 3. Vậy D = (3; +∞).",
    },
    {
      id: "q-math-2",
      content: "Tính đạo hàm của hàm số y = e^(2x).",
      options: [
        { key: "A", text: "y' = e^(2x)" },
        { key: "B", text: "y' = 2e^(2x)" },
        { key: "C", text: "y' = 2x * e^(2x-1)" },
        { key: "D", text: "y' = 0.5e^(2x)" },
      ],
      correctAnswer: "B",
      explanation:
        "Công thức đạo hàm hàm hợp (e^u)' = u' * e^u. Với u = 2x thì u' = 2. Vậy y' = 2 * e^(2x).",
    },
    {
      id: "q-math-3",
      content:
        "Cho khối chóp có diện tích đáy B = 6 và chiều cao h = 4. Thể tích V của khối chóp đã cho bằng bao nhiêu?",
      options: [
        { key: "A", text: "V = 24" },
        { key: "B", text: "V = 12" },
        { key: "C", text: "V = 8" },
        { key: "D", text: "V = 72" },
      ],
      correctAnswer: "C",
      explanation: "Thể tích khối chóp V = 1/3 * B * h = 1/3 * 6 * 4 = 8.",
    },
  ],
  literature: [
    {
      id: "q-lit-1",
      content: "Từ Hán Việt 'Vọng phu' có nghĩa là gì?",
      options: [
        { key: "A", text: "Người vợ mong ngóng chồng" },
        { key: "B", text: "Người chồng mong ngóng vợ" },
        { key: "C", text: "Tên một địa danh nổi tiếng" },
        { key: "D", text: "Người con nhớ thương cha mẹ" },
      ],
      correctAnswer: "A",
      explanation:
        "'Vọng' có nghĩa là trông ngóng, 'phu' có nghĩa là người chồng. Vọng phu nghĩa là người vợ ngóng trông chồng đi lính hoặc đi xa không về.",
    },
    {
      id: "q-lit-2",
      content:
        "Tác phẩm 'Chữ người tử tù' của Nguyễn Tuân thuộc tập truyện nào sau đây?",
      options: [
        { key: "A", text: "Sông Đà" },
        { key: "B", text: "Vang bóng một thời" },
        { key: "C", text: "Chiếc lư đồng mắt cua" },
        { key: "D", text: "Đường vui" },
      ],
      correctAnswer: "B",
      explanation:
        "'Chữ người tử tù' ban đầu có tên là 'Dòng chữ cuối cùng', đăng trên tạp chí Tao Đàn năm 1939, sau đó được in trong tập truyện 'Vang bóng một thời' (1940).",
    },
    {
      id: "q-lit-3",
      content:
        "Biện pháp tu từ nào được sử dụng chủ yếu trong câu thơ: 'Mặt trời của bắp thì nằm trên đồi / Mặt trời của mẹ, em nằm trên lưng'?",
      options: [
        { key: "A", text: "So sánh" },
        { key: "B", text: "Ẩn dụ" },
        { key: "C", text: "Hoán dụ" },
        { key: "D", text: "Nhân hóa" },
      ],
      correctAnswer: "B",
      explanation:
        "Hình ảnh 'Mặt trời của mẹ' là hình ảnh ẩn dụ chỉ đứa con - nguồn sáng, nguồn sống và niềm hy vọng lớn lao nhất đời người mẹ.",
    },
  ],
  english: [
    {
      id: "q-eng-1",
      content: "She ________ in Hanoi since she graduated from university.",
      options: [
        { key: "A", text: "lives" },
        { key: "B", text: "has lived" },
        { key: "C", text: "lived" },
        { key: "D", text: "is living" },
      ],
      correctAnswer: "B",
      explanation:
        "Dấu hiệu nhận biết 'since + mốc thời gian quá khứ' chia động từ ở thì Hiện tại hoàn thành (Present Perfect): S + has/have + V3/ed.",
    },
    {
      id: "q-eng-2",
      content: "Find the synonym of the word 'INTELLIGENT'.",
      options: [
        { key: "A", text: "Smart" },
        { key: "B", text: "Lazy" },
        { key: "C", text: "Beautiful" },
        { key: "D", text: "Slow" },
      ],
      correctAnswer: "A",
      explanation:
        "'Intelligent' có nghĩa là thông minh, đồng nghĩa với 'Smart'.",
    },
    {
      id: "q-eng-3",
      content: "If it ________ tomorrow, we will cancel the outdoor picnic.",
      options: [
        { key: "A", text: "rain" },
        { key: "B", text: "rains" },
        { key: "C", text: "will rain" },
        { key: "D", text: "rained" },
      ],
      correctAnswer: "B",
      explanation:
        "Đây là câu điều kiện loại 1 (Conditional Sentence Type 1). Mệnh đề If chia ở thì Hiện tại đơn: If + S + V(s/es). Chủ ngữ 'it' đi với động từ thêm 's': rains.",
    },
  ],
};

export const SUBJECT_LABELS: Record<string, string> = {
  math: "Toán Học",
  literature: "Ngữ Văn",
  english: "Anh Văn",
};
