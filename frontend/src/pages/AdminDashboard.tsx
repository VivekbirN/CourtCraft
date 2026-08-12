import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

interface Booking {
  id: string;
  userEmail: string;
  userName: string;
  facilityName: string;
  sportName: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface BlockedSlot {
  id: number;
  facilityName: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdByEmail: string;
}

interface Facility {
  id: number;
  name: string;
  sportName: string;
  isActive: boolean;
}

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'bookings' | 'blocked' | 'facilities'>('bookings');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Block slot form state
  const [facilityId, setFacilityId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  const fetchAllData = async () => {
    try {
      const bookingsRes = await apiClient.get('/v1/bookings/all');
      setBookings(bookingsRes.data.data);

      const blockedRes = await apiClient.get('/v1/blocked-slots');
      setBlockedSlots(blockedRes.data.data);

      const facilitiesRes = await apiClient.get('/v1/facilities');
      setFacilities(facilitiesRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/v1/blocked-slots', {
        facilityId: Number(facilityId),
        startTime,
        endTime,
        reason,
      });
      alert('Slot blocked successfully');
      setReason('');
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to block slot');
    }
  };

  const handleDeleteBlockedSlot = async (id: number) => {
    try {
      await apiClient.delete(`/v1/blocked-slots/${id}`);
      fetchAllData();
    } catch (err) {
      alert('Failed to unblock slot');
    }
  };

  const handleDeactivateFacility = async (id: number) => {
    if (!confirm('Deactivate facility?')) return;
    try {
      await apiClient.patch(`/v1/facilities/${id}/deactivate`);
      fetchAllData();
    } catch (err) {
      alert('Failed to deactivate facility');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setTab('bookings')}
          className={`pb-2 text-sm font-semibold border-b-2 transition ${
            tab === 'bookings' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'
          }`}
        >
          All Bookings
        </button>
        <button
          onClick={() => setTab('blocked')}
          className={`pb-2 text-sm font-semibold border-b-2 transition ${
            tab === 'blocked' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'
          }`}
        >
          Block Slots
        </button>
        <button
          onClick={() => setTab('facilities')}
          className={`pb-2 text-sm font-semibold border-b-2 transition ${
            tab === 'facilities' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'
          }`}
        >
          Manage Facilities
        </button>
      </div>

      {/* Tab Content: Bookings */}
      {tab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 font-semibold border-b text-gray-600">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Facility</th>
                <th className="p-4">Start Time</th>
                <th className="p-4">End Time</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="p-4">{b.userName} ({b.userEmail})</td>
                  <td className="p-4">{b.facilityName}</td>
                  <td className="p-4">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="p-4">{new Date(b.endTime).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 text-xs rounded font-medium bg-gray-100">{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Blocked Slots */}
      {tab === 'blocked' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateBlockedSlot} className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-800">Block a Facility Slot</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Facility</label>
                <select
                  required
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="">Select Facility</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.sportName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maintenance"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700">
              Block Slot
            </button>
          </form>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 font-semibold border-b text-gray-600">
                <tr>
                  <th className="p-4">Facility</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Start Time</th>
                  <th className="p-4">End Time</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blockedSlots.map((bs) => (
                  <tr key={bs.id}>
                    <td className="p-4 font-medium">{bs.facilityName}</td>
                    <td className="p-4">{bs.reason}</td>
                    <td className="p-4">{new Date(bs.startTime).toLocaleString()}</td>
                    <td className="p-4">{new Date(bs.endTime).toLocaleString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteBlockedSlot(bs.id)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-medium rounded"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Facilities */}
      {tab === 'facilities' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 font-semibold border-b text-gray-600">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Facility Name</th>
                <th className="p-4">Sport</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facilities.map((f) => (
                <tr key={f.id}>
                  <td className="p-4">{f.id}</td>
                  <td className="p-4 font-medium">{f.name}</td>
                  <td className="p-4">{f.sportName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs rounded ${f.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    {f.isActive && (
                      <button
                        onClick={() => handleDeactivateFacility(f.id)}
                        className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium rounded border border-red-200"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
