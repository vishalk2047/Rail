import React, { useState } from 'react';
import { Search, Train, X, ArrowRight, Clock } from 'lucide-react';
import { TrainInfo } from '../types/railway';
import { TRAINS } from '../data/trainsData';

interface TrainSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrain: (train: TrainInfo) => void;
  currentTrainNumber: string;
}

export const TrainSearchModal: React.FC<TrainSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTrain,
  currentTrainNumber,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTrains = TRAINS.filter(
    (t) =>
      t.number.includes(searchQuery.trim()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      t.source.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs pt-12 sm:pt-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-slate-900 border border-slate-100 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">Search Train</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-4">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Enter Train Number (e.g. 14814) or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
          />
        </div>

        {/* Quick Recent suggestions */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 shrink-0">Popular:</span>
          {TRAINS.map((t) => (
            <button
              key={t.number}
              onClick={() => {
                onSelectTrain(t);
                onClose();
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md shrink-0 transition-colors font-medium"
            >
              {t.number} ({t.sourceCode})
            </button>
          ))}
        </div>

        {/* List of trains */}
        <div className="mt-4 overflow-y-auto divide-y divide-slate-100 flex-1 pr-1">
          {filteredTrains.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No trains found matching &ldquo;{searchQuery}&rdquo;. Try 14814 or 12002.
            </div>
          ) : (
            filteredTrains.map((train) => {
              const isCurrent = train.number === currentTrainNumber;
              return (
                <div
                  key={train.number}
                  onClick={() => {
                    onSelectTrain(train);
                    onClose();
                  }}
                  className={`p-3.5 my-1 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-blue-50/80 border border-blue-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono bg-slate-900 text-white px-2 py-0.5 rounded">
                        {train.number}
                      </span>
                      <span className="text-sm font-bold text-slate-900 line-clamp-1">
                        {train.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                      <span className="font-semibold text-slate-700">{train.source}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-700">{train.destination}</span>
                      <span className="text-slate-300">·</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{train.totalDuration}</span>
                    </div>
                  </div>

                  <button className="text-xs font-semibold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-blue-600 hover:text-white transition-colors ml-2 shrink-0">
                    {isCurrent ? 'Viewing' : 'Select'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
