import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import CourseCard from '../../components/students/CourseCard';
import { publicProgramsAPI } from '../../services/api';
import type { Program } from '../../types';
import { routes } from '../../routes';

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await publicProgramsAPI.getAll();
        if (!mounted) return;
        setPrograms(data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error || err?.message || 'Failed to load programs');
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">Chương trình</h2>

        {loading ? (
          <div>Đang tải chương trình…</div>
        ) : error ? (
          <div className="text-red-600">Lỗi: {error}</div>
        ) : programs.length === 0 ? (
          <div className="text-gray-600">Không có chương trình.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <CourseCard
                key={p.id}
                name={p.name}
                description={p.short_description || p.description || ''}
                icon={'🎓'}
                lessons={p.subcourse_count || 0}
                onClick={() => navigate(routes.programSubcourses(p.id as string))}
              />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
