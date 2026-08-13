import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allMenuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['USER', 'ADMIN'] },
    { name: 'Browse Facilities', path: '/facilities', icon: Building2, roles: ['USER', 'ADMIN'] },
    { name: 'My Bookings', path: '/my-bookings', icon: CalendarCheck, roles: ['USER', 'ADMIN'] },
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter((item) => user?.role && item.roles.includes(user.role));

  const notifications = [
    { id: 1, title: 'Facility Update', desc: '3 courts available for today', time: '10m ago' },
    { id: 2, title: 'Booking Reminder', desc: 'Your next booking is in 2 hours', time: '1h ago' },
    { id: 3, title: 'Admin Notice', desc: '2 slots blocked for maintenance', time: '3h ago' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#121212] text-white">
      {/* Sidebar - Fixed Left (w-64, bg-black, border-r border-[#181818]) */}
      <aside className="hidden md:flex flex-col w-64 bg-black border-r border-[#181818] flex-shrink-0 h-screen sticky top-0">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-[#181818]">
          <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center font-bold text-black text-sm tracking-wider shadow-lg shadow-[#1db954]/20">
            SZ
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">CourtCraft</h1>
            <p className="text-[11px] text-[#b3b3b3]">Sports Booking Platform</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#181818] border-l-4 border-[#1db954] text-white font-semibold'
                    : 'text-[#b3b3b3] hover:bg-[#181818]/60 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#1db954]' : 'text-[#b3b3b3]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-[#181818] bg-[#000000]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#282828]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#1db954]/20 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] font-bold text-xs shrink-0">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className="text-[10px] text-[#1db954] font-mono uppercase font-bold tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-[#b3b3b3] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black border-b border-[#181818]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center font-bold text-black text-xs">
            SZ
          </div>
          <span className="font-bold text-base text-white">CourtCraft</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#b3b3b3] hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-b border-[#181818] p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-[#181818] border-l-4 border-[#1db954] text-white' : 'text-[#b3b3b3]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212]">
        {/* Top Header */}
        <header className="h-20 bg-[#121212]/90 backdrop-blur-md border-b border-[#181818] px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] border border-[#282828] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse"></span>
              <span className="text-[#b3b3b3] font-medium">Booking System Live</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-full bg-[#181818] border border-[#282828] text-[#b3b3b3] hover:text-white hover:border-[#383838] transition relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1db954]"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#181818] border border-[#282828] rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</h4>
                    <span className="text-[10px] text-[#1db954] font-medium">3 New</span>
                  </div>
                  <div className="divide-y divide-[#282828] mt-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{n.title}</span>
                          <span className="text-[10px] text-[#b3b3b3]">{n.time}</span>
                        </div>
                        <p className="text-xs text-[#b3b3b3] mt-0.5">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
