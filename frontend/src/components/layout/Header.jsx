// components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';
import EnterVU from '~/assets/EnterVU_logo.png';

const Header = () => {
  const { user, logout } = useAuth(); // ✅ Use the hook!
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={EnterVU}
              alt="EnterVU Logo"
              className="h-10 w-auto object-contain" // fixed height
            />
            <h1 className="text-xl font-bold text-gray-900">EnterVU</h1>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              {/* Docs Button */}
              <Link
                to="/docs"
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Docs</span>
              </Link>
              
              <div className="text-right">
                <span className="text-sm font-medium">
                  {user.name || user.email?.split('@')[0] || 'User'}
                </span>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="h-10 w-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-700"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Docs Button for non-logged in users */}
              <Link
                to="/docs"
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Docs</span>
              </Link>
              
              <Link
                to="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;