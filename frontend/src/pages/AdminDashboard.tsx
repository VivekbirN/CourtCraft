import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Calendar, Lock, Dumbbell, Search, Trash2, Loader2, AlertOctagon } from 'lucide-react';


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
  const { showToast } = useApp();
  const [tab, setTab] = useState<'bookings' | 'blocked' | 'facilities'>('bookings');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter states
  const [bookingSearch, setBookingSearch] = useState('');

  // Block slot form state
  const [facilityId, setFacilityId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [submittingBlock, setSubmittingBlock] = useState(false);

  const fetchAllData = async () => {
    try {
      const [bookingsRes, blockedRes, facilitiesRes] = await Promise.all([
        apiClient.get('/v1/bookings/all'),
        apiClient.get('/v1/blocked-slots'),
        apiClient.get('/v1/facilities'),
      ]);
      setBookings(bookingsRes.data.data || []);
      setBlockedSlots(blockedRes.data.data || []);
      setFacilities(facilitiesRes.data.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load admin dataset', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBlock(true);

    try {
      await apiClient.post('/v1/blocked-slots', {
        facilityId: Number(facilityId),
        startTime,
        endTime,
        reason,
      });
      showToast('Slot blocked for maintenance', 'success');
      setFacilityId('');
      setStartTime('');
      setEndTime('');
      setReason('');
      fetchAllData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to block slot', 'error');
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleDeleteBlockedSlot = async (id: number) => {
    try {
      await apiClient.delete(`/v1/blocked-slots/${id}`);
      showToast('Blocked slot released', 'success');
      fetchAllData();
    } catch (err) {
      showToast('Failed to delete blocked slot', 'error');
    }
  };

  const handleDeactivateFacility = async (id: number) => {
    if (!confirm('Deactivate this facility? Users will no longer be able to book it.')) return;
    try {
      await apiClient.patch(`/v1/facilities/${id}/deactivate`);
      showToast('Facility status updated', 'success');
      fetchAllData();
    } catch (err) {
      showToast('Failed to update facility status', 'error');
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.facilityName.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-sm font-medium">Initializing Admin Operations Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0E1526] p-6 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Privilege Scope</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Platform Operations Control Center</h2>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              tab === 'bookings'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setTab('blocked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              tab === 'blocked'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Block Slots ({blockedSlots.length})
          </button>
          <button
            onClick={() => setTab('facilities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              tab === 'facilities'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Facilities ({facilities.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ALL BOOKINGS */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0E1526] p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-300">Master Booking Ledger</h3>
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search user, email or court..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          <div className="bg-[#0E1526] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Facility</th>
                    <th className="p-4">Start Time</th>
                    <th className="p-4">End Time</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-semibold text-slate-200">
                        {b.userName}
                        <span className="block text-[10px] text-slate-500 font-normal">{b.userEmail}</span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        {b.facilityName}
                        <span className="block text-[10px] text-slate-500 font-normal">{b.sportName}</span>
                      </td>
                      <td className="p-4 text-slate-400">{new Date(b.startTime).toLocaleString()}</td>
                      <td className="p-4 text-slate-400">{new Date(b.endTime).toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No booking records matching query.
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
      {tab === 'blocked' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateBlockedSlot} className="bg-[#0E1526] p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              <span>Schedule Facility Maintenance Block</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Facility
                </label>
                <select
                  required
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="">Select Target Facility</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.sportName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surface Maintenance"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingBlock}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 text-xs transition flex items-center gap-2"
            >
              {submittingBlock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Enforce Maintenance Lock</span>
            </button>
          </form>

          {/* Blocked Slots List */}
          <div className="bg-[#0E1526] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-300">Active Maintenance Window Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Facility</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Start Time</th>
                    <th className="p-4">End Time</th>
                    <th className="p-4">Created By</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {blockedSlots.map((bs) => (
                    <tr key={bs.id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-bold text-rose-400">{bs.facilityName}</td>
                      <td className="p-4 text-slate-300">{bs.reason}</td>
                      <td className="p-4 text-slate-400">{new Date(bs.startTime).toLocaleString()}</td>
                      <td className="p-4 text-slate-400">{new Date(bs.endTime).toLocaleString()}</td>
                      <td className="p-4 text-slate-500">{bs.createdByEmail}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteBlockedSlot(bs.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border border-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Release Lock</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blockedSlots.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No facilities currently locked for maintenance.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE FACILITIES */}
      {tab === 'facilities' && (
        <div className="bg-[#0E1526] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-300">Facility Operational Status Controls</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Facility Name</th>
                  <th className="p-4">Sport</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Operational Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {facilities.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono text-slate-500">#{f.id}</td>
                    <td className="p-4 font-bold text-slate-200">{f.name}</td>
                    <td className="p-4 text-emerald-400 font-semibold">{f.sportName}</td>
                    <td className="p-4 text-slate-400">{f.capacity} players</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          f.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {f.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4">
                      {f.isActive && (
                        <button
                          onClick={() => handleDeactivateFacility(f.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg text-[11px] font-bold transition border border-slate-700"
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
        </div>
      )}
    </div>
  );
};
