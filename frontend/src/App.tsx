import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import ProgramsAdmin from './pages/programs/Programs';
import Subcourses from './pages/subcourses/Subcourses';
import Lessons from './pages/lessons/Lessons';
import LessonDetail from './pages/lessons/LessonDetail';
import LessonDetailPublic from './pages/public/LessonDetailPublic';
import ListSubCourse from './pages/public/ListSubCourse';
import ListLesson from './pages/public/ListLesson';
import ProgramsPublic from './pages/public/Programs';
import ProgramSubcourses from './pages/public/ProgramSubcourses';
import PrivateRoute from './components/PrivateRoute';
import AdminHome from './pages/admin/AdminHome';
import HomeStudents from './pages/public/HomeStudents';
import ElementaryStudents from './pages/public/ElementaryStudents';
import Teachers from './pages/admin/Teachers';
import TeacherHistory from './pages/admin/TeacherHistory';
import { routes } from './routes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path={routes.home()} element={<HomeStudents />} />
          <Route path={routes.elementary()} element={<ElementaryStudents />} />
          <Route path={routes.login()} element={<Login />} />
          
          {/* Public listing routes */}
          <Route path={routes.programs()} element={<ProgramsPublic />} />
          <Route path={routes.programSubcourses()} element={<ProgramSubcourses />} />
          <Route path={routes.subcourses()} element={<ListSubCourse />} />
          <Route path={routes.subcourseLessons()} element={<ListLesson />} />
          <Route path={routes.lessons()} element={<ListLesson />} />
          <Route path={routes.lesson()} element={<LessonDetailPublic />} />
          <Route path="/admin/teachers" element={<Teachers />} />

          {/* Protected Admin Routes */}
          <Route
            path={routes.admin.base()}
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="programs" element={<ProgramsAdmin />} />
            <Route path="programs/:programId/subcourses" element={<Subcourses />} />
            <Route path="subcourses" element={<Subcourses />} />
            <Route path="subcourses/:subcourseId/lessons" element={<Lessons />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="lessons/:lessonId" element={<LessonDetail />} />
            <Route path="teacher-history" element={<TeacherHistory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
