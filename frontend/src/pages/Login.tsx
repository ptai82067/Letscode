import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { routes } from '../routes';
import type { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate(routes.home());
    } catch (err: unknown) {
      let message = 'Login failed';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as AxiosError;
        // axiosErr.response?.data may be unknown; guard accordingly
        const respData = axiosErr.response?.data as unknown;
        if (respData && typeof respData === 'object' && 'error' in respData) {
          const maybeError = (respData as Record<string, unknown>).error;
          if (typeof maybeError === 'string') message = maybeError;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(typeof message === 'string' ? message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-2">
              Let&rsquo;s code
            </h1>
            <p className="text-gray-600 text-sm">Đăng nhập để bắt đầu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white text-black"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white text-black"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
            >
              ← Trở về trang chủ
            </Link>
          </div>
        </div>

        {/* Bottom decoration text */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p>CourseAI Learning Platform</p>
        </div>
      </div>
    </div>
  );
}
