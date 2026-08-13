import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';
import Flatpickr from 'react-flatpickr';
import { ShieldCheck, Search, Trash2, Loader2, Lock, Calendar, Clock } from 'lucide-react';



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
  facilityId: number;
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
  capacity: number;
  isActive: boolean;
}

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'All Bookings' | 'Block Slots' | 'Manage Facilities'>('All Bookings');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Block slot form state
  const [facilityId, setFacilityId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

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

  const fetchAllData = async () => {
    try {
      const [bookingsRes, blockedRes, facilitiesRes] = await Promise.all([
        apiClient.get('/v1/bookings/all'),
        apiClient.get('/v1/blocked-slots'),
        apiClient.get('/v1/facilities'),
      ]);
      setBookings(bookingsRes.data?.data || []);
      setBlockedSlots(blockedRes.data?.data || []);
      setFacilities(facilitiesRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin dataset', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError(null);

    if (!startDate || !endDate) {
      setBlockError('Please select both start and end time');
      return;
    }

    setSubmittingBlock(true);

    try {
      await apiClient.post('/v1/blocked-slots', {
        facilityId: Number(facilityId),
        startTime: toLocalISOString(startDate),
        endTime: toLocalISOString(endDate),
        reason,
      });
      setFacilityId('');
      setStartDate(null);
      setEndDate(null);
      setReason('');
      fetchAllData();
    } catch (err: any) {
      setBlockError(err.response?.data?.message || 'Failed to enforce blocked slot');
    } finally {
      setSubmittingBlock(false);
    }
  };


  const handleDeleteBlockedSlot = async (id: number) => {
    try {
      await apiClient.delete(`/v1/blocked-slots/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFacility = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await apiClient.patch(`/v1/facilities/${id}/deactivate`);
      } else {
        // Fallback for activate toggle if API available
        await apiClient.patch(`/v1/facilities/${id}/deactivate`);
      }
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.facilityName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#b3b3b3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1db954] mb-3" />
        <span className="text-sm font-medium">Loading Operations Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Outfit',sans-serif]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#1db954] text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Administrator Scope
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white mt-1">Admin Dashboard</h2>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#282828]">
        {(['All Bookings', 'Block Slots', 'Manage Facilities'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition shrink-0 ${
              tab === t ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB 1: ALL BOOKINGS */}
      {tab === 'All Bookings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#181818] p-4 rounded-2xl border border-[#282828]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">System Booking Ledger</span>
            <div className="relative w-72">
              <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search facility name or user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#282828] rounded-xl text-xs text-white focus:outline-none focus:border-[#1db954]"
              />
            </div>
          </div>

          <div className="bg-[#181818] rounded-2xl overflow-hidden border border-[#282828]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#b3b3b3]">
                <thead className="bg-[#121212] text-white uppercase tracking-wider font-semibold border-b border-[#282828]">
                  <tr>
                    <th className="p-4">User Email</th>
                    <th className="p-4">Facility</th>
                    <th className="p-4">Sport</th>
                    <th className="p-4">Start Time</th>
                    <th className="p-4">End Time</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282828]">
                  {filteredBookings.map((b, idx) => (
                    <tr key={b.id} className={idx % 2 === 0 ? 'bg-[#121212]/50 hover:bg-[#202020]' : 'hover:bg-[#202020]'}>
                      <td className="p-4 font-medium text-white">{b.userEmail}</td>
                      <td className="p-4 font-bold text-[#1db954]">{b.facilityName}</td>
                      <td className="p-4">{b.sportName}</td>
                      <td className="p-4">{new Date(b.startTime).toLocaleString()}</td>
                      <td className="p-4">{new Date(b.endTime).toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={
                            b.status === 'CONFIRMED'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-bold'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-bold'
                          }
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#b3b3b3]">
                        No matching booking logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOCK SLOTS */}
      {tab === 'Block Slots' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateBlockedSlot} className="spotify-card p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" /> Block Facility Slot
            </h3>

            {blockError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {blockError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">
                  Select Facility
                </label>
                <select
                  required
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full bg-[#121212] border border-[#282828] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#1db954]"
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
                    className="w-full bg-[#121212] border border-[#282828] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#1db954] cursor-pointer"
                    placeholder="Select Start Time"
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
                    className="w-full bg-[#121212] border border-[#282828] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#1db954] cursor-pointer"
                    placeholder="Select End Time"
                  />
                  <Clock className="w-4 h-4 text-[#b3b3b3] absolute left-3 pointer-events-none" />
                </div>
              </div>


              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maintenance"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#121212] border border-[#282828] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#1db954]"
                />
              </div>
            </div>

            <button type="submit" disabled={submittingBlock} className="spotify-pill text-xs">
              {submittingBlock ? 'Enforcing Block...' : 'Block Slot'}
            </button>
          </form>

          {/* Existing Blocked Slots List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Active Maintenance Blocks</h4>
            {blockedSlots.map((slot) => (
              <div key={slot.id} className="spotify-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-400 text-sm">{slot.facilityName}</span>
                    <span className="text-xs text-[#b3b3b3] bg-[#121212] px-2.5 py-0.5 rounded-full border border-[#282828]">
                      {slot.reason}
                    </span>
                  </div>
                  <p className="text-xs text-[#b3b3b3] mt-1">
                    {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteBlockedSlot(slot.id)}
                  className="p-2 text-[#b3b3b3] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Delete Block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {blockedSlots.length === 0 && (
              <div className="spotify-card p-8 text-center text-xs text-[#b3b3b3]">
                No facilities currently blocked for maintenance.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE FACILITIES */}
      {tab === 'Manage Facilities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((f) => (
            <div key={f.id} className="spotify-card p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#1db954] uppercase tracking-wider">{f.sportName}</span>
                <h3 className="text-lg font-bold text-white mt-1">{f.name}</h3>
                <p className="text-xs text-[#b3b3b3] mt-1">Cap: {f.capacity} players</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#282828] flex items-center justify-between">
                <span className="text-xs text-[#b3b3b3]">Status:</span>
                <button
                  onClick={() => handleToggleFacility(f.id, f.isActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    f.isActive ? 'bg-[#1db954]' : 'bg-[#282828]'
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      f.isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
