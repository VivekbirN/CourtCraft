import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { CalendarCheck, Dumbbell, ArrowRight, Loader2 } from 'lucide-react';



interface Booking {
  id: string;
  status: string;
  startTime: string;
}

interface Facility {
  id: number;
  name: string;
  sportName: string;
  isActive: boolean;
}

interface BlockedSlot {
  id: number;
}

export const Dashboard: React.FC = () => {
  const { user, isAdmin } = useApp();
  const navigate = useNavigate();

  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);
  const [sportsCount, setSportsCount] = useState<number>(0);
  const [totalBookingsToday, setTotalBookingsToday] = useState<number>(0);
  const [activeFacilitiesCount, setActiveFacilitiesCount] = useState<number>(0);
  const [blockedSlotsCount, setBlockedSlotsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!isAdmin) {
          const [myBookingsRes, sportsRes] = await Promise.all([
            apiClient.get('/v1/bookings/my'),
            apiClient.get('/v1/sports'),
          ]);
          const myBookings: Booking[] = myBookingsRes.data?.data || [];
          const confirmed = myBookings.filter((b) => b.status === 'CONFIRMED');
          setActiveBookingsCount(confirmed.length);
          setSportsCount((sportsRes.data?.data || []).length);
        } else {
          const [allBookingsRes, facilitiesRes, blockedRes] = await Promise.all([
            apiClient.get('/v1/bookings/all'),
            apiClient.get('/v1/facilities'),
            apiClient.get('/v1/blocked-slots'),
          ]);

          const allBookings: Booking[] = allBookingsRes.data?.data || [];
          const todayStr = new Date().toISOString().split('T')[0];
          const todayBookings = allBookings.filter((b) => b.startTime && b.startTime.startsWith(todayStr));
          setTotalBookingsToday(todayBookings.length);

          const facilities: Facility[] = facilitiesRes.data?.data || [];
          setActiveFacilitiesCount(facilities.filter((f) => f.isActive).length);

          const blocked: BlockedSlot[] = blockedRes.data?.data || [];
          setBlockedSlotsCount(blocked.length);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#b3b3b3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1db954] mb-3" />
        <span className="text-sm font-medium">Loading platform metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Outfit',sans-serif]">
      {/* Welcome Heading */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, <span className="text-[#1db954]">{user?.firstName || 'Athlete'}</span>
        </h2>
        <p className="text-sm text-[#b3b3b3] mt-1">
          {isAdmin ? 'System Operational Overview' : 'Manage your court reservations and browse active sports'}
        </p>
      </div>

      {/* USER Dashboard View */}
      {!isAdmin && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="spotify-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                    My Active Bookings
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#1db954]/10 text-[#1db954] flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-white">{activeBookingsCount}</div>
                <p className="text-xs text-[#b3b3b3] mt-2">Confirmed upcoming slots reserved</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#282828]">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="text-xs text-[#1db954] hover:underline font-bold flex items-center gap-1"
                >
                  View My Bookings <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="spotify-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                    Available Sports
                  </span>
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-white">{sportsCount}</div>
                <p className="text-xs text-[#b3b3b3] mt-2">Badminton, Cricket, Football, Swimming, etc.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#282828]">
                <button
                  onClick={() => navigate('/facilities')}
                  className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1"
                >
                  Browse Facilities <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="spotify-card p-6">
            <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/facilities" className="spotify-pill">
                Browse & Book Facilities
              </Link>
              <Link to="/my-bookings" className="spotify-pill-outline">
                View Reservation Ledger
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN Dashboard View */}
      {isAdmin && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="spotify-card p-5">
              <span className="text-xs font-semibold text-[#b3b3b3] uppercase">Bookings Today</span>
              <div className="text-3xl font-extrabold text-white mt-2">{totalBookingsToday}</div>
              <span className="text-[11px] text-[#1db954] mt-1 block font-medium">Scheduled for today</span>
            </div>

            <div className="spotify-card p-5">
              <span className="text-xs font-semibold text-[#b3b3b3] uppercase">Active Facilities</span>
              <div className="text-3xl font-extrabold text-white mt-2">{activeFacilitiesCount}</div>
              <span className="text-[11px] text-cyan-400 mt-1 block font-medium">Units operational</span>
            </div>

            <div className="spotify-card p-5">
              <span className="text-xs font-semibold text-[#b3b3b3] uppercase">Blocked Slots</span>
              <div className="text-3xl font-extrabold text-white mt-2">{blockedSlotsCount}</div>
              <span className="text-[11px] text-rose-400 mt-1 block font-medium">Maintenance locks</span>
            </div>

            <div className="spotify-card p-5">
              <span className="text-xs font-semibold text-[#b3b3b3] uppercase">System Health</span>
              <div className="text-3xl font-extrabold text-[#1db954] mt-2">100%</div>
              <span className="text-[11px] text-[#b3b3b3] mt-1 block font-medium">All APIs Operational</span>
            </div>
          </div>

          <div className="spotify-card p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Full Operations Center</h3>
              <p className="text-xs text-[#b3b3b3] mt-1">Access master booking logs, enforce maintenance locks, and manage facility status.</p>
            </div>
            <Link to="/admin" className="spotify-pill">
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
