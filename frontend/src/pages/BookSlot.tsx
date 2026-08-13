import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { Dumbbell, Calendar, Clock, CheckCircle2, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';


interface Facility {
  id: number;
  name: string;
  sportName: string;
  description: string;
  capacity: number;
}

export const BookSlot: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const res = await apiClient.get(`/v1/facilities/${facilityId}`);
        setFacility(res.data.data);
      } catch (err) {
        setError('Failed to fetch facility details.');
      } finally {
        setLoading(false);
      }
    };
    if (facilityId) fetchFacility();
  }, [facilityId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiClient.post('/v1/bookings', {
        facilityId: Number(facilityId),
        startTime,
        endTime,
      });
      showToast('Booking reserved successfully!', 'success');
      navigate('/my-bookings');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete booking. Conflict or validation error.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-sm font-medium">Loading facility parameters...</span>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400">Facility not found.</p>
        <Link to="/facilities" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
          Return to facilities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/facilities"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Facilities</span>
      </Link>

      {/* Facility Header Card */}
      <div className="bg-[#0E1526] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              {facility.sportName}
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2">{facility.name}</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{facility.description}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Booking Rules Infobox */}
        <div className="mt-6 p-3 bg-slate-900/80 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Max Duration</span>
            <span className="font-bold text-slate-300">3 Hours</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Advance Window</span>
            <span className="font-bold text-slate-300">Up to 7 Days</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Cancellation</span>
            <span className="font-bold text-slate-300">&gt; 30 mins prior</span>
          </div>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="bg-[#0E1526] border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Select Reservation Slot</h3>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Booking Rejected</p>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Start Time
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                End Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 text-sm mt-4"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Acquiring Lock & Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Reservation</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
