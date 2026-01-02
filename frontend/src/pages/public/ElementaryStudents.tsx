/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import ActivityCard from '../../components/students/ActivityCard';
import { useEffect, useState } from 'react';
import { publicProgramsAPI, publicLessonsAPI } from '../../services/api';
import type { Program, Lesson } from '../../types';
import { routes } from '../../routes';
import ProgramsPreview from '../../components/ProgramsPreview';
import { resolveMediaUrl } from '../../utils/media';

/* 🎭 Mascot assets */
import mascotHero from '../../assets/sprites/mascot/leco game 7.png';
import mascotAdventure from '../../assets/sprites/mascot/Asset 6.png';
import mascotHour from '../../assets/sprites/mascot/leco game 11.png';
import mascotCTA from '../../assets/sprites/mascot/Asset 8.png';

const ElementaryStudents = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, l] = await Promise.all([
          publicProgramsAPI.getAll(),
          publicLessonsAPI.getAll(),
        ]);

        if (!mounted) return;
        setPrograms(p || []);
        setLessons(l || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load content');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PublicLayout>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white,transparent_70%)]" />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
              Học lập trình thật vui 🚀
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10">
              Thiết kế dành cho học sinh tiểu học (Lớp K–5)
            </p>

            <Link
              to="#courses"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full
                         bg-white text-pink-600 font-bold text-lg
                         shadow-xl hover:scale-105 hover:shadow-2xl
                         transition-all"
            >
              🎒 Khám phá khóa học
            </Link>
          </div>
        </div>

        <img
          src={mascotHero}
          alt="Mascot welcome"
          className="hidden md:block absolute bottom-0 right-10 w-72 drop-shadow-2xl select-none"
        />
      </section>

      {/* ================= PROGRAMS ================= */}
      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Courses by Grade Level 🎓
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chọn khóa học phù hợp với độ tuổi và khả năng của bé
            </p>
          </div>

          <ProgramsPreview programs={programs} loading={loading} error={error} />
        </div>
      </section>

      {/* ================= ADVENTURE ================= */}
      <section className="py-20 relative bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Chọn cuộc phiêu lưu 🎮
            </h2>
            <p className="text-gray-600">
              Những hoạt động ngắn giúp bé làm quen với lập trình
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {lessons.slice(0, 3).map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => navigate(routes.lesson(lesson.id as string))}
                className="group bg-white rounded-3xl p-8 text-center
                           shadow-lg hover:shadow-2xl
                           hover:-translate-y-2 transition-all cursor-pointer"
              >
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">
                  🕹️
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {lesson.title}
                </h3>
                <p className="text-gray-600 mb-8 min-h-[60px]">
                  {lesson.overview || lesson.subtitle || 'Bắt đầu hoạt động thú vị này!'}
                </p>
                <button
                  className="px-8 py-3 rounded-full bg-pink-500 text-white font-semibold
                             hover:bg-pink-600 hover:scale-105 transition-all"
                >
                  Bắt đầu ngay
                </button>
              </div>
            ))}
          </div>
        </div>

        <img
          src={mascotAdventure}
          alt="Mascot adventure"
          className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-44 opacity-90 select-none"
        />
      </section>

      {/* ================= HOUR OF CODE ================= */}
      <section className="py-20 bg-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Giờ lập trình ⏰
            </h2>
            <p className="text-gray-600">
              Bài học 1 giờ – dễ hiểu, dễ chơi, dễ nhớ
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {lessons.slice(0, 4).map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => navigate(routes.lesson(lesson.id as string))}
                className="cursor-pointer"
              >
                <ActivityCard
                  title={lesson.title}
                  description={lesson.overview || lesson.subtitle || ''}
                  image={lesson.media?.[0]?.url ? resolveMediaUrl(lesson.media[0].url) : '🎯'}
                  duration={undefined}
                  onClick={() => navigate(routes.lesson(lesson.id as string))}
                />
              </div>
            ))}
          </div>
        </div>

        <img
          src={mascotHour}
          alt="Mascot coding"
          className="hidden md:block absolute bottom-0 left-10 w-48 select-none"
        />
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div
            className="relative overflow-hidden rounded-[3rem]
                       bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400
                       p-14 text-white text-center shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Sẵn sàng bắt đầu? 🌟
            </h2>
            <p className="text-lg md:text-xl mb-10 text-white/90">
              Chọn một khóa và bắt đầu hành trình lập trình hôm nay!
            </p>

            <Link
              to={routes.home()}
              className="inline-flex items-center gap-2 px-10 py-4
                         bg-white text-purple-600 font-bold text-lg rounded-full
                         shadow-xl hover:scale-105 transition-all"
            >
              🏠 Trở về trang chủ
            </Link>

            <img
              src={mascotCTA}
              alt="Mascot encouragement"
              className="hidden md:block absolute bottom-0 right-10 w-40 opacity-90 select-none"
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default ElementaryStudents;
