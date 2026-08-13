import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Dumbbell,
  User as UserIcon,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';


export const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin, toasts, removeToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Facilities & Availability',
      path: '/facilities',
      icon: Dumbbell,
      adminOnly: false,
    },
    {
      label: 'My Bookings',
      path: '/my-bookings',
      icon: CalendarCheck,
      adminOnly: false,
    },
    {
      label: 'Admin Control Center',
      path: '/admin',
      icon: ShieldCheck,
      adminOnly: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#090D16] text-slate-100 font-['Inter',sans-serif]">
      {/* Toast Notification Floating Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
              <span className="text-sm font-medium">{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0E1526] border-r border-slate-800/80 flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SportZone
            </h1>
            <p className="text-xs text-slate-500 font-medium">Facility Booking Platform</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Main Navigation
          </div>
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-slate-800/60 bg-[#0B101D]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-200 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-emerald-400 font-mono font-medium tracking-wide">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0E1526] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-bold text-lg text-white">SportZone</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0E1526] border-b border-slate-800 p-4 space-y-2">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#090D16]">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-slate-800/60 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-semibold text-slate-400">Multi-Sport Complex Portal</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">System Online</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Component Outlet */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
