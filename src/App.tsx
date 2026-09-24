import React, { useState } from 'react';
import { TRAINS } from './data/trainsData';
import { TrainInfo } from './types/railway';
import { LiveRunningStatus } from './components/LiveRunningStatus';
import { FindTrainsView } from './components/FindTrainsView';
import { PnrStatusView } from './components/PnrStatusView';
import { LiveStationView } from './components/LiveStationView';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { Smartphone, Monitor, Info, Train as TrainIcon, Sparkles } from 'lucide-react';

export default function App() {
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo>(TRAINS[0]); // 14814 Bhopal - Jodhpur Express
  const [activeTab, setActiveTab] = useState<TabType>('search'); // Set dashboard (Search) as default
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  const handleSelectTrain = (train: TrainInfo) => {
    setSelectedTrain(train);
    setActiveTab('live');
  };

  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top desktop utilities bar */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-[#0a1329] border-b border-[#1b2b4e] text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <TrainIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight">RailLive</span>
            <span className="text-slate-400 ml-2">Indian Railways Live Status & Schedules</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick train switcher on desktop */}
          <div className="flex items-center gap-1.5 bg-[#121f3d] p-1 rounded-xl border border-[#1e325c]">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Quick Train:</span>
            {TRAINS.map((t) => (
              <button
                key={t.number}
                onClick={() => handleSelectTrain(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedTrain.number === t.number
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.number} ({t.sourceCode})
              </button>
            ))}
          </div>

          {/* Phone Frame Toggle */}
          <div className="flex items-center gap-1 bg-[#121f3d] p-1 rounded-xl border border-[#1e325c]">
            <button
              onClick={() => setIsPhoneFrame(true)}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                isPhoneFrame ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Device Mockup View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(false)}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                !isPhoneFrame ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Expanded View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="flex-1 flex items-center justify-center p-0 md:p-6 overflow-x-hidden">
        <div
          className={`w-full transition-all duration-300 ${
            isPhoneFrame
              ? 'max-w-[430px] rounded-none sm:rounded-[42px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-0 sm:border-8 sm:border-slate-800 relative bg-[#0a1329]'
              : 'max-w-2xl bg-[#0a1329] rounded-2xl overflow-hidden shadow-2xl border border-slate-800'
          }`}
        >
          {/* Phone notch bar on desktop when phone frame is active */}
          {isPhoneFrame && (
            <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 bg-[#0a1329] text-[11px] font-semibold text-slate-300 select-none">
              <span>9:41</span>
              <div className="w-20 h-4 bg-slate-900 rounded-full" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Active View */}
          <div className="relative min-h-[640px] max-h-[880px] overflow-y-auto">
            {activeTab === 'live' && (
              <LiveRunningStatus
                train={selectedTrain}
                onSelectTrain={handleSelectTrain}
                onBackToSearch={() => setActiveTab('search')}
              />
            )}

            {activeTab === 'search' && (
              <FindTrainsView onSelectTrain={handleSelectTrain} />
            )}

            {activeTab === 'pnr' && <PnrStatusView />}

            {activeTab === 'station' && (
              <LiveStationView onSelectTrain={handleSelectTrain} />
            )}
          </div>

          {/* Bottom navigation bar */}
          <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </main>

      {/* Desktop footer disclaimer */}
      <footer className="hidden md:flex items-center justify-between px-6 py-2.5 text-[11px] text-slate-400 border-t border-slate-900 bg-[#070e1d]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time GPS Tracking simulation for Train 14814 (Bhopal - Jodhpur Express)</span>
        </div>
        <div>
          <span>Designed with reference to Indian Railway & Where is my Train screens</span>
        </div>
      </footer>
    </div>
  );
}
