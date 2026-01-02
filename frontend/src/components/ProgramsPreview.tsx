import React, { useState } from 'react';
import type { Program } from '../types';
import GradeCard from '../components/students/GradeCard';
import { routes } from '../routes';

interface Props {
  programs: Program[];
  loading: boolean;
  error: string | null;
  maxPreview?: number;
  onOpenAll?: () => void;
}

const ProgramsPreview: React.FC<Props> = ({ programs, loading, error, maxPreview = 3, onOpenAll }) => {
  const [showAll, setShowAll] = useState(false);

  if (loading) return <div className="col-span-3">Đang tải chương trình…</div>;
  if (error) return <div className="col-span-3 text-red-600">Lỗi: {error}</div>;
  if (!programs || programs.length === 0) return <div className="col-span-3">Không có chương trình.</div>;

  const visible = showAll ? programs : programs.slice(0, maxPreview);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 text-gray-900">
        {visible.map((p) => (
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
      {programs.length > maxPreview && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100"
            onClick={() => {
              const next = !showAll;
              setShowAll(next);
              if (next && onOpenAll) onOpenAll();
            }}
          >
            {showAll ? 'Thu gọn' : `Xem tất cả (${programs.length})`}
          </button>
        </div>
      )}
    </>
  );
};

export default ProgramsPreview;
