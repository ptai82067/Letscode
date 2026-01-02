import { useEffect, useState } from 'react';
import { subcoursesAPI, programsAPI } from '../../services/api';
import type { Subcourse, Program } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '../../routes';
import SubcourseForm from '../../components/SubcourseForm';
import { useAuth } from '../../contexts/AuthContext';
import { resolveMediaUrl } from '../../utils/media';
import { useToast } from '../../components/Toast';

export default function Subcourses() {
  const params = useParams();
  const programId = (params.programId as string) || undefined;
  const [subcourses, setSubcourses] = useState<Subcourse[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subcourse | null>(null);
  const [subcoursesLoading, setSubcoursesLoading] = useState(false);
  const [subcoursesError, setSubcoursesError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError, ToastContainer } = useToast();

  // If not admin, teachers must have a program assignment to access subcourses admin page
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      const hasProgramAssign = (user.assignments || []).some((a: any) => !!a.program_id);
      if (!hasProgramAssign) {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;
    // fetch programs for filter separately
    setProgramsLoading(true);
    setProgramsError(null);
    setPrograms([]);
    programsAPI.getAll()
      .then((data) => { if (mounted) setPrograms(data); })
      .catch((err) => { if (mounted) setProgramsError(getErrorMessage(err) || 'Failed to load programs'); })
      .finally(() => { if (mounted) setProgramsLoading(false); });

    setSubcoursesLoading(true);
    setSubcoursesError(null);
    setSubcourses([]);
    const fetch = programId ? subcoursesAPI.getByProgram(programId) : subcoursesAPI.getAll();
    fetch.then((data) => { if (mounted) setSubcourses(data); })
      .catch((err) => { if (mounted) setSubcoursesError(getErrorMessage(err) || 'Failed to load subcourses'); })
      .finally(() => { if (mounted) setSubcoursesLoading(false); });
    return () => { mounted = false; };
  }, [programId]);

  function handleCreate() { setEditing(null); setShowForm(true); }
  function handleEdit(s: Subcourse) { setEditing(s); setShowForm(true); }

  function onFormSuccess(s: Subcourse) {
    setSubcourses((prev) => {
      if (s.id) {
        const idx = prev.findIndex((x) => x.id === s.id);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = s; return copy; }
      }
      return [s, ...prev];
    });
    setShowForm(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Xác nhận xóa subcourse này?')) return;
    try {
      await subcoursesAPI.delete(id);
      setSubcourses((prev) => prev.filter((x) => x.id !== id));
      success('Khóa học đã được xóa thành công');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showError(err?.response?.data?.error || err?.message || 'Lỗi khi xóa khóa học');
    }
  }

  // return (
  //   <div className="space-y-4">
  //     <div className="flex items-center justify-between">
  //       <h2 className="text-2xl font-semibold text-gray-900">Subcourses</h2>
  //     </div>

  //     <div className="bg-white p-5 rounded-lg shadow-sm">
  //       <label className="block text-sm font-medium text-gray-700">Filter by Program</label>
  //       <div className="mt-2">
  //         <select
  //           className="p-2 border rounded w-full max-w-xs text-sm"
  //           value={programId || ''}
  //           onChange={(e) => {
  //             const val = e.target.value;
  //             if (val) navigate(routes.admin.programSubcourses(val));
  //             else navigate(routes.admin.subcourses());
  //           }}
  //           disabled={programsLoading}
  //         >
  //           <option value="">-- All Programs --</option>
  //           {programsLoading && <option value="" disabled>Loading programs…</option>}
  //           {programsError && <option value="" disabled>Failed to load programs</option>}
  //           {programs.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
  //         </select>
  //       </div>
  //     </div>

  //     <div className="flex justify-end">
  //       <button
  //         className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
  //         onClick={handleCreate}
  //       >
  //         Create Subcourse
  //       </button>
  //     </div>

  //     {showForm && <SubcourseForm initial={editing || undefined} onCancel={() => setShowForm(false)} onSuccess={onFormSuccess} />}

  //     <div className="bg-white p-5 rounded-lg shadow-sm">
  //       {subcoursesLoading && <div className="text-gray-500">Loading subcourses…</div>}
  //       {subcoursesError && <div className="text-red-600">Error: {subcoursesError}</div>}
  //       {!subcoursesLoading && !subcoursesError && (
  //         subcourses.length === 0 ? (
  //           <div className="text-gray-600 py-6">No subcourses found.</div>
  //         ) : (
  //           <div className="overflow-x-auto">
  //             <table className="w-full text-left border-collapse">
  //               <thead className="bg-gray-50">
  //                 <tr>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Name</th>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Slug</th>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Program</th>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Actions</th>
  //                 </tr>
  //               </thead>
  //               <tbody className="divide-y divide-gray-100">
  //                 {subcourses.map((s) => (
  //                   <tr key={s.id} className="hover:bg-gray-50">
  //                     <td className="p-3 align-middle flex items-center gap-3 text-sm text-gray-800">
  //                       {s.media && s.media[0] && (<img src={s.media[0].url} alt="cover" className="h-12 w-12 object-cover rounded" />)}
  //                       <div className="font-medium">{s.name}</div>
  //                     </td>
  //                     <td className="p-3 text-sm text-gray-600">{s.slug}</td>
  //                     <td className="p-3 text-sm text-gray-600">{s.program?.name || ''}</td>
  //                     <td className="p-3 text-sm">
  //                       <div className="flex gap-2">
  //                         <button
  //                           className="px-3 py-1 text-sm rounded-md bg-white border text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
  //                           onClick={() => navigate(routes.admin.subcourseLessons(s.id as string))}
  //                         >
  //                           View
  //                         </button>
  //                         <button
  //                           className="px-3 py-1 text-sm rounded-md bg-white border text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
  //                           onClick={() => handleEdit(s)}
  //                         >
  //                           Edit
  //                         </button>
  //                         <button
  //                           className="px-3 py-1 text-sm rounded-md bg-white border text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100"
  //                           onClick={() => handleDelete(s.id)}
  //                         >
  //                           Delete
  //                         </button>
  //                       </div>
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         )
  //       )}
  //     </div>
  //   </div>
  // );
