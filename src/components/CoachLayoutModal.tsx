import React, { useState } from 'react';
import { X, Search, Info } from 'lucide-react';
import { TrainInfo } from '../types/railway';

interface CoachLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  train: TrainInfo;
}

export const CoachLayoutModal: React.FC<CoachLayoutModalProps> = ({
  isOpen,
  onClose,
  train,
}) => {
  const [selectedCoach, setSelectedCoach] = useState<string>('B1');
  const [berthQuery, setBerthQuery] = useState<string>('');
  const [calculatedBerth, setCalculatedBerth] = useState<{
    berthNumber: number;
    type: string;
    coachType: string;
  } | null>(null);

  if (!isOpen) return null;

  const calculateBerthType = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num < 1 || num > 72) {
      setCalculatedBerth(null);
      return;
    }

    const mod = num % 8;
    let type = '';
    if (mod === 1 || mod === 4) type = 'Lower Berth (LB)';
    else if (mod === 2 || mod === 5) type = 'Middle Berth (MB)';
    else if (mod === 3 || mod === 6) type = 'Upper Berth (UB)';
    else if (mod === 7) type = 'Side Lower Berth (SL)';
    else if (mod === 0) type = 'Side Upper Berth (SU)';

    setCalculatedBerth({
      berthNumber: num,
      type,
      coachType: 'Standard 3AC / Sleeper (72 Berths)',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-slate-900 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Coach Position & Seat Map</h3>
            <p className="text-xs text-slate-500 mt-0.5">{train.number} - {train.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coach train horizontal view */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Train Formation (Front to Rear)</span>
            <span className="text-xs text-blue-600 font-medium">Scroll horizontally →</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 px-1">
            {train.coaches.map((coach, index) => {
              const isSelected = selectedCoach === coach.code;
              const isEngine = coach.type === 'ENGINE';
              return (
                <button
                  key={`${coach.code}-${index}`}
                  onClick={() => setSelectedCoach(coach.code)}
                  className={`shrink-0 flex flex-col items-center justify-center rounded-lg border text-center transition-all ${
                    isEngine 
                      ? 'w-16 h-12 bg-amber-500 text-white font-bold border-amber-600 shadow-sm'
                      : isSelected
                      ? 'w-14 h-12 bg-blue-600 text-white font-bold border-blue-700 shadow-md ring-2 ring-blue-400/40'
                      : 'w-14 h-12 bg-slate-50 text-slate-700 font-semibold border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{coach.code}</span>
                  <span className="text-[9px] opacity-80 mt-1 uppercase font-normal">{coach.type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Coach Details */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Selected Coach</span>
              <div className="text-base font-bold text-slate-900">
                {train.coaches.find(c => c.code === selectedCoach)?.label || selectedCoach}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Platform Alignment</span>
              <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 mt-0.5">
                Middle of Platform
              </div>
            </div>
          </div>
        </div>

        {/* Berth Finder Tool */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Berth Type Calculator (Seat 1 - 72)
          </h4>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="number"
                min="1"
                max="72"
                placeholder="Enter berth number (e.g. 43)"
                value={berthQuery}
                onChange={(e) => {
                  setBerthQuery(e.target.value);
                  calculateBerthType(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <button
              onClick={() => calculateBerthType(berthQuery)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Find
            </button>
          </div>

          {calculatedBerth && (
            <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 font-medium">Berth #{calculatedBerth.berthNumber}</span>
                <div className="text-sm font-bold text-emerald-950 mt-0.5">{calculatedBerth.type}</div>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-white px-2 py-1 rounded shadow-xs">
                {calculatedBerth.coachType}
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Standard Sleeper & AC 3-Tier coaches have 8 berths per compartment: 1,4 Lower · 2,5 Middle · 3,6 Upper · 7 Side Lower · 8 Side Upper.
          </span>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
