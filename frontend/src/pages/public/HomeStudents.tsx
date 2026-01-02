/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Link, useNavigate } from 'react-router-dom';
import { routes } from '../../routes';
import PublicLayout from '../../components/layout/PublicLayout';
import ActivityCard from '../../components/students/ActivityCard';
import GradeCard from '../../components/students/GradeCard';
import type { Program, Lesson } from '../../types';
import { getPrograms, getLessons } from '../../services/content';
import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../../utils/media';

/* 🎭 Mascot assets */
import mascotIdle from '../../assets/sprites/mascot/Asset 8.png';
import mascotWave from '../../assets/sprites/mascot/leco game 3.png';

const HomeStudents = () => {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const [programs, setPrograms] = useState<Program[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, l] = await Promise.all([
          getPrograms(),
          getLessons(),
        ]);
        if (!mounted) return;
        setPrograms(p || []);
        setLessons(l || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load content');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PublicLayout>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,white,transparent_65%)] opacity-20" />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
                Bắt đầu học <br /> Khoa học Máy tính 🚀
              </h1>

              <p className="text-lg md:text-xl mb-10 text-purple-100 max-w-xl">
                Học lập trình vui nhộn với bài học tương tác và dự án thực hành.
                Không cần kinh nghiệm.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollToSection('courses')}
                  className="px-10 py-4 rounded-full bg-white text-purple-700
                             font-bold text-lg shadow-lg
                             hover:scale-105 hover:shadow-xl transition-all"
                >
                  🎒 Tìm khóa học
                </button>

                <button
                  onClick={() => scrollToSection('hour-of-code')}
                  className="px-10 py-4 rounded-full border-2 border-white
                             text-white font-bold text-lg
                             hover:bg-white hover:text-purple-700
                             transition-all"
                >
                  ⏰ Thử Giờ lập trình
                </button>
              </div>
            </div>

            {/* Mascot */}
            <div className="hidden md:flex justify-center">
              <img
                src={mascotIdle}
                alt="Learning mascot"
                className="w-80 drop-shadow-2xl select-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOUR OF CODE ================= */}
      <section id="hour-of-code" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
            <h2 className="text-4xl font-extrabold text-gray-900">
              Hoạt động Giờ lập trình ⏱️
            </h2>
            
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-4 text-gray-600">Đang tải hoạt động…</div>
            ) : error ? (
              <div className="col-span-4 text-red-600">Lỗi: {error}</div>
            ) : lessons.length === 0 ? (
              <div className="col-span-4 text-gray-600">Không có hoạt động.</div>
            ) : (
              lessons.slice(0, 4).map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => navigate(routes.lesson(lesson.id as string))}
                  className="cursor-pointer"
                >
                  <ActivityCard
                    title={lesson.title}
                    description={lesson.overview || lesson.subtitle || ''}
                    image={lesson.media && lesson.media[0] ? resolveMediaUrl(lesson.media[0].url) : '🎯'}
                    duration={undefined}
                    onClick={() => navigate(routes.lesson(lesson.id as string))}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================= COURSES ================= */}
      <section id="courses" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Khóa học theo cấp độ 🎓
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chọn khóa học phù hợp với độ tuổi và trình độ của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 text-gray-900">
            {programs.slice(0, 3).map((p) => (
              <GradeCard
                key={p.id}
                title={p.name}
                subtitle={''}
                description={p.short_description || ''}
                icon={'💡'}
                link={routes.programSubcourses(p.id as string)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-500">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">
            Sẵn sàng bắt đầu? 🌟
          </h2>
          <p className="text-lg md:text-xl mb-10 text-emerald-100">
            Tham gia cùng hàng triệu học sinh đang học lập trình trên toàn thế giới
          </p>

          <Link
            to={routes.elementary()}
            className="inline-flex items-center gap-2 px-10 py-4
                       bg-white text-emerald-700 font-bold text-lg rounded-full
                       shadow-xl hover:scale-105 transition-all"
          >
            🚀 Khám phá khóa học
          </Link>
        </div>

        <img
          src={mascotWave}
          alt="Mascot encouragement"
          className="hidden md:block absolute bottom-0 right-10 w-52 opacity-90 select-none"
        />
      </section>
    </PublicLayout>
  );
};

export default HomeStudents;
