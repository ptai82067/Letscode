// // /* eslint-disable react/prop-types */
// // /* eslint-disable no-unsafe-finally */
// // /* eslint-disable @typescript-eslint/no-explicit-any */
// // import { useEffect, useState } from 'react';
// // import { useNavigate, useParams } from 'react-router-dom';
// // import PublicLayout from '../../components/layout/PublicLayout';
// // import { publicLessonsAPI } from '../../services/api';
// // import type { Lesson } from '../../types';

// // const MetaBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
// //   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
// //     {children}
// //   </span>
// // );

// // const LessonDetailPublic = () => {
// //   const { lessonId } = useParams();
// //   const navigate = useNavigate();
// //   const [lesson, setLesson] = useState<Lesson | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     let mounted = true;
// //     const load = async () => {
// //       if (!lessonId) return;
// //       setLoading(true);
// //       setError(null);
// //       try {
// //         const data = await publicLessonsAPI.getOne(lessonId);
// //         if (!mounted) return;
// //         setLesson(data);
// //       } catch (err: any) {
// //         if (!mounted) return;
// //         setError(err?.response?.data?.error || err?.message || 'Failed to load lesson');
// //       } finally {
// //         if (!mounted) return;
// //         setLoading(false);
// //       }
// //     };
// //     load();
// //     return () => { mounted = false; };
// //   }, [lessonId]);

// //   if (loading) return (
// //     <PublicLayout>
// //       <div className="container mx-auto px-4 py-20">Loading lesson…</div>
// //     </PublicLayout>
// //   );

// //   if (error || !lesson) return (
// //     <PublicLayout>
// //       <div className="container mx-auto px-4 py-20 text-red-600">Error: {error || 'Lesson not found'}</div>
// //     </PublicLayout>
// //   );

// //   return (
// //     <PublicLayout>
// //       <div className="container mx-auto px-4 py-12">
// //         <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
// //           {lesson.media && lesson.media.length > 0 && (
// //             <div className="h-64 md:h-96 bg-gray-100">
// //               <img src={lesson.media[0].url} alt={lesson.title} className="w-full h-full object-cover" />
// //             </div>
// //           )}

// //           <div className="p-8 md:p-12">
// //             <div className="flex items-start justify-between">
// //               <div>
// //                 <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{lesson.title}</h1>
// //                 {lesson.subtitle && <p className="text-lg text-gray-600 mb-4">{lesson.subtitle}</p>}

// //                 <div className="flex flex-wrap gap-2">
// //                   {(lesson as any).duration && <MetaBadge>{(lesson as any).duration} phút</MetaBadge>}
// //                   {(lesson as any).type && <MetaBadge>{(lesson as any).type}</MetaBadge>}
// //                   {(lesson as any).grade && <MetaBadge>Lớp {(lesson as any).grade}</MetaBadge>}
// //                 </div>
// //               </div>

// //               <div className="flex-shrink-0">
// //                 <button onClick={() => navigate(-1)} className="px-4 py-2 mr-2 border rounded-md bg-white hover:bg-gray-50">
// //                   Quay lại
// //                 </button>
// //                 <a href={(lesson as any).source_url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md">
// //                   Mở tài liệu
// //                 </a>
// //               </div>
// //             </div>

// //             {lesson.overview && <div className="prose max-w-none mt-6">{lesson.overview}</div>}

// //             {(lesson as any).objectives && (
// //               <section className="mt-8">
// //                 <h2 className="text-2xl font-semibold">Mục tiêu</h2>
// //                 <div className="mt-3 text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: (lesson as any).objectives || '' }} />
// //               </section>
// //             )}

// //             <div className="mt-8 grid md:grid-cols-3 gap-6">
// //               <div className="md:col-span-2">
// //                 <section>
// //                   <h3 className="text-xl font-semibold mb-3">Nội dung bài học</h3>
// //                   <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: (lesson as any).content || '' }} />
// //                 </section>
// //               </div>

