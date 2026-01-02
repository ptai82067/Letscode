/**
 * TEST DATA: Sample "Introduction to Motors" Lesson
 * Full structure with all 8+ nested types
 */

export const introductionToMotorsLesson = {
  subcourse_id: "subcourse-001", // Cần thay bằng ID thực tế
  title: "Introduction to Motors",
  slug: "introduction-to-motors",
  overview: "Bài học này giới thiệu các khái niệm cơ bản về động cơ, cách thức hoạt động, và các ứng dụng thực tế.",
  status: "draft" as const,

  // Objectives: 1 object với 4 fields
  objectives: {
    knowledge: "Hiểu được cấu tạo và nguyên lý hoạt động của động cơ điện",
    thinking: "Phân tích mối quan hệ giữa lý thuyết và thực hành trong ứng dụng động cơ",
    skills: "Lắp ráp và kiểm tra động cơ đơn giản bằng các vật liệu sẵn có",
    attitude: "Phát triển tính cẩn thận và trách nhiệm khi làm việc với thiết bị điện"
  },

  // Models: 2 items
  models: [
    {
      title: "Motor Basics Model",
      description: "Mô hình cơ bản về cấu tạo của động cơ điện DC",
      media: [] // Thêm file upload khi tạo từ UI
    },
    {
      title: "Motor Circuits Model",
      description: "Mô hình mạch điện điều khiển động cơ",
      media: []
    }
  ],

  // Preparation: 1 object
  preparation: {
    notes: "Chuẩn bị các vật dụng sau:\n1. Động cơ DC nhỏ\n2. Pin AA\n3. Dây dẫn\n4. Công tắc\n5. Cọ than\nKiểm tra an toàn điện trước khi bắt đầu",
    media: []
  },

  // Builds: 2 items
  builds: [
    {
      title: "Assembly Instructions (PDF)",
      description: "Hướng dẫn từng bước lắp ráp động cơ",
      build_type: "pdf" as const,
      media: []
    },
    {
      title: "Visual Slides",
      description: "Bộ ảnh minh hoạ chi tiết các bước lắp ráp",
      build_type: "images" as const,
      media: []
    }
  ],

  // Content Blocks: 2 items
  content_blocks: [
    {
      title: "How Electric Motors Work",
      subtitle: "Nguyên lý hoạt động",
      description: "Giải thích chi tiết về từ trường và lực Lorentz",
      usage_text: "Dùng cho phần lý thuyết chính của bài học",
      example_text: "Ví dụ: Khi dòng điện chạy qua cuộn dây trong từ trường, nó sẽ tạo ra lực làm quay cuộn dây",
      sort_order: 0,
      media: []
    },
    {
      title: "Common Motor Applications",
      subtitle: "Ứng dụng thực tế",
      description: "Các ứng dụng của động cơ trong đời sống hàng ngày",
      usage_text: "Dùng làm phần kết nối đến ứng dụng thực tế",
      example_text: "Ví dụ: Quạt, máy giặt, ô tô, máy bay không người lái",
      sort_order: 1,
      media: []
    }
  ],

  // Attachments: 2 items
  attachments: [
    {
      title: "Motor Assembly Code",
      description: "Mã Scratch để lập trình điều khiển động cơ",
      file_type: "SB3",
      sort_order: 0,
      media: []
    },
    {
      title: "Circuit Diagram (PDF)",
      description: "Sơ đồ mạch điện hoàn chỉnh",
      file_type: "PDF",
      sort_order: 1,
      media: []
    }
  ],

  // Challenges: 1 item
  challenges: [
    {
      title: "Build a Simple Motor",
      subtitle: "Thử thách lắp ráp",
      description: "Học viên cần lắp ráp một động cơ hoạt động từ các bộ phận được cung cấp",
      instructions: "1. Chuẩn bị các vật liệu theo danh sách\n2. Theo hướng dẫn từng bước\n3. Kiểm tra motor có quay không\n4. Điều chỉnh nếu cần thiết",
      sort_order: 0,
      media: []
    }
  ],

  // Quizzes: 2 items
  quizzes: [
    {
      title: "What is the main principle of an electric motor?",
      description: "Câu hỏi về nguyên lý hoạt động của động cơ điện",
      quiz_type: "single" as const,
      options: [
        {
          content: "Từ trường và lực Lorentz",
          is_correct: true,
          explanation: "Chính xác! Động cơ hoạt động dựa trên lực từ trường tác dụng lên dòng điện trong cuộn dây"
        },
        {
          content: "Lực ma sát",
          is_correct: false,
          explanation: "Không đúng. Lực ma sát không phải là nguyên lý chính của động cơ"
        },
        {
          content: "Áp suất chất lỏng",
          is_correct: false,
          explanation: "Không đúng. Đó là nguyên lý của động cơ thuỷ lực, không phải động cơ điện"
        }
      ]
    },
    {
      title: "Which of the following are common motor applications? (Select all that apply)",
      description: "Câu hỏi về ứng dụng của động cơ",
      quiz_type: "multiple" as const,
      options: [
        {
          content: "Quạt điện",
          is_correct: true,
          explanation: "Đúng! Quạt điện sử dụng động cơ để quay lưới"
        },
        {
          content: "Bàn chải",
          is_correct: false,
          explanation: "Bàn chải không sử dụng động cơ điện"
        },
        {
          content: "Máy giặt",
          is_correct: true,
          explanation: "Đúng! Máy giặt sử dụng động cơ để quay lồng giặt"
        },
        {
          content: "Ô tô",
          is_correct: true,
          explanation: "Đúng! Ô tô điện sử dụng động cơ điện"
        }
      ]
    }
  ]
};
