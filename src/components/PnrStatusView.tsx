import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, Train as TrainIcon, User, RefreshCw, Calendar, MapPin } from 'lucide-react';
import { PnrRecord } from '../types/railway';
import { SAMPLE_PNRS } from '../data/trainsData';

export const PnrStatusView: React.FC = () => {
  const [pnrInput, setPnrInput] = useState('8421948123');
  const [currentPnr, setCurrentPnr] = useState<PnrRecord | null>(SAMPLE_PNRS['8421948123']);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (pnrToSearch?: string) => {
    const target = (pnrToSearch || pnrInput).trim();
    if (!target || target.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian Railway PNR');
      return;
    }
    setErrorMsg('');
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (SAMPLE_PNRS[target]) {
        setCurrentPnr(SAMPLE_PNRS[target]);
      } else {
        // Generate dynamic realistic record for any 10-digit number
        setCurrentPnr({
          pnr: target,
          trainNumber: '14814',
          trainName: 'Bhopal - Jodhpur Express',
          journeyDate: 'Tomorrow, Sep 23',
          fromStation: 'Bhopal (BPL)',
          toStation: 'Jodhpur (JU)',
          boardingStation: 'Bhopal (BPL)',
          travelClass: 'AC 3 Tier (3A)',
          quota: 'General (GN)',
          chartPrepared: true,
          passengers: [
            {
              number: 1,
              bookingStatus: 'B1, 35 [MB]',
              currentStatus: 'CNF (Confirmed)',
              coach: 'B1',
              berthNumber: '35',
              berthType: 'Middle Berth (MB)',
              confirmationProbability: 100,
            },
          ],
        });
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <div className="bg-[#0a1329] text-white p-5 rounded-b-3xl shadow-xl">
        <h2 className="text-xl font-bold">PNR Status & Prediction</h2>
        <p className="text-xs text-slate-300 mt-1">Live booking status, chart preparation & berth confirmation</p>

        {/* Input box */}
        <div className="mt-5 bg-white text-slate-900 rounded-2xl p-4 shadow-lg border border-slate-100">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Enter 10-Digit PNR Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. 8421948123"
              value={pnrInput}
              onChange={(e) => {
                setPnrInput(e.target.value.replace(/\D/g, ''));
                setErrorMsg('');
              }}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Check</span>
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* Test Sample PNRs */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto">
            <span className="shrink-0 text-[10px] uppercase font-bold text-slate-400">Sample:</span>
            {Object.keys(SAMPLE_PNRS).map((pnr) => (
              <button
                key={pnr}
                onClick={() => {
                  setPnrInput(pnr);
                  handleSearch(pnr);
                }}
                className="font-mono text-xs text-blue-700 hover:underline bg-slate-100 px-2 py-0.5 rounded shrink-0 font-semibold"
              >
                {pnr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {currentPnr && (
        <div className="p-4 space-y-4">
          {/* Train & Journey card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">PNR: {currentPnr.pnr}</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {currentPnr.trainNumber} - {currentPnr.trainName}
                </h3>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                currentPnr.chartPrepared 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {currentPnr.chartPrepared ? 'Chart Prepared' : 'Chart Not Prepared'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Journey Date</span>
                <span className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {currentPnr.journeyDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Class & Quota</span>
                <span className="font-bold text-slate-800 mt-0.5">
                  {currentPnr.travelClass} · {currentPnr.quota}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">From Station</span>
                <span className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {currentPnr.fromStation}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">To Station</span>
                <span className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {currentPnr.toStation}
                </span>
              </div>
            </div>

            {/* Passenger status list */}
            <div className="mt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Passenger Details ({currentPnr.passengers.length})
              </span>

              <div className="space-y-2">
                {currentPnr.passengers.map((p) => (
                  <div
                    key={p.number}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        P{p.number}
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Booking: <strong>{p.bookingStatus}</strong></div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          Coach {p.coach} · Berth {p.berthNumber}
                        </div>
                        <div className="text-[11px] text-blue-700 font-semibold">{p.berthType}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                        {p.currentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
