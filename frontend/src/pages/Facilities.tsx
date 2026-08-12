import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

interface Sport {
  id: number;
  name: String;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sportsRes = await apiClient.get('/v1/sports');
        setSports(sportsRes.data.data);

        const facilitiesRes = await apiClient.get('/v1/facilities');
        setFacilities(facilitiesRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFacilities = selectedSportId
    ? facilities.filter((f) => f.sportId === selectedSportId)
    : facilities;

  if (loading) {
    return <div className="text-gray-500">Loading sports and facilities...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Sports Facilities</h2>
        <p className="text-sm text-gray-500">Select a sport to filter facilities and book your slot</p>
      </div>

      {/* Sport Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setSelectedSportId(null)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            selectedSportId === null
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          All Sports
        </button>
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSelectedSportId(sport.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              selectedSportId === sport.id
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            {sport.name}
          </button>
        ))}
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  {facility.sportName}
                </span>
                <span className="text-xs text-gray-400">Cap: {facility.capacity}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{facility.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{facility.description}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-emerald-600 font-medium">● Available for Booking</span>
              <Link
                to={`/book/${facility.id}`}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition"
              >
                Book Slot
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
