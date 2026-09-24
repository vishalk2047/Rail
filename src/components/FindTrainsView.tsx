import React, { useState } from 'react';
import { ArrowUpDown, Calendar, Search, Train as TrainIcon, Users, Check, Clock } from 'lucide-react';
import { TrainInfo } from '../types/railway';
import { TRAINS } from '../data/trainsData';

interface FindTrainsViewProps {
  onSelectTrain: (train: TrainInfo) => void;
}

export const FindTrainsView: React.FC<FindTrainsViewProps> = ({ onSelectTrain }) => {
  const [activeSearchMode, setActiveSearchMode] = useState<'station' | 'train'>('station');
  const [trainQuery, setTrainQuery] = useState('');
  const [fromStation, setFromStation] = useState('Bhopal (BPL)');
  const [toStation, setToStation] = useState('Jodhpur (JU)');
  const [journeyDate, setJourneyDate] = useState('Tomorrow, Sep 23');
  const [quota, setQuota] = useState('General');
  const [hasSearched, setHasSearched] = useState(true);

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Find trains matching search query or stations
  const availableTrains = TRAINS.filter((t) => {
    if (activeSearchMode === 'train' && trainQuery.trim()) {
      const q = trainQuery.toLowerCase().trim();
      return (
        t.number.includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Top Header */}
      <div className="bg-[#0a1329] text-white p-5 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Indian Railways</h2>
            <p className="text-xs text-slate-300 mt-0.5">Live running status, search & seat availability</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-black text-sm">
            <TrainIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Search Mode Switcher Tabs */}
        <div className="mt-4 flex p-1 bg-[#121f3d] rounded-xl border border-[#1e325c]">
          <button
            onClick={() => setActiveSearchMode('station')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSearchMode === 'station'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Between Stations
          </button>
          <button
            onClick={() => setActiveSearchMode('train')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSearchMode === 'train'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Train No. / Name
          </button>
        </div>

        {/* Search Card */}
        <div className="mt-4 bg-white text-slate-900 rounded-2xl p-4 shadow-lg border border-slate-100">
          {activeSearchMode === 'train' ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Train Number or Name
              </span>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 14814, Bhopal Express, Shatabdi..."
                  value={trainQuery}
                  onChange={(e) => setTrainQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Quick pill suggestions */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Popular:</span>
                {TRAINS.map((t) => (
                  <button
                    key={t.number}
                    onClick={() => {
                      setTrainQuery(t.number);
                      onSelectTrain(t);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-mono text-slate-700 shrink-0 font-semibold"
                  >
                    {t.number}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* From Station */}
              <div className="relative pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From Station</span>
                <input
                  type="text"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Divider with Swap Button */}
              <div className="relative my-1 flex items-center justify-center">
                <div className="w-full border-t border-slate-200" />
                <button
                  onClick={handleSwapStations}
                  className="absolute w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                  title="Swap stations"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* To Station */}
              <div className="relative pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To Station</span>
                <input
                  type="text"
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Date and Quota Row */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Journey Date</span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{journeyDate}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quota</span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-800">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>{quota}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={() => {
              setHasSearched(true);
              if (availableTrains.length > 0) {
                onSelectTrain(availableTrains[0]);
              }
            }}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Find Trains</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Available Trains ({availableTrains.length})</span>
          <span className="text-emerald-700 font-semibold">Seat Availability Updated</span>
        </div>

        {availableTrains.map((train) => (
          <div
            key={train.number}
            onClick={() => onSelectTrain(train)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-400"
          >
            {/* Top header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">{train.name}</span>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {train.number}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Runs On: {train.runsOn.join(' ')}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTrain(train);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <TrainIcon className="w-3.5 h-3.5" />
                <span>Live Status</span>
              </button>
            </div>

            {/* Time & Journey summary */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-base font-extrabold text-slate-900">{train.stops[0].displayTime}</div>
                <div className="text-xs text-slate-500 font-medium">{train.source}</div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-medium">{train.totalDuration}</span>
                <div className="w-20 border-t border-dashed border-slate-300 my-1 relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute left-0 -top-[3px]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-0 -top-[3px]" />
                </div>
                <span className="text-[10px] text-blue-600 font-semibold">{train.type}</span>
              </div>

              <div className="text-right">
                <div className="text-base font-extrabold text-slate-900">
                  {train.stops[train.stops.length - 1].displayTime}
                </div>
                <div className="text-xs text-slate-500 font-medium">{train.destination}</div>
              </div>
            </div>

            {/* Seat Availability Chips */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              <div className="p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center">
                <div className="text-[11px] font-bold text-slate-700">SL</div>
                <div className="text-xs font-extrabold text-emerald-700 mt-0.5">AVL 34</div>
                <div className="text-[10px] text-slate-500">₹385</div>
              </div>

              <div className="p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center">
                <div className="text-[11px] font-bold text-slate-700">3A</div>
                <div className="text-xs font-extrabold text-emerald-700 mt-0.5">AVL 18</div>
                <div className="text-[10px] text-slate-500">₹1,020</div>
              </div>

              <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center">
                <div className="text-[11px] font-bold text-slate-700">2A</div>
                <div className="text-xs font-extrabold text-amber-700 mt-0.5">RAC 4</div>
                <div className="text-[10px] text-slate-500">₹1,475</div>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-[11px] font-bold text-slate-700">1A</div>
                <div className="text-xs font-extrabold text-slate-600 mt-0.5">WL 2</div>
                <div className="text-[10px] text-slate-500">₹2,480</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
