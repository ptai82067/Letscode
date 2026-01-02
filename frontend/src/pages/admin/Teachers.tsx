/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { teachersAPI, programsAPI, subcoursesAPI, teacherAssignmentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';

interface Teacher {
  id: string;
  username: string;
  email?: string;
}


export default function Teachers() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError, ToastContainer } = useToast();

    useEffect(() => {
      if (!user) return; // wait for auth to initialize
      if (user.role !== 'admin') {
        navigate('/', { replace: true });
      }
    }, [user, navigate]);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'program' | 'subcourse' | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [items, setItems] = useState<any[]>([]); // programs or subcourses
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [showDates, setShowDates] = useState(false);
    const [startAt, setStartAt] = useState<string | null>(null);
    const [endAt, setEndAt] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    
  useEffect(() => {
    teachersAPI.getAll()
      .then(setTeachers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading teachers...</div>;

  // helper to open modal and hydrate checked state from backend
  async function openAssignmentModal(type: 'program' | 'subcourse', t: Teacher) {
    setModalType(type);
    setSelectedTeacher(t);
    setModalOpen(true);
    setChecked({});
    setShowDates(false);
    setStartAt(null);
    setEndAt(null);

    if (type === 'program') {
      const progs = await programsAPI.getAll();
      setItems(progs || []);
      const assigns = await teacherAssignmentsAPI.getForTeacher(t.id);
      const map: Record<string, boolean> = {};
      assigns
        .filter((a: any) => a.scope_level === 'program' && a.program_id)
        .forEach((a: any) => { map[a.program_id] = true; });
      setChecked(map);
    } else {
      const subs = await subcoursesAPI.getAll();
      setItems(subs || []);
      const assigns = await teacherAssignmentsAPI.getForTeacher(t.id);
      const map: Record<string, boolean> = {};
      assigns
        .filter((a: any) => a.scope_level === 'subcourse' && a.subcourse_id)
        .forEach((a: any) => { map[a.subcourse_id] = true; });
      setChecked(map);
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10 min-h-screen">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900">👨‍🏫 Quản lý giảng viên</h1>
        <p className="text-lg text-gray-600 mt-2">
          Tạo giảng viên và phân quyền chương trình / khóa học
        </p>
      </div>

      {/* Create Teacher Form - MOVED TO TOP */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-lg p-10 mb-12 border border-indigo-100">
        <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <span className="text-4xl">✨</span>
          Tạo giảng viên mới
        </h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const data = {
              username: form.username.value,
              email: form.email.value,
              password: form.password.value,
            };

            try {
              await teachersAPI.create(data);
              form.reset();
              success('Tạo giảng viên thành công');
              setLoading(true);
              teachersAPI.getAll()
                .then(setTeachers)
                .finally(() => setLoading(false));
            } catch (err: any) {
              showError(err?.response?.data?.error || err?.message || 'Lỗi khi tạo giảng viên');
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Tên đăng nhập</label>
            <input
              name="username"
              placeholder="Nhập tên đăng nhập"
              required
              className="w-full bg-white border-2 border-indigo-300 p-4 rounded-xl focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-gray-900 text-base font-semibold placeholder:text-gray-400 hover:border-indigo-400 transition-all duration-200 shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
            <input
              name="email"
              placeholder="Nhập email"
              required
              type="email"
              className="w-full bg-white border-2 border-indigo-300 p-4 rounded-xl focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-gray-900 text-base font-semibold placeholder:text-gray-400 hover:border-indigo-400 transition-all duration-200 shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Mật khẩu</label>
            <input
              name="password"
              placeholder="Nhập mật khẩu"
              type="password"
              required
              className="w-full bg-white border-2 border-indigo-300 p-4 rounded-xl focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-gray-900 text-base font-semibold placeholder:text-gray-400 hover:border-indigo-400 transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="flex flex-col justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              ✅ Tạo giảng viên
            </button>
          </div>
        </form>
      </div>

      {/* Teachers List */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Danh sách giảng viên</h3>
        {teachers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg font-medium">Chưa có giảng viên nào</p>
            <p className="text-gray-500 mt-2">Hãy tạo giảng viên mới ở phía trên để bắt đầu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map(t => (
              <div
                key={t.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200"
              >
                {/* Teacher Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                      {t.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{t.username}</h3>
                      <p className="text-sm text-gray-600">{t.email || 'Chưa có email'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => openAssignmentModal('program', t)}
                  >
                    📚 Chương trình
                  </button>

                  <button
                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => openAssignmentModal('subcourse', t)}
                  >
                    📖 Khóa học
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>  
      {/* Assignment Modal */}
      {modalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {modalType === 'program' ? '📚 Cấp quyền chương trình' : '📖 Cấp quyền khóa học'} cho <span className="text-indigo-600">{selectedTeacher.username}</span>
            </h3>

            {/* Items Grid */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p className="text-lg">Không có mục nào</p>
                </div>
              ) : (
                items.map((it: any) => (
                  <label
                    key={it.id}
                    className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition-all duration-200 hover:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[it.id]}
                      onChange={(e) => setChecked(prev => ({ ...prev, [it.id]: e.target.checked }))}
                      className="w-5 h-5 mt-1 accent-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{it.name || it.title || it.slug}</div>
                      <div className="text-sm text-gray-600 mt-1">{it.short_description || it.program?.name || ''}</div>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Date Options */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDates}
                  onChange={(e) => setShowDates(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600"
                />
                <span className="font-semibold text-gray-900">Thêm ngày bắt đầu/kết thúc (tùy chọn)</span>
              </label>
              {showDates && (
                <div className="flex flex-col md:flex-row gap-3 mt-4">
                  <input
                    type="datetime-local"
                    className="flex-1 bg-white border-2 border-indigo-300 p-4 rounded-xl focus:border-indigo-600 focus:outline-none text-gray-900 text-base font-semibold placeholder:text-gray-400 hover:border-indigo-400 transition-all duration-200 shadow-sm"
                    onChange={e => setStartAt(e.target.value || null)}
                    placeholder="Ngày bắt đầu"
                  />
                  <input
                    type="datetime-local"
                    className="flex-1 bg-white border-2 border-indigo-300 p-4 rounded-xl focus:border-indigo-600 focus:outline-none text-gray-900 text-base font-semibold placeholder:text-gray-400 hover:border-indigo-400 transition-all duration-200 shadow-sm"
                    onChange={e => setEndAt(e.target.value || null)}
                    placeholder="Ngày kết thúc"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all duration-300"
                onClick={() => setModalOpen(false)}
              >
                ❌ Hủy
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={async () => {
                  if (!modalType || !selectedTeacher) return;
                  setSaving(true);
                  const ids = Object.keys(checked).filter(k => checked[k]);
                  try {
                    const startIso = startAt ? new Date(startAt).toISOString() : null;
                    const endIso = endAt ? new Date(endAt).toISOString() : null;
                    if (modalType === 'program') {
                      await teacherAssignmentsAPI.assignPrograms(selectedTeacher.id, ids, startIso, endIso);
                      const assigns = await teacherAssignmentsAPI.getForTeacher(selectedTeacher.id);
                      const map: Record<string, boolean> = {};
                      assigns
                        .filter((a: any) => a.scope_level === 'program' && a.program_id)
                        .forEach((a: any) => { map[a.program_id] = true; });
                      setChecked(map);
                    } else {
                      await teacherAssignmentsAPI.assignSubcourses(selectedTeacher.id, ids, startIso, endIso);
                      const assigns = await teacherAssignmentsAPI.getForTeacher(selectedTeacher.id);
                      const map: Record<string, boolean> = {};
                      assigns
                        .filter((a: any) => a.scope_level === 'subcourse' && a.subcourse_id)
                        .forEach((a: any) => { map[a.subcourse_id] = true; });
                      setChecked(map);
                    }
                    setModalOpen(false);
                    success('Gán quyền thành công');
                  } catch (err: any) {
                    showError(err?.response?.data?.error || err.message || 'Lỗi khi gán quyền');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? '⏳ Đang lưu...' : '✅ Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
