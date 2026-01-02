// scripts/seed-lessons.js
// Usage:
// ADMIN_TOKEN=your_token node scripts/seed-lessons.js
// BASE_URL defaults to http://localhost:8000

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

function makeLesson(i) {
  const baseTitle = ['Introduction to Motors','Motor Basics','Motor Circuits','Motor Applications','Advanced Motor Workshop'][i] || `Sample Lesson ${i+1}`;
  const slug = baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^[-]+|[-]+$/g, '');

  return {
    subcourse_id: process.env.SUBCOURSE_ID || 'subcourse-001',
    title: baseTitle,
    slug,
    overview: `Mẫu bài học ${baseTitle} - mô tả ngắn.`,
    status: 'draft',
    objectives: {
      knowledge: 'Hiểu được nguyên lý cơ bản',
      thinking: 'Phân tích và suy luận',
      skills: 'Lắp ráp và kiểm tra',
      attitude: 'An toàn và trách nhiệm'
    },
    models: [
      { title: `${baseTitle} - Model A`, description: 'Mô tả mô hình A', media: [] },
      { title: `${baseTitle} - Model B`, description: 'Mô tả mô hình B', media: [] }
    ],
    preparation: { notes: 'Chuẩn bị các vật dụng...', media: [] },
    builds: [
      { build_type: 'pdf', title: 'Hướng dẫn PDF', description: '', media: [] },
      { build_type: 'images', title: 'Slides', description: '', media: [] }
    ],
    content_blocks: [
      { title: 'Nội dung chính', subtitle: '', description: 'Mô tả', usage_text: 'Sử dụng', example_text: 'Ví dụ', sort_order: 0, media: [] },
      { title: 'Ứng dụng', subtitle: '', description: 'Mô tả ứng dụng', usage_text: 'Sử dụng', example_text: 'Ví dụ', sort_order: 1, media: [] }
    ],
    attachments: [
      { title: 'Attachment PDF', description: 'PDF mẫu', file_type: 'PDF', sort_order: 0, media: [] },
      { title: 'Attachment SB3', description: 'SB3 mẫu', file_type: 'SB3', sort_order: 1, media: [] }
    ],
    challenges: [ { title: 'Thử thách', subtitle: '', description: 'Hoàn thành thử thách', instructions: 'Làm theo các bước', sort_order: 0, media: [] } ],
    quizzes: [
      {
        title: 'Quiz Single',
        description: 'Câu hỏi đơn',
        quiz_type: 'single',
        options: [
          { content: 'Đáp án A', is_correct: true, explanation: 'Giải thích A' },
          { content: 'Đáp án B', is_correct: false, explanation: 'Giải thích B' }
        ]
      },
      {
        title: 'Quiz Multiple',
        description: 'Câu hỏi nhiều đáp án',
        quiz_type: 'multiple',
        options: [
          { content: 'A', is_correct: true, explanation: '...' },
          { content: 'B', is_correct: true, explanation: '...' },
          { content: 'C', is_correct: false, explanation: '...' }
        ]
      }
    ]
  };
}

async function createLesson(lesson) {
  const url = `${BASE_URL.replace(/\/$/, '')}/admin/lessons`;
  const headers = { 'Content-Type': 'application/json' };
  if (ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;

  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(lesson) });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) {
      console.error('Failed:', res.status, data);
      return { ok: false, status: res.status, data };
    }
    console.log('Created:', data.id || data.title || 'OK');
    return { ok: true, data };
  } catch (err) {
    console.error('Error connecting to API:', err.message || err);
    return { ok: false, error: err };
  }
}

(async () => {
  console.log('Seeding lessons to', BASE_URL);
  if (!ADMIN_TOKEN) console.log('Warning: ADMIN_TOKEN not provided; requests may be unauthorized. Set ADMIN_TOKEN env var to use admin API.');
  const results = [];
  for (let i = 0; i < 5; i++) {
    const lesson = makeLesson(i);
    // small delay to avoid hammering
    // eslint-disable-next-line no-await-in-loop
    const r = await createLesson(lesson);
    results.push(r);
  }
  const success = results.filter(r => r.ok).length;
  console.log(`Done. ${success}/${results.length} created.`);
})();
