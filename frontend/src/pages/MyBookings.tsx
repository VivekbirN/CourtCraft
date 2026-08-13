import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { CalendarCheck, Clock, Loader2 } from 'lucide-react';


interface Booking {
  id: string;
  facilityName: string;
  sportName: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED';
}

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Cancelled'>('All');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/v1/bookings/my');
      setBookings(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelExecute = async (id: string) => {
    setCancellingId(id);
    setCancelError(null);
    try {
      await apiClient.delete(`/v1/bookings/${id}`);
      setConfirmCancelId(null);
      fetchBookings();
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Cancellation failed. 30-min window may have passed.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'Confirmed') return b.status === 'CONFIRMED';
    if (filter === 'Cancelled') return b.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#b3b3b3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1db954] mb-3" />
        <span className="text-sm font-medium">Fetching your bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Outfit',sans-serif]">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">My Bookings</h2>
          <p className="text-sm text-[#b3b3b3] mt-1">Manage your active reservations and view past bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#181818] rounded-full border border-[#282828] self-start sm:self-auto">
          {(['All', 'Confirmed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                filter === tab ? 'bg-[#1db954] text-black' : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {cancelError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {cancelError}
        </div>
      )}

      {/* Bookings Stacked List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const isConfirmed = booking.status === 'CONFIRMED';
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);

          return (
            <div key={booking.id} className="spotify-card p-5 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1db954] uppercase tracking-wider">
                      {booking.sportName}
                    </span>
                    <span
                      className={
                        isConfirmed
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-semibold'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold'
                      }
                    >
                      {booking.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">{booking.facilityName}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#b3b3b3] mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {start.toLocaleDateString()} ({start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                </div>

                {isConfirmed && confirmCancelId !== booking.id && (
                  <button
                    onClick={() => setConfirmCancelId(booking.id)}
                    className="spotify-pill-outline py-1.5 px-4 text-xs hover:border-rose-500 hover:text-rose-400"
                  >
                    Cancel Slot
                  </button>
                )}
              </div>

              {/* Inline Confirmation Row */}
              {confirmCancelId === booking.id && (
                <div className="pt-3 border-t border-[#282828] flex items-center justify-between text-xs bg-[#121212] p-3 rounded-xl">
                  <span className="text-rose-400 font-semibold">Are you sure? This cannot be undone.</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCancelExecute(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold transition"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setConfirmCancelId(null)}
                      className="px-3 py-1.5 bg-[#282828] hover:bg-[#383838] text-white rounded-full font-bold transition"
                    >
                      Keep Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="spotify-card py-16 text-center">
            <CalendarCheck className="w-12 h-12 text-[#b3b3b3] mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No bookings yet</h4>
            <p className="text-xs text-[#b3b3b3] mt-1 mb-4">You have not made any bookings under this filter.</p>
            <Link to="/facilities" className="spotify-pill">
              Browse Facilities
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