return (
  <div className="space-y-8">
    {/* HEADER */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tiểu khóa</h2>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý tiểu khóa cho từng chương trình
        </p>
      </div>

      {(user?.role === 'admin' || (user?.assignments || []).some((a: any) => !!a.program_id)) && (
        <button
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-md"
          onClick={handleCreate}
        >
          + Tạo tiểu khóa
        </button>
      )}
    </div>

    {/* FILTER */}
    <div className="bg-white rounded-2xl shadow p-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Lọc theo chương trình
      </label>
      <select
        className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        value={programId || ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val) navigate(routes.admin.programSubcourses(val));
          else navigate(routes.admin.subcourses());
        }}
        disabled={programsLoading}
      >
        <option value="">Tất cả chương trình</option>
        {programsLoading && <option disabled>Đang tải chương trình…</option>}
        {programsError && <option disabled>Tải chương trình thất bại</option>}
        {programs.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>

    {/* FORM */}
    {showForm && (
      <SubcourseForm
        initial={editing || undefined}
        onCancel={() => setShowForm(false)}
        onSuccess={onFormSuccess}
      />
    )}

    {/* LIST */}
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      {subcoursesLoading && (
        <div className="p-6 text-gray-500">Đang tải tiểu khóa…</div>
      )}

      {subcoursesError && (
        <div className="p-6 text-red-600">Lỗi: {subcoursesError}</div>
      )}

      {!subcoursesLoading && !subcoursesError && (
        subcourses.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Không tìm thấy tiểu khóa.
          </div>
        ) : (
          <div className="divide-y">
            {subcourses.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-6 p-6 hover:bg-gray-50 transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  {s.media && s.media[0] ? (
                    <img
                      src={resolveMediaUrl(s.media[0].url)}
                      alt={s.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">
                      📘
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {s.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {s.slug} • {s.program?.name || '—'}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-sm rounded-lg border text-gray-800 hover:bg-gray-100"
                    onClick={() => navigate(routes.admin.subcourseLessons(s.id as string))}
                  >
                    Xem
                  </button>

                  <button
                    className="px-3 py-1.5 text-sm rounded-lg border text-gray-800 hover:bg-gray-100"
                    onClick={() => handleEdit(s)}
                  >
                    Sửa
                  </button>

                  <button
                    className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(s.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      <ToastContainer />
    </div>
  </div>
);

}
