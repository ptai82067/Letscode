/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { publicLessonsAPI } from '../../services/api';
import type { Lesson } from '../../types';
import { routes } from '../../routes';
import { resolveMediaUrl } from '../../utils/media';

/* =======================
   IMPORT MASCOT ASSETS
   ======================= */
import heroMascot from '../../assets/sprites/mascot/leco game 16.png';
import listMascot from '../../assets/sprites/mascot/leco game 3.png';
import emptyMascot from '../../assets/sprites/mascot/Asset 8.png';

export default function ListLesson() {
  const params = useParams();
  const subcourseId = params.subcourseId as string | undefined;
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = subcourseId
          ? await publicLessonsAPI.getBySubcourse(subcourseId)
          : await publicLessonsAPI.getAll();
        if (!mounted) return;
        setLessons(data || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load lessons');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [subcourseId]);

  return (
    <PublicLayout>
      {/* ================= HERO ================= */}
     <section className="relative pt-24 pb-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 overflow-hidden">
  {/* Mascot decor */}
  <img
    src={heroMascot}
    alt=""
    className="
      absolute
      right-12
      top-20
      w-64
      opacity-20
      pointer-events-none
      select-none
    "
  />

  <div className="container mx-auto px-6 relative z-10">
    <h1 className="text-5xl font-extrabold text-white mb-4">
      Bài học
    </h1>
    <p className="max-w-xl text-white/90 text-lg">
      Học từng bước với nội dung có cấu trúc giúp bạn tiến bộ.
    </p>
  </div>
</section>


      {/* ================= CONTENT ================= */}
      <section className="container mx-auto px-6 relative z-10 -mt-28 pb-28">
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">

          {/* Decorative mascot (branding nhẹ, không lấn nội dung) */}
          <img
            src={listMascot}
            alt=""
            className="
              hidden md:block
              absolute
              -top-6
              -right-6
              w-32
              opacity-10
              pointer-events-none
            "
          />

          {/* HEADER */}
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Tổng quan bài học
            </h2>
          </div>

          {/* STATES */}
          {loading ? (
            <div className="text-gray-500">Đang tải bài học…</div>
          ) : error ? (
            <div className="text-red-600">Error: {error}</div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-gray-600">
              <img
                src={emptyMascot}
                alt=""
                className="w-40 opacity-80"
              />
              <div>Không có bài học.</div>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              {lessons.map((l, index) => (
                <div
                  key={l.id}
                  onClick={() => navigate(routes.lesson(l.id as string))}
                  className="
                    group
                    cursor-pointer
                    flex items-center gap-6
                    rounded-2xl
                    border border-gray-100
                    p-5
                    bg-white
                    hover:shadow-xl
                    transition
                  "
                >
                  {/* INDEX */}
                  <div className="hidden md:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* THUMBNAIL */}
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {l.media && l.media[0] ? (
                      <img
                        src={resolveMediaUrl(l.media[0].url)}
                        alt={l.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        🎯
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                      {l.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {l.overview || l.subtitle || ''}
                    </p>
                  </div>

                  {/* CTA */}
                    <div className="hidden sm:flex items-center gap-2 text-indigo-600 font-medium">
                    Xem bài học
                    <span className="text-xl">→</span>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