// //               <aside className="bg-gray-50 p-4 rounded-lg">
// //                 <h4 className="font-semibold mb-2">Tài nguyên</h4>
// //                 <div className="space-y-2 text-sm">
// //                   {lesson.media && lesson.media.length > 0 ? (
// //                     lesson.media.map((m: any) => (
// //                       <a key={m.id || m.url} href={m.url} target="_blank" rel="noreferrer" className="block text-indigo-600 hover:underline">
// //                         {m.filename || m.url}
// //                       </a>
// //                     ))
// //                   ) : (
// //                     <div className="text-gray-500">Không có tài nguyên</div>
// //                   )}
// //                 </div>
// //               </aside>
// //             </div>

// //             {lesson.media && lesson.media.length > 1 && (
// //               <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
// //                 {lesson.media.slice(1).map((m: any) => (
// //                   <div key={m.id || m.url} className="bg-white rounded shadow">
// //                     {m.type && m.type.startsWith('image') ? (
// //                       <img src={m.url} alt={m.filename || 'media'} className="w-full h-44 object-cover rounded-t" />
// //                     ) : (
// //                       <div className="h-44 flex items-center justify-center text-sm text-gray-600">{m.filename || m.url}</div>
// //                     )}
// //                     <div className="p-3 text-sm">
// //                       <a href={m.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Mở</a>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </PublicLayout>
// //   );
// // };

// // export default LessonDetailPublic;
// /* eslint-disable react/prop-types */
// /* eslint-disable no-unsafe-finally */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import PublicLayout from '../../components/layout/PublicLayout';
// import { publicLessonsAPI } from '../../services/api';
// import type { Lesson } from '../../types';

// const MetaBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
//     {children}
//   </span>
// );

// const LessonDetailPublic = () => {
//   const { lessonId } = useParams();
//   const navigate = useNavigate();
//   const [lesson, setLesson] = useState<Lesson | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       if (!lessonId) return;
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await publicLessonsAPI.getOne(lessonId);
//         if (!mounted) return;
//         setLesson(data);
//       } catch (err: any) {
//         if (!mounted) return;
//         setError(err?.response?.data?.error || err?.message || 'Failed to load lesson');
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     };
//     load();
//     return () => { mounted = false; };
//   }, [lessonId]);

//   if (loading) return (
//     <PublicLayout>
//       <div className="container mx-auto px-4 py-24 text-center text-gray-500">Đang tải bài học…</div>
//     </PublicLayout>
//   );

//   if (error || !lesson) return (
//     <PublicLayout>
//       <div className="container mx-auto px-4 py-24 text-center text-red-600">{error || 'Không tìm thấy bài học'}</div>
//     </PublicLayout>
//   );

//   return (
//     <PublicLayout>
//       <div className="bg-slate-50">
//         {/* HERO */}
//         <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600">
//           {lesson.media?.[0] && (
//             <img
//               src={lesson.media[0].url}
//               alt={lesson.title}
//               className="absolute inset-0 w-full h-full object-cover opacity-20"
//             />
//           )}
//           <div className="relative container mx-auto px-4 py-20 text-white">
//             <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{lesson.title}</h1>
//             {lesson.subtitle && (
//               <p className="max-w-3xl text-lg text-indigo-100 mb-6">{lesson.subtitle}</p>
//             )}
//             <div className="flex flex-wrap gap-3">
//               {(lesson as any).duration && <MetaBadge>{(lesson as any).duration} phút</MetaBadge>}
//               {(lesson as any).type && <MetaBadge>{(lesson as any).type}</MetaBadge>}
//               {(lesson as any).grade && <MetaBadge>Lớp {(lesson as any).grade}</MetaBadge>}
//             </div>
//           </div>
//         </div>

//         {/* CONTENT */}
//         <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* MAIN */}
//           <main className="lg:col-span-3 bg-white rounded-2xl shadow p-8">
//             {lesson.overview && (
//               <section className="mb-10">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-3">Tổng quan</h2>
//                 <div className="prose max-w-none text-gray-700">{lesson.overview}</div>
//               </section>
//             )}

//             {(lesson as any).objectives && (
//               <section className="mb-10">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-3">Mục tiêu</h2>
//                 <div
//                   className="prose max-w-none text-gray-700"
//                   dangerouslySetInnerHTML={{ __html: (lesson as any).objectives }}
//                 />
//               </section>
//             )}

