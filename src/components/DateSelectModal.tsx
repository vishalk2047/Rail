import React from 'react';
import { Calendar, Check, X } from 'lucide-react';

interface DateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateLabel: string;
  onSelectDate: (label: string, dayText: string) => void;
}

export const DateSelectModal: React.FC<DateSelectModalProps> = ({
  isOpen,
  onClose,
  selectedDateLabel,
  onSelectDate,
}) => {
  if (!isOpen) return null;

  const dates = [
    { label: 'Yesterday', subText: 'Day -1 · Sep 21, Mon' },
    { label: 'Today', subText: 'Day 0 · Sep 22, Tue' },
    { label: 'Tomorrow', subText: 'Day 0 · Sep 23, Wed' },
    { label: 'Day After Tomorrow', subText: 'Day 0 · Sep 24, Thu' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-slate-900 border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Select Journey Date</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {dates.map((item) => {
            const isSelected = selectedDateLabel === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onSelectDate(item.label, item.subText);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.subText}</div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
