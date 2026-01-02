import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { routes } from '../../routes';

const StudentsHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; href: string }[] = [];

  const { user } = useAuth();
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleCreate = () => {
    if (!user) return navigate(routes.login());
    // Open admin dashboard for any authenticated user
    return navigate(routes.admin.base());
  };

  const handleLogout = () => {
    logout();
    navigate(routes.home());
  };

  return (
    <header className="bg-code-teal text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent hover:scale-110 transition-transform">
              Let's code
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hover:text-gray-200 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-white text-code-teal rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Create
            </button>
            {!user ? (
              <Link
                to="/login"
                className="px-4 py-2 border border-white rounded-md hover:bg-white hover:text-code-teal transition-colors"
              >
                Sign in
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 border border-white rounded-md">{user.username}</span>
                <button onClick={handleLogout} className="px-3 py-2 bg-red-500 rounded-md text-white hover:bg-red-600">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="hover:text-gray-200 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/20 flex flex-col space-y-2">
                <button onClick={handleCreate} className="px-4 py-2 bg-white text-code-teal rounded-md font-semibold">
                  Create
                </button>
                {!user ? (
                  <Link
                    to="/login"
                    className="px-4 py-2 border border-white rounded-md text-center hover:bg-white hover:text-code-teal transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-2">
                    <span className="px-3 py-2 border border-white rounded-md">{user.username}</span>
                    <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="px-3 py-2 bg-red-500 rounded-md text-white">Logout</button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default StudentsHeader;
