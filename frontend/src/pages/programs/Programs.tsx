/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { programsAPI } from '../../services/api';
import type { Program } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProgramForm from '../../components/ProgramForm';
import { getErrorMessage } from '../../utils/error';
import { routes } from '../../routes';
import { useToast } from '../../components/Toast';

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError, ToastContainer } = useToast();

  // Only admin may access Programs page
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;
    setProgramsLoading(true);
    setProgramsError(null);
    setPrograms([]);
    programsAPI.getAll()
      .then((data) => { if (mounted) setPrograms(data); })
      .catch((err) => { if (mounted) setProgramsError(getErrorMessage(err) || 'Failed to load programs'); })
      .finally(() => { if (mounted) setProgramsLoading(false); });
    return () => { mounted = false; };
  }, []);

  function handleCreate() { setEditing(null); setShowForm(true); }
  function handleEdit(p: Program) { setEditing(p); setShowForm(true); }

  function onFormSuccess(p: Program) {
    setPrograms((prev) => {
      if (p.id) {
        const idx = prev.findIndex((x) => x.id === p.id);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = p; return copy; }
      }
      return [p, ...prev];
    });
    setShowForm(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Xác nhận xóa program này?')) return;
    try {
      await programsAPI.delete(id);
      setPrograms((prev) => prev.filter((x) => x.id !== id));
      success('Chương trình đã được xóa thành công');
    } catch (err: any) {
      showError(err?.response?.data?.error || err?.message || 'Lỗi khi xóa chương trình');
    }
  }

  // return (
  //   <div className="space-y-4">
  //     <div className="flex items-center justify-between">
  //       <h2 className="text-2xl font-semibold text-gray-900">Programs</h2>
  //     </div>

  //     <div className="bg-white p-5 rounded-lg shadow-sm">
  //       <div className="mb-4 flex justify-end">
  //         <button
  //           className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
  //           onClick={handleCreate}
  //         >
  //           Create Program
  //         </button>
  //       </div>
  //       {showForm && <ProgramForm initial={editing || undefined} onCancel={() => setShowForm(false)} onSuccess={onFormSuccess} />}
  //       {programsLoading && <div className="text-gray-500">Loading programs…</div>}
  //       {programsError && <div className="text-red-600">Error: {programsError}</div>}

  //       {!programsLoading && !programsError && (
  //         programs.length === 0 ? (
  //           <div className="text-gray-600 py-6">No programs found.</div>
  //         ) : (
  //           <div className="overflow-x-auto">
  //             <table className="w-full text-left border-collapse">
  //               <thead className="bg-gray-50">
  //                 <tr>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Name</th>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Slug</th>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Status</th>
  //                   <th className="text-sm font-medium text-gray-600 p-3">Actions</th>
  //                 </tr>
  //               </thead>
  //               <tbody className="divide-y divide-gray-100">
  //                 {programs.map((p) => (
  //                   <tr key={p.id} className="hover:bg-gray-50">
  //                     <td className="p-3 align-middle flex items-center gap-3 text-sm text-gray-800">
  //                       {p.media && p.media[0] && (<img src={p.media[0].url} alt="cover" className="h-12 w-12 object-cover rounded" />)}
  //                       <div className="font-medium">{p.name}</div>
  //                     </td>
  //                     <td className="p-3 text-sm text-gray-600">{p.slug}</td>
  //                     <td className="p-3 text-sm text-gray-600">{p.status}</td>
  //                     <td className="p-3 text-sm">
  //                       <div className="flex gap-2">
  //                         <button
  //                           className="px-3 py-1 text-sm rounded-md bg-white border text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
  //                           onClick={() => navigate(routes.admin.programSubcourses(p.id as string))}
  //                         >
  //                           View
  //                         </button>
  //                         <button
  //                           className="px-3 py-1 text-sm rounded-md bg-white border text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
  //                           onClick={() => handleEdit(p)}
  //                         >
  //                           Edit
  //                         </button>
  //                         <button
  //                           className="px-3 py-1 text-sm rounded-md bg-white border text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100"
  //                           onClick={() => handleDelete(p.id)}
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
  <div className="space-y-6 sm:space-y-8">
    {/* HEADER */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">📚 Programs</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage learning programs and their curriculum structure
        </p>
      </div>

      {user?.role === 'admin' && (
        <button
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-md transition"
          onClick={handleCreate}
        >
          + Create Program
        </button>
      )}
    </div>

    {/* FORM */}
    {showForm && (
      <div className="bg-white rounded-2xl shadow p-6">
        <ProgramForm
          initial={editing || undefined}
          onCancel={() => setShowForm(false)}
          onSuccess={onFormSuccess}
        />
      </div>
    )}

    {/* CONTENT */}
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      {programsLoading && (
        <div className="p-6 text-gray-500">Loading programs…</div>
      )}

      {programsError && (
        <div className="p-6 text-red-600">Error: {programsError}</div>
      )}

      {!programsLoading && !programsError && (
        programs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No programs found.
          </div>
        ) : (
          <div className="divide-y">
            {programs.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 hover:bg-gray-50 transition"
              >
                {/* LEFT */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:flex-1">
                  {p.media && p.media[0] ? (
                    <img
                      src={p.media[0].url}
                      alt={p.name}
                      className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl sm:text-2xl flex-shrink-0">
                      🎓
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {p.slug}
                    </p>

                    <span
                      className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium
                        ${p.status === 'published'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border text-gray-800 hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => navigate(routes.admin.programSubcourses(p.id as string))}
                  >
                    View Subcourses
                  </button>

                  <button
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition whitespace-nowrap"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition whitespace-nowrap"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
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
