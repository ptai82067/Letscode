/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { routes } from '../../routes';

export default function AdminHome() {
  const { user } = useAuth();

  const widgets = [
    {
      show: user?.role === 'admin',
      to: routes.admin.programs(),
      title: 'Programs',
      description: 'Manage programs',
      icon: '🎯',
      color: 'from-blue-500 to-blue-600'
    },
    {
      show: (user?.role === 'admin' || (user?.assignments || []).some((a: any) => !!a.program_id)),
      to: routes.admin.subcourses(),
      title: 'Subcourses',
      description: 'Manage subcourses',
      icon: '🏫',
      color: 'from-purple-500 to-purple-600'
    },
    {
      show: (user?.role === 'admin' || (user?.role === "teacher") && (user?.assignments || []).some((a: any) => !!a.subcourse_id || !!a.program_id)),
      to: routes.admin.lessons(),
      title: 'Lessons',
      description: 'Manage lessons',
      icon: '📝',
      color: 'from-pink-500 to-pink-600'
    },
    {
      show: user?.role === 'admin',
      to: routes.admin.teachers(),
      title: 'Teachers',
      description: 'Manage teacher accounts & assignments',
      icon: '👨‍💼',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-10">
      {/* Header Section */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-base sm:text-lg text-gray-600">Quick access to management tools</p>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {widgets.map((widget, idx) =>
          widget.show && (
            <Link
              key={idx}
              to={widget.to}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 touch-highlight"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${widget.color}`}></div>

              {/* Content */}
              <div className="relative p-6 flex flex-col justify-between min-h-[160px] sm:min-h-[200px]">
                {/* Icon */}
                <div className="text-4xl sm:text-5xl mb-4">{widget.icon}</div>

                {/* Text Content */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{widget.title}</h3>
                  <p className="text-white/80 text-xs sm:text-sm">{widget.description}</p>
                </div>

                {/* Arrow Indicator */}
                <div className="absolute top-4 right-4 text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
