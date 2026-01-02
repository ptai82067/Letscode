/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { lessonsAPI, subcoursesAPI } from '../../services/api';
import type { Lesson, Subcourse } from '../../types';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLessonFormV2 from '../../components/AdminLessonFormV2';
import FormModal from '../../components/FormModal';
import { routes } from '../../routes';
import { getErrorMessage } from '../../utils/error';
import { resolveMediaUrl } from '../../utils/media';
import { useToast } from '../../components/Toast';

export default function Lessons() {
  const params = useParams();
  const subcourseId = (params.subcourseId as string) || undefined;
  const navigate = useNavigate();
  const { success, error: showError, ToastContainer } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subcourses, setSubcourses] = useState<Subcourse[]>([]);
  const [subcoursesLoading, setSubcoursesLoading] = useState(false);
  const [subcoursesError, setSubcoursesError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    let mounted = true;
    setSubcoursesLoading(true);
    setSubcoursesError(null);
    setSubcourses([]);
    subcoursesAPI.getAll()
      .then((data) => { if (mounted) setSubcourses(data); })
      .catch((err) => { if (mounted) setSubcoursesError(getErrorMessage(err) || 'Failed to load subcourses'); })
      .finally(() => { if (mounted) setSubcoursesLoading(false); });

    setLoading(true);
    setError(null);
    setLessons([]);
    setCurrentPage(1);
    const fetch = subcourseId ? lessonsAPI.getBySubcourse(subcourseId) : lessonsAPI.getAll();
    fetch.then((data) => { if (mounted) setLessons(data); })
      .catch((err) => { if (mounted) setError(getErrorMessage(err) || 'Failed to load lessons'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [subcourseId]);

  async function handleSubmit(id: string | undefined, data: Lesson) {
    if (id) return lessonsAPI.update(id, data);
    return lessonsAPI.create(data);
  }

  function handleCreate() { setEditing(null); setShowForm(true); }

  function onFormSuccess(l: Lesson) {
    setLessons((prev) => {
      const idx = prev.findIndex((x) => x.id === l.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = l; return copy; }
      return [l, ...prev];
    });
    setShowForm(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Xác nhận xóa lesson này?')) return;
    try {
      await lessonsAPI.delete(id);
      setLessons((prev) => prev.filter((x) => x.id !== id));
      success('Bài học đã được xóa thành công');
    } catch (err: any) {
      showError(err?.response?.data?.error || err?.message || 'Lỗi khi xóa bài học');
    }
  }

  /* ================= UI ONLY ================= */

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 py-20">
        <div className="container mx-auto px-6 text-white">
          <h1 className="text-5xl font-extrabold mb-4">Chương Trình Học</h1>
          <p className="text-indigo-100 max-w-2xl">
            Quản lý danh sách bài học theo từng tiểu khóa – cấu trúc giống curriculum của khóa học.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-6 -mt-20 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          {/* FILTER + ACTION */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo Tiểu Khóa</label>
              <select
                className="p-3 border rounded-xl w-full max-w-xs"
                value={subcourseId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) navigate(routes.admin.subcourseLessons(val));
                  else navigate(routes.admin.lessons());
                }}
                disabled={subcoursesLoading}
              >
                <option value="">-- Tất cả tiểu khóa --</option>
                {subcoursesLoading && <option disabled>Đang tải tiểu khóa…</option>}
                {subcoursesError && <option disabled>Tải tiểu khóa thất bại</option>}
                {subcourses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              onClick={handleCreate}
            >
              + Tạo Bài Học
            </button>
          </div>

          {showForm && (
            <FormModal
              isOpen={showForm}
              title={editing ? 'Sửa bài học' : 'Tạo bài học mới'}
              onClose={() => setShowForm(false)}
            >
              <AdminLessonFormV2
                initial={editing || undefined}
                onCancel={() => setShowForm(false)}
                onSuccess={onFormSuccess}
                submit={handleSubmit}
              />
            </FormModal>
          )}

          {/* LIST */}
          {loading && <div className="text-gray-500">Đang tải bài học…</div>}
          {error && <div className="text-red-600">Lỗi: {error}</div>}

          {!loading && !error && (
            <div className="space-y-6">
              {lessons.length === 0 ? (
                <div className="text-gray-500">Không tìm thấy bài học.</div>
              ) : (
                <>
                  {/* Paginated Items */}
                  {lessons
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between gap-6 p-6 rounded-2xl border hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-4">
                          {l.media && l.media[0] && (
                            <img
                              src={resolveMediaUrl(l.media[0].url)}
                              alt="cover"
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{l.title}</h3>
                            <p className="text-sm text-gray-500">{l.subcourse?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold"
                            onClick={() => { setEditing(l); setShowForm(true); }}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                            onClick={() => navigate(routes.admin.lesson(l.id as string))}
                          >
                            👁️ Xem
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                            onClick={() => handleDelete(l.id)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Pagination Controls */}
                  {lessons.length > itemsPerPage && (
                    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
                      <button
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        ← Trang trước
                      </button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: Math.ceil(lessons.length / itemsPerPage) },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            className={`w-10 h-10 rounded-lg font-bold transition ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        onClick={() => setCurrentPage((p: number) => Math.min(Math.ceil(lessons.length / itemsPerPage), p + 1))}
                        disabled={currentPage === Math.ceil(lessons.length / itemsPerPage)}
                      >
                        Trang sau →
                      </button>
                    </div>
                  )}

                  {/* Page Info */}
                  <div className="text-center text-sm text-gray-600 mt-4">
                    Trang {currentPage} / {Math.ceil(lessons.length / itemsPerPage)} • Tổng {lessons.length} bài học
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
      <ToastContainer />
    </div>
  );
}
