import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider text-emerald-400">SportZone</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Sport Booking Platform</p>
        </div>
        <nav className="px-4 pb-6 space-y-2">
          <Link
            to="/facilities"
            className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium text-slate-200"
          >
            Facilities & Availability
          </Link>
          <Link
            to="/my-bookings"
            className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium text-slate-200"
          >
            My Bookings
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="block px-4 py-2.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60 transition font-medium"
            >
              Admin Dashboard
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-sm text-gray-500">Welcome back,</span>
            <span className="ml-1 font-semibold text-gray-800">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-600 border border-slate-200">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition"
          >
            Logout
          </button>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
