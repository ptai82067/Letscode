export const routes = {
  home: () => '/',
  elementary: () => '/elementary',
  login: () => '/login',
  programs: (programId?: string) => (programId ? `/programs/${programId}/subcourses` : '/programs'),
  programSubcourses: (programId?: string) => (programId ? `/programs/${programId}/subcourses` : '/programs/:programId/subcourses'),
  subcourses: () => '/subcourses',
  subcourseLessons: (subcourseId?: string) => (subcourseId ? `/subcourses/${subcourseId}/lessons` : '/subcourses/:subcourseId/lessons'),
  lessons: () => '/lessons',
  lesson: (id?: string) => (id ? `/lessons/${id}` : '/lessons/:lessonId'),
  admin: {
    base: () => '/admin',
    programs: () => '/admin/programs',
    program: (id: string) => `/admin/programs/${id}`,
    programSubcourses: (programId: string) => `/admin/programs/${programId}/subcourses`,
    subcourses: () => '/admin/subcourses',
    subcourseLessons: (subcourseId: string) => `/admin/subcourses/${subcourseId}/lessons`,
    lessons: () => '/admin/lessons',
    lesson: (id: string) => `/admin/lessons/${id}`,
    teachers: () => '/admin/teachers',
    teacherHistory: () => '/admin/teacher-history',
  },
};

export default routes;
