import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

interface Facility {
  id: number;
  name: string;
  sportName: string;
  description: string;
}

export const BookSlot: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const res = await apiClient.get(`/v1/facilities/${facilityId}`);
        setFacility(res.data.data);
      } catch (err) {
        setError('Failed to fetch facility details.');
      }
    };
    if (facilityId) fetchFacility();
  }, [facilityId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await apiClient.post('/v1/bookings', {
        facilityId: Number(facilityId),
        startTime,
        endTime,
      });
      setSuccess('Booking confirmed successfully!');
      setTimeout(() => navigate('/my-bookings'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book slot. Please try another time.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!facility) return <div className="text-gray-500">Loading facility details...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800">Book {facility.name}</h2>
      <p className="text-xs text-emerald-600 font-semibold mb-4">{facility.sportName}</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Time</label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Time</label>
          <input
            type="datetime-local"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-md transition shadow"
        >
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};
