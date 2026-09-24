import React, { useState } from 'react';
import { Clock, MapPin, Search, Train as TrainIcon, ArrowRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { LIVE_STATION_DATA, TRAINS } from '../data/trainsData';
import { TrainInfo } from '../types/railway';

interface LiveStationViewProps {
  onSelectTrain: (train: TrainInfo) => void;
}

export const LiveStationView: React.FC<LiveStationViewProps> = ({ onSelectTrain }) => {
  const [stationCode, setStationCode] = useState('BPL');
  const [filterType, setFilterType] = useState<'All' | 'Arrival' | 'Departure'>('All');

  const stations = [
    { code: 'BPL', name: 'Bhopal Junction' },
    { code: 'UJN', name: 'Ujjain Junction' },
    { code: 'KOTA', name: 'Kota Junction' },
    { code: 'JU', name: 'Jodhpur Junction' },
  ];

  const currentStationName = stations.find((s) => s.code === stationCode)?.name || stationCode;
  const trainList = (LIVE_STATION_DATA[stationCode] || LIVE_STATION_DATA['BPL']).filter(
    (item) => filterType === 'All' || item.type === filterType
  );

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <div className="bg-[#0a1329] text-white p-5 rounded-b-3xl shadow-xl">
        <h2 className="text-xl font-bold">Live Station Board</h2>
        <p className="text-xs text-slate-300 mt-1">Real-time train arrivals, departures & platform numbers</p>

        {/* Station switcher tabs */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {stations.map((st) => (
            <button
              key={st.code}
              onClick={() => setStationCode(st.code)}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                stationCode === st.code
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              {st.name} ({st.code})
            </button>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="mt-3 flex items-center gap-2 p-1 bg-[#121f3d] rounded-xl border border-[#1e325c]">
          {(['All', 'Arrival', 'Departure'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === type
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {type === 'All' ? 'All Trains' : type === 'Arrival' ? 'Arrivals' : 'Departures'}
            </button>
          ))}
        </div>
      </div>

      {/* Train list */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>{currentStationName} ({trainList.length} Trains)</span>
          <span className="text-blue-700 font-semibold">Live Platform Updates</span>
        </div>

        {trainList.map((item, idx) => (
          <div
            key={`${item.trainNumber}-${idx}`}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">{item.trainName}</span>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {item.trainNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>{item.from}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>{item.to}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                  {item.platform}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.type === 'Arrival' ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Arrival
                  </span>
                ) : (
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Departure
                  </span>
                )}
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {item.expectedTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${
                  item.delayMinutes === 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {item.delayMinutes === 0 ? 'On Time' : `${item.delayMinutes}m Late`}
                </span>

                <button
                  onClick={() => {
                    const matched = TRAINS.find((t) => t.number === item.trainNumber);
                    if (matched) onSelectTrain(matched);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Track
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
