import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import Flatpickr from 'react-flatpickr';
import { Dumbbell, ArrowLeft, Loader2, CheckCircle2, ShieldAlert, Calendar, Clock } from 'lucide-react';

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

  const [facility, setFacility] = useState<Facility | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [durationText, setDurationText] = useState('0 hours');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const res = await apiClient.get(`/v1/facilities/${facilityId}`);
        setFacility(res.data?.data);
      } catch (err) {
        setError('Failed to fetch facility specifications.');
      } finally {
        setLoading(false);
      }
    };
    if (facilityId) fetchFacility();
  }, [facilityId]);

  useEffect(() => {
    if (startDate && endDate) {
      const diffMs = endDate.getTime() - startDate.getTime();
      if (diffMs > 0) {
        const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
        setDurationText(`${hours} hours`);
      } else {
        setDurationText('Invalid window');
      }
    }
  }, [startDate, endDate]);

  const toLocalISOString = (date: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':00'
    );
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!startDate || !endDate) {
      setError('Please select both start time and end time.');
      return;
    }

    const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      setError('End time must be after start time.');
      return;
    }
    if (diffHours > 3) {
      setError('Booking duration cannot exceed 3 hours.');
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.post('/v1/bookings', {
        facilityId: Number(facilityId),
        startTime: toLocalISOString(startDate),
        endTime: toLocalISOString(endDate),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#b3b3b3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1db954] mb-3" />
        <span className="text-sm font-medium">Loading court specs...</span>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="py-12 text-center text-[#b3b3b3]">
        <p>Facility not found.</p>
        <Link to="/facilities" className="text-[#1db954] text-xs underline mt-2 inline-block">
          Return to facilities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-['Outfit',sans-serif]">
      {/* Back button */}
      <Link to="/facilities" className="inline-flex items-center gap-2 text-xs font-semibold text-[#b3b3b3] hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Facilities
      </Link>

      {/* Header Info Card */}
      <div className="spotify-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-[#1db954] uppercase tracking-wider">
              {facility.sportName}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">{facility.name}</h2>
            <p className="text-xs text-[#b3b3b3] mt-1">{facility.description}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1db954]/10 text-[#1db954] flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Success Confirmation Card */}
      {success ? (
        <div className="bg-emerald-950/40 border border-[#1db954]/50 rounded-2xl p-6 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[#1db954] mx-auto" />
          <h3 className="text-xl font-bold text-white">Booking Confirmed!</h3>
          <p className="text-xs text-[#b3b3b3]">Your slot has been locked in database. See you on the court!</p>
          <div className="pt-2">
            <button onClick={() => navigate('/my-bookings')} className="spotify-pill">
              Go to My Bookings
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form Card */
        <div className="spotify-card p-6">
          <h3 className="text-base font-bold text-white mb-4">Reserve Time Slot</h3>

          {error && (
            <div className="mb-6 bg-red-950/30 border border-red-800/50 text-red-400 rounded-xl p-4 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Booking Conflict</p>
                <p className="mt-0.5 text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">
                  Start Time
                </label>
                <div className="relative flex items-center">
                  <Flatpickr
                    data-enable-time
                    options={{
                      dateFormat: 'd-m-Y H:i',
                      minDate: 'today',
                      time_24hr: true,
                    }}
                    value={startDate || ''}
                    onChange={([date]) => setStartDate(date)}
                    className="w-full bg-[#121212] border border-[#282828] rounded-xl pl-10 pr-4 py-3 text-white text-xs focus:outline-none focus:border-[#1db954] cursor-pointer"
                    placeholder="Select Start Date & Time"
                  />
                  <Calendar className="w-4 h-4 text-[#b3b3b3] absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">
                  End Time
                </label>
                <div className="relative flex items-center">
                  <Flatpickr
                    data-enable-time
                    options={{
                      dateFormat: 'd-m-Y H:i',
                      minDate: 'today',
                      time_24hr: true,
                    }}
                    value={endDate || ''}
                    onChange={([date]) => setEndDate(date)}
                    className="w-full bg-[#121212] border border-[#282828] rounded-xl pl-10 pr-4 py-3 text-white text-xs focus:outline-none focus:border-[#1db954] cursor-pointer"
                    placeholder="Select End Date & Time"
                  />
                  <Clock className="w-4 h-4 text-[#b3b3b3] absolute left-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Calculated duration badge */}
            <div className="p-3 bg-[#121212] rounded-xl border border-[#282828] flex items-center justify-between text-xs">
              <span className="text-[#b3b3b3]">Calculated Duration:</span>
              <span className="font-bold text-[#1db954]">{durationText}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="spotify-pill w-full flex items-center justify-center gap-2 mt-4 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Booking</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

