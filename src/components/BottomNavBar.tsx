import React from 'react';
import { Train, Search, FileText, Building2, LayoutGrid } from 'lucide-react';

export type TabType = 'live' | 'search' | 'pnr' | 'station' | 'coach';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'search' as TabType, label: 'Search Train', icon: Search },
    { id: 'live' as TabType, label: 'Live Status', icon: Train },
    { id: 'pnr' as TabType, label: 'PNR Status', icon: FileText },
    { id: 'station' as TabType, label: 'Station Board', icon: Building2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a1329] border-t border-[#1b2b4e] max-w-lg mx-auto shadow-2xl">
      <div className="grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-all relative ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-b-full shadow-sm shadow-blue-400" />
              )}
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'text-blue-400' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${
                isActive ? 'font-bold text-white' : 'font-medium text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
