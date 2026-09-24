import React, { useState } from 'react';
import { Bell, Check, Clock, Volume2, X } from 'lucide-react';
import { StationStop } from '../types/railway';

interface StationAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: StationStop | null;
  trainName: string;
}

export const StationAlarmModal: React.FC<StationAlarmModalProps> = ({
  isOpen,
  onClose,
  station,
  trainName,
}) => {
  const [minutesBefore, setMinutesBefore] = useState<number>(20);
  const [alarmSet, setAlarmSet] = useState<boolean>(false);
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);

  if (!isOpen || !station) return null;

  const handleSetAlarm = () => {
    setAlarmSet(true);
    setTimeout(() => {
      setAlarmSet(false);
      onClose();
    }, 1500);
  };

  const handleTestSound = () => {
    setIsPlayingTest(true);
    // Play a gentle dual chime using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio fallback
    }
    setTimeout(() => setIsPlayingTest(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity">
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-slate-900 border border-slate-100 transform transition-transform"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Destination Alarm</h3>
              <p className="text-xs text-slate-500">Wake up before your station</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selected Station</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{station.name} ({station.code})</div>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
            <span>Arrival: <strong className="text-slate-900">{station.displayTime}</strong></span>
            <span>·</span>
            <span>Platform: <strong className="text-blue-700">{station.platform}</strong></span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Ring alarm before arrival:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setMinutesBefore(mins)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    minutesBefore === mins
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Alarm will sound at approximately <strong>{station.displayTime} minus {minutesBefore}m</strong></span>
            </div>
            <button
              onClick={handleTestSound}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingTest ? 'animate-pulse text-emerald-600' : ''}`} />
              {isPlayingTest ? 'Playing...' : 'Test Sound'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSetAlarm}
            disabled={alarmSet}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              alarmSet ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
            }`}
          >
            {alarmSet ? (
              <>
                <Check className="w-4 h-4" />
                Alarm Activated!
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Set Alarm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