//             <section>
//               <h2 className="text-2xl font-bold text-gray-800 mb-3">Nội dung bài học</h2>
//               <div
//                 className="prose max-w-none text-gray-800"
//                 dangerouslySetInnerHTML={{ __html: (lesson as any).content || '' }}
//               />
//             </section>
//           </main>

//           {/* SIDEBAR */}
//           <aside className="bg-white rounded-2xl shadow p-6 h-fit">
//             <h3 className="font-bold text-gray-800 mb-4">Tài nguyên</h3>
//             <div className="space-y-3 text-sm">
//               {lesson.media && lesson.media.length > 0 ? (
//                 lesson.media.map((m: any) => (
//                   <a
//                     key={m.id || m.url}
//                     href={m.url}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="block px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
//                   >
//                     {m.filename || m.url}
//                   </a>
//                 ))
//               ) : (
//                 <div className="text-gray-500">Không có tài nguyên</div>
//               )}
//             </div>

//             <div className="mt-6 flex gap-2">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
//               >
//                 ← Quay lại
//               </button>
//               <a
//                 href={(lesson as any).source_url || '#'}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="flex-1 text-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
//               >
//                 Mở tài liệu
//               </a>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </PublicLayout>
//   );
// };

// export default LessonDetailPublic;

/* eslint-disable react/prop-types */
/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { publicLessonsAPI } from '../../services/api';
import type { Lesson } from '../../types';
import { resolveMediaUrl } from '../../utils/media';

const MetaBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
    {children}
  </span>
);

const LessonDetailPublic = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!lessonId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await publicLessonsAPI.getOne(lessonId);
        if (!mounted) return;
        setLesson(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load lesson'
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [lessonId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-24 text-center text-gray-500">
          Đang tải bài học…
        </div>
      </PublicLayout>
    );
  }

  if (error || !lesson) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-24 text-center text-red-600">
          {error || 'Không tìm thấy bài học'}
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-slate-50">

        {/* ================= HERO ================= */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">

          {/* Mascot Hero */}
          <img
            src="/assets/sprites/mascot/leco game 16.png"
            alt=""
            className="hidden lg:block absolute right-6 bottom-0 w-[420px] pointer-events-none"
          />

          <div className="relative container mx-auto px-4 py-20 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              {lesson.title}
            </h1>

            {lesson.subtitle && (
              <p className="max-w-3xl text-lg text-indigo-100 mb-6">
                {lesson.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {(lesson as any).duration && (
                <MetaBadge>{(lesson as any).duration} phút</MetaBadge>
              )}
              {(lesson as any).type && (
                <MetaBadge>{(lesson as any).type}</MetaBadge>
              )}
              {(lesson as any).grade && (
                <MetaBadge>Lớp {(lesson as any).grade}</MetaBadge>
              )}
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* MAIN CONTENT */}
          <main className="lg:col-span-3 bg-white rounded-2xl shadow p-8">

            {lesson.overview && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Tổng quan
                </h2>
                <div className="prose max-w-none text-gray-700">
                  {lesson.overview}
                </div>
              </section>
            )}

            {(lesson as any).objectives && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Mục tiêu
                </h2>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: (lesson as any).objectives,
                  }}
                />
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Nội dung bài học
              </h2>
              <div
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: (lesson as any).content || '',
                }}
              />
            </section>
          </main>

          {/* SIDEBAR */}
          <aside className="relative bg-white rounded-2xl shadow p-6 h-fit overflow-hidden">

            {/* Mascot Sidebar */}
            <img
              src="/assets/sprites/mascot/Asset 8.png"
              alt=""
              className="absolute -top-6 -right-6 w-36 opacity-20 pointer-events-none"
            />

            <h3 className="font-bold text-gray-800 mb-4 relative z-10">
              Tài nguyên
            </h3>

            <div className="space-y-3 text-sm relative z-10">
              {lesson.media && lesson.media.length > 0 ? (
                lesson.media.map((m: any) => (
                  <a
                    key={m.id || m.url}
                    href={resolveMediaUrl(m.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    {m.filename || m.url}
                  </a>
                ))
              ) : (
                <div className="text-gray-500">
                  Không có tài nguyên
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-2 relative z-10">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Quay lại
              </button>
              <a
                href={(lesson as any).source_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Mở tài liệu
              </a>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LessonDetailPublic;
