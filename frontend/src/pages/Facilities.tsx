import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Dumbbell, Users, ChevronRight, Loader2, RefreshCw } from 'lucide-react';


interface Sport {
  id: number;
  name: string;
  description: string;
}

interface Facility {
  id: number;
  sportId: number;
  sportName: string;
  name: string;
  description: string;
  capacity: number;
  isActive: boolean;
}

export const Facilities: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [sportsRes, facilitiesRes] = await Promise.all([
        apiClient.get('/v1/sports'),
        apiClient.get('/v1/facilities'),
      ]);
      setSports(sportsRes.data.data || []);
      setFacilities(facilitiesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load facilities', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredFacilities = selectedSportId
    ? facilities.filter((f) => f.sportId === selectedSportId)
    : facilities;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-sm font-medium">Loading sports & facility directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E1526] p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sports Facilities Directory</h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse courts and venues across 6 sports. Check availability and reserve your slot.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Sport Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSportId(null)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
            selectedSportId === null
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-[#0E1526] text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          All Sports ({facilities.length})
        </button>
        {sports.map((sport) => {
          const count = facilities.filter((f) => f.sportId === sport.id).length;
          return (
            <button
              key={sport.id}
              onClick={() => setSelectedSportId(sport.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
                selectedSportId === sport.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0E1526] text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{sport.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedSportId === sport.id ? 'bg-slate-950/20 text-slate-900' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="bg-[#0E1526] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group hover:shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  {facility.sportName}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cap: {facility.capacity}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                {facility.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                {facility.description || 'Professional sport facility equipped with standard infrastructure.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-400">Available</span>
              </div>

              <Link
                to={`/book/${facility.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition duration-200"
              >
                <span>Book Slot</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}

        {filteredFacilities.length === 0 && (
          <div className="col-span-full py-16 text-center bg-[#0E1526] rounded-2xl border border-slate-800">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-slate-300 font-bold">No facilities found</h4>
            <p className="text-xs text-slate-500 mt-1">No active units are registered under this sport category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
