/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import CourseCard from '../../components/students/CourseCard';
import { publicSubcoursesAPI } from '../../services/api';
import type { Subcourse } from '../../types';
import { routes } from '../../routes';

/* ===== MASCOT ASSETS ===== */
import heroMascot from '../../assets/sprites/mascot/leco game 16.png';
import emptyMascot from '../../assets/sprites/mascot/Asset 8.png';

export default function ProgramSubcourses() {
  const params = useParams();
  const programId = params.programId as string | undefined;
  const [subcourses, setSubcourses] = useState<Subcourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!programId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await publicSubcoursesAPI.getByProgram(programId);
        if (!mounted) return;
        setSubcourses(data || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load subcourses');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [programId]);

  return (
    <PublicLayout>
      {/* ================= HERO ================= */}
      {/* ================= HERO ================= */}
<section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700">
  <div className="container mx-auto px-6 pt-32 pb-24 text-white relative flex items-center">

    {/* TEXT */}
    <div className="max-w-2xl z-10">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
        Chương trình học
      </h1>
      <p className="text-lg text-white/90">
        Chọn một khóa để bắt đầu hành trình học tập của bạn.
        Mỗi khóa được thiết kế theo từng bước rõ ràng.
      </p>
    </div>

    {/* MASCOT – FIX ĐÚNG */}
    <img
  src={heroMascot}
  alt=""
  className="
    hidden lg:block
    absolute
    right-6
    top-[40%]
    -translate-y-1/2
    w-[170px]
    max-h-[40vh]
    object-contain
    pointer-events-none
    opacity-90
  "
/>



  </div>
</section>

      {/* ================= CONTENT ================= */}
      <section className="container mx-auto px-6 -mt-20 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Khóa học có sẵn
            </h2>
            <p className="text-gray-600 mt-2">
              Chọn khóa để xem bài học và chi tiết.
            </p>
          </div>

          {/* STATES */}
          {loading ? (
            <div className="text-gray-500">Đang tải khóa học…</div>
          ) : error ? (
            <div className="text-red-600">Lỗi: {error}</div>
          ) : subcourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <img
                src={emptyMascot}
                alt=""
                className="w-56 mb-6 opacity-80"
              />
              <p className="text-lg font-medium">
                Hiện chưa có khóa học.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {subcourses.map((sc) => (
                <CourseCard
                  key={sc.id}
                  name={sc.name}
                  description={sc.short_description || sc.general_objectives || ''}
                  icon="📘"
                  lessons={sc.lesson_count || 0}
                  onClick={() =>
                    navigate(routes.subcourseLessons(sc.id as string))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
