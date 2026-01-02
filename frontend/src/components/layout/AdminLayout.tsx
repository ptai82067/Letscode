/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Outlet, Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { routes } from '../../routes';

// export default function AdminLayout() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate(routes.login());
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Top Bar */}
//       <div className="bg-white shadow">
//         <div className="px-6 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-gray-800">CourseAI Admin</h1>
//           <div className="flex items-center gap-4">
//             <span className="text-gray-700">{user?.username}</span>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="flex">
//         {/* Sidebar */}
//         <div className="w-64 bg-white shadow-md min-h-screen">
//           <nav className="p-4">
//             <Link to={routes.admin.programs()} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded mb-2">📚 Programs</Link>
//             <Link to={routes.admin.subcourses()} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded mb-2">📖 Subcourses</Link>
//             <Link to={routes.admin.lessons()} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded">📝 Lessons</Link>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// }
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { routes } from '../../routes';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(routes.login());
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gradient-to-b from-indigo-700 to-purple-700 text-white flex flex-col">
        {/* LOGO */}
        <div className="px-6 py-6 border-b border-white/20">
          <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-yellow-200 to-pink-300 bg-clip-text text-transparent">
            Let&apos;s code
          </h1>
          <p className="text-xs text-white/70 mt-1">Admin Dashboard</p>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {user?.role === 'admin' && (
            <Link
              to={routes.admin.programs()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              <span className="text-lg">📚</span>
              <span className="font-medium">Programs</span>
            </Link>
          )}

          {(user?.role === 'admin' || (user?.assignments || []).some((a: any) => !!a.program_id)) && (
            <Link
              to={routes.admin.subcourses()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              <span className="text-lg">📖</span>
              <span className="font-medium">Subcourses</span>
            </Link>
          )}

          {(user?.role === 'admin' || (user?.assignments || []).some((a: any) => !!a.subcourse_id || !!a.program_id)) && (
            <Link
              to={routes.admin.lessons()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              <span className="text-lg">📝</span>
              <span className="font-medium">Lessons</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to={routes.admin.teachers()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              <span className="text-lg">👨‍🏫</span>
              <span className="font-medium">Giảng viên</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to={routes.admin.teacherHistory()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
            >
              <span className="text-lg">📚</span>
              <span className="font-medium">Lịch sử giảng viên</span>
            </Link>
          )}

        </nav>

        {/* USER */}
        <div className="px-6 py-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{user?.username}</div>
              <div className="text-xs text-white/70">Administrator</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 w-full px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Welcome back 👋
            </h2>
            <p className="text-sm text-gray-500">
              Manage programs, subcourses and lessons
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
