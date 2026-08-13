import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, XCircle, Loader2, Search } from 'lucide-react';

interface Booking {
  id: string;
  facilityName: string;
  sportName: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export const MyBookings: React.FC = () => {
  const { showToast } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/v1/bookings/my');
      setBookings(res.data.data || []);
    } catch (err) {
      showToast('Failed to fetch your bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(id);
    try {
      await apiClient.delete(`/v1/bookings/${id}`);
      showToast('Booking cancelled successfully', 'success');
      fetchBookings();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel booking. 30-min window may have passed.';
      showToast(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sportName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-sm font-medium">Retrieving booking ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E1526] p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-2xl font-extrabold text-white">My Active & Past Bookings</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your reserved slots and manage upcoming sessions
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search facility or sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      {/* Bookings Card List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);
          const isConfirmed = booking.status === 'CONFIRMED';

          return (
            <div
              key={booking.id}
              className="bg-[#0E1526] border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isConfirmed
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}
                >
                  <Calendar className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {booking.sportName}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">{booking.facilityName}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {start.toLocaleDateString()} ({start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isConfirmed && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancellingId === booking.id}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2 self-start md:self-auto"
                >
                  {cancellingId === booking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="py-16 text-center bg-[#0E1526] rounded-2xl border border-slate-800">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-slate-300 font-bold">No bookings recorded</h4>
            <p className="text-xs text-slate-500 mt-1">You haven't reserved any facility slots yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
