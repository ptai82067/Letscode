/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import CourseCard from '../../components/students/CourseCard';
import { publicSubcoursesAPI } from '../../services/api';
import type { Subcourse } from '../../types';
import { routes } from '../../routes';

/* Mascot */
import mascot from '../../assets/sprites/mascot/leco game 16.png';

export default function ListSubCourse() {
  const [subcourses, setSubcourses] = useState<Subcourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const programId = searchParams.get('program_id') || undefined;
        const data = programId
          ? await publicSubcoursesAPI.getByProgram(programId)
          : await publicSubcoursesAPI.getAll();
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
  }, [searchParams]);

  return (
    <PublicLayout>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-600 pt-28 pb-44">
        {/* soft light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,white,transparent_70%)] opacity-20" />

        {/* Mascot */}
        <img
          src={mascot}
          alt=""
          className="hidden lg:block absolute right-16 top-24 w-80 opacity-25 pointer-events-none select-none"
        />

        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 text-white drop-shadow-lg">
            Chương trình học 📚
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-indigo-100">
            Chọn một khóa và bắt đầu hành trình học tập với các bài học có cấu trúc,
            thực hành giúp bạn tiến bộ.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="container mx-auto px-6 -mt-32 pb-28 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] p-8 md:p-14">

          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Khóa học có sẵn
            </h2>
          </div>

          {/* States */}
          {loading ? (
            <div className="text-center py-24 text-gray-500 text-lg">
              Đang tải khóa học…
            </div>
          ) : error ? (
            <div className="text-center py-24 text-red-600 font-semibold">
              Lỗi: {error}
            </div>
          ) : subcourses.length === 0 ? (
            <div className="text-center py-24 text-gray-600">
              Hiện chưa có khóa học.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {subcourses.map((sc) => (
                <div
                  key={sc.id}
                  className="hover:-translate-y-2 transition-transform"
                >
                  <CourseCard
                    name={sc.name}
                    description={sc.short_description || sc.general_objectives || ''}
                    icon={'📘'}
                    lessons={sc.lesson_count || 0}
                    onClick={() =>
                      navigate(routes.subcourseLessons(sc.id as string))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
