import { Program, Subcourse, Lesson } from '../types';

export const programs: Program[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Chương trình Lập trình Cơ bản cho Thiếu nhi',
    slug: 'lap-trinh-co-ban',
    short_description: 'Học lập trình cơ bản, logic và tư duy giải quyết vấn đề dành cho trẻ em',
    description: 'Khóa học này giúp học sinh làm quen với tư duy thuật toán, cấu trúc lệnh và xây dựng dự án nhỏ bằng ngôn ngữ thân thiện.',
    block_types: ['cover', 'text', 'video'],
    status: 'published',
    sort_order: 1,
    subcourse_count: 3,
    media: [
      { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
      { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', mime_type: 'video/mp4', purpose: 'intro', sort_order: 2 },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Chương trình Sáng tạo STEM',
    slug: 'sang-tao-stem',
    short_description: 'Kết hợp Khoa học, Công nghệ, Kỹ thuật và Toán học qua dự án thực hành',
    description: 'Khóa học theo dự án, khuyến khích tư duy sáng tạo và hợp tác, phù hợp cho học sinh tiểu học và trung học cơ sở.',
    block_types: ['cover', 'text', 'video'],
    status: 'published',
    sort_order: 2,
    subcourse_count: 3,
    media: [
      { url: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
      { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', mime_type: 'video/mp4', purpose: 'intro', sort_order: 2 },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Chương trình Khoa học Tự nhiên cho Thiếu nhi',
    slug: 'khoa-hoc-tu-nhien',
    short_description: 'Khám phá thế giới tự nhiên qua thí nghiệm và hoạt động thực tế',
    description: 'Loạt bài hướng dẫn thí nghiệm đơn giản, an toàn, giúp học sinh hiểu các khái niệm khoa học cơ bản.',
    block_types: ['cover', 'text', 'video'],
    status: 'published',
    sort_order: 3,
    subcourse_count: 3,
    media: [
      { url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
      { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', mime_type: 'video/mp4', purpose: 'intro', sort_order: 2 },
    ],
  },
];

export const subcourses: Subcourse[] = [
  {
    id: 'a1-1111-0001',
    program_id: programs[0].id!,
    name: 'Lập trình - Phần 1: Giới thiệu',
    slug: 'lap-trinh-phan-1',
    age_range: '8-10',
    lesson_count: 4,
    short_description: 'Làm quen với khái niệm thuật toán và lệnh cơ bản',
    block_types: ['text', 'video'],
    status: 'published',
    sort_order: 1,
    media: [
      { url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
      { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', mime_type: 'video/mp4', purpose: 'intro', sort_order: 2 },
    ],
  },
  {
    id: 'a1-1111-0002',
    program_id: programs[0].id!,
    name: 'Lập trình - Phần 2: Thực hành',
    slug: 'lap-trinh-phan-2',
    age_range: '8-12',
    lesson_count: 4,
    short_description: 'Thực hành viết chương trình đơn giản và trò chơi nhỏ',
    block_types: ['text', 'video'],
    status: 'published',
    sort_order: 2,
    media: [
      { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
    ],
  },
  {
    id: 'b2-2222-0001',
    program_id: programs[1].id!,
    name: 'STEM - Phần 1: Khởi đầu dự án',
    slug: 'stem-phan-1',
    age_range: '9-13',
    lesson_count: 4,
    short_description: 'Xây dựng ý tưởng dự án và phân công nhóm',
    block_types: ['text', 'video'],
    status: 'published',
    sort_order: 1,
    media: [
      { url: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
    ],
  },
  {
    id: 'c3-3333-0001',
    program_id: programs[2].id!,
    name: 'Khoa học - Phần 1: Thí nghiệm nước',
    slug: 'khoa-hoc-phan-1',
    age_range: '8-12',
    lesson_count: 4,
    short_description: 'Thí nghiệm về nước, hiện tượng và an toàn phòng thí nghiệm',
    block_types: ['text', 'video'],
    status: 'published',
    sort_order: 1,
    media: [
      { url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
    ],
  },
];

export const lessons: Lesson[] = [];

// Generate lessons for each subcourse programmatically for convenience
subcourses.forEach((s) => {
  for (let i = 1; i <= (s.lesson_count || 4); i++) {
    const lesson: Lesson = {
      subcourse_id: s.id!,
      title: `Bài ${i}: ${s.name}`,
      subtitle: 'Bài học mẫu bằng tiếng Việt',
      overview: 'Nội dung minh họa: phần giải thích, ví dụ và bài tập thực hành. File tài liệu kèm theo PDF.',
      block_types: ['text', 'video', 'file'],
      status: 'published',
      sort_order: i,
      slug: `${s.slug}-bai-${i}`,
      media: [
        { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', mime_type: 'image/jpeg', purpose: 'cover', sort_order: 1 },
        { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', mime_type: 'video/mp4', purpose: 'intro', sort_order: 2 },
        { url: 'https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf', mime_type: 'application/pdf', purpose: 'main', sort_order: 3 },
      ],
    };
    lessons.push(lesson);
  }
});

export default { programs, subcourses, lessons };
