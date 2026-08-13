import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { Users, Loader2, Dumbbell } from 'lucide-react';

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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilitiesRes = await apiClient.get('/v1/facilities');
        setFacilities(facilitiesRes.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

    };
    fetchData();
  }, []);


  const getSportBadgeColor = (sportName: string) => {
    switch (sportName?.toUpperCase()) {
      case 'BADMINTON':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'CRICKET':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'FOOTBALL':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'SWIMMING':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      case 'TABLE_TENNIS':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'PICKLEBALL':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      default:
        return 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30';
    }
  };

  const filteredFacilities =
    selectedSport === 'All'
      ? facilities
      : facilities.filter((f) => f.sportName?.toUpperCase() === selectedSport.toUpperCase());

  const tabList = ['All', 'Badminton', 'Cricket', 'Football', 'Swimming', 'Table Tennis', 'Pickleball'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#b3b3b3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1db954] mb-3" />
        <span className="text-sm font-medium">Loading sports directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Outfit',sans-serif]">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Browse Facilities</h2>
        <p className="text-sm text-[#b3b3b3] mt-1">Select a sport category to explore available courts and lanes</p>
      </div>

      {/* Sport Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabList.map((tab) => {
          const isActive = selectedSport.toLowerCase() === tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => setSelectedSport(tab)}
              className={`px-4 py-1.5 text-sm transition font-bold shrink-0 ${
                isActive
                  ? 'bg-[#1db954] text-black rounded-full shadow-md shadow-[#1db954]/20'
                  : 'text-[#b3b3b3] hover:text-white rounded-full'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="spotify-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${getSportBadgeColor(facility.sportName)}`}>
                  {facility.sportName}
                </span>
                <span className="text-xs text-[#b3b3b3] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Cap: {facility.capacity}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{facility.name}</h3>
              <p className="text-xs text-[#b3b3b3] mt-1 line-clamp-2 leading-relaxed">
                {facility.description || 'Professional facility with international standard equipment.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#282828] flex items-center justify-between">
              {facility.isActive ? (
                <>
                  <span className="text-xs text-[#1db954] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1db954]"></span> Available
                  </span>
                  <Link to={`/book/${facility.id}`} className="spotify-pill text-xs font-bold py-2 px-4">
                    Book Now
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-xs text-rose-400 font-medium">Unavailable</span>
                  <button disabled className="px-4 py-2 rounded-full bg-[#282828] text-xs text-[#b3b3b3] cursor-not-allowed">
                    Inactive
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredFacilities.length === 0 && (
          <div className="col-span-full py-16 text-center spotify-card">
            <Dumbbell className="w-10 h-10 text-[#b3b3b3] mx-auto mb-2" />
            <p className="text-[#b3b3b3] text-sm">No facilities available in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
