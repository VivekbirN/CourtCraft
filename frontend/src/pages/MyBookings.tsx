import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/v1/bookings/my');
      setBookings(res.data.data);
    } catch (err) {
      setError('Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiClient.delete(`/v1/bookings/${id}`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <div className="text-gray-500">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Facility</th>
              <th className="p-4">Sport</th>
              <th className="p-4">Start Time</th>
              <th className="p-4">End Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{booking.facilityName}</td>
                <td className="p-4 text-gray-600">{booking.sportName}</td>
                <td className="p-4 text-gray-600">{new Date(booking.startTime).toLocaleString()}</td>
                <td className="p-4 text-gray-600">{new Date(booking.endTime).toLocaleString()}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="p-4">
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-medium rounded transition"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
