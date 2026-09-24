import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  RotateCw, 
  Share2, 
  Bell, 
  Train as TrainIcon, 
  Wifi, 
  Radio, 
  Navigation, 
  Sparkles,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Volume2,
  Calendar
} from 'lucide-react';
import { TrainInfo, StationStop, TrackingMode } from '../types/railway';
import { StationAlarmModal } from './StationAlarmModal';
import { CoachLayoutModal } from './CoachLayoutModal';
import { TrainSearchModal } from './TrainSearchModal';
import { DateSelectModal } from './DateSelectModal';
import { ShareModal } from './ShareModal';

interface LiveRunningStatusProps {
  train: TrainInfo;
  onSelectTrain: (train: TrainInfo) => void;
  onBackToSearch?: () => void;
}

export const LiveRunningStatus: React.FC<LiveRunningStatusProps> = ({
  train,
  onSelectTrain,
  onBackToSearch,
}) => {
  // Date state matching screenshot
  const [dateLabel, setDateLabel] = useState<string>('Tomorrow');
  const [dayText, setDayText] = useState<string>('Day 0 - Sep 22, Tue');
  
  // Modals state
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [selectedStationForAlarm, setSelectedStationForAlarm] = useState<StationStop | null>(null);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Features & toggles
  const [showAllStops, setShowAllStops] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('gps');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState('Just now');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedTime('Updated just now');
    }, 800);
  };

  const handleOpenAlarm = (station: StationStop) => {
    setSelectedStationForAlarm(station);
    setIsAlarmModalOpen(true);
  };

  // Helper to parse time strings like "8:38 AM", "12:15 PM" into minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr || timeStr === '--') return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Determines whether actual time is 'late' (red), 'early' (green), 'on-time' (green), or 'upcoming/neutral'
  // If the train has not reached or crossed the station yet (status === 'upcoming'),
  // we do NOT show red/green delay evaluation because the train has not crossed the station yet.
  const getTimeStatus = (
    scheduledTime: string,
    actualTime?: string,
    stationStatus?: 'passed' | 'current' | 'upcoming',
    isArrival?: boolean
  ): {
    status: 'late' | 'on-time' | 'early' | 'upcoming' | 'none';
    diffMinutes: number;
    colorClass: string;
    badgeText: string;
  } => {
    if (!scheduledTime || scheduledTime === '--' || !actualTime || actualTime === '--') {
      return { status: 'none', diffMinutes: 0, colorClass: 'text-slate-900', badgeText: '' };
    }

    // For upcoming stations that the train hasn't reached yet:
    // If the station status is 'upcoming' (or if 'current' and departure hasn't happened yet for departure time),
    // we display actual/expected time in standard neutral slate color without claiming it is already late/early.
    if (stationStatus === 'upcoming') {
      return {
        status: 'upcoming',
        diffMinutes: 0,
        colorClass: 'text-slate-700 font-semibold',
        badgeText: 'Expected',
      };
    }

    const schedMin = parseTimeToMinutes(scheduledTime);
    const actMin = parseTimeToMinutes(actualTime);

    if (schedMin === null || actMin === null) {
      return { status: 'none', diffMinutes: 0, colorClass: 'text-slate-900', badgeText: '' };
    }

    // Account for day-wrap if necessary, but for same-day schedule diff:
    let diff = actMin - schedMin;
    if (diff < -720) diff += 1440; // Midnight rollover protection
    if (diff > 720) diff -= 1440;

    if (diff > 0) {
      return {
        status: 'late',
        diffMinutes: diff,
        colorClass: 'text-rose-600 font-extrabold',
        badgeText: `${diff}m late`,
      };
    } else if (diff < 0) {
      return {
        status: 'early',
        diffMinutes: Math.abs(diff),
        colorClass: 'text-emerald-600 font-extrabold',
        badgeText: `${Math.abs(diff)}m early`,
      };
    } else {
      return {
        status: 'on-time',
        diffMinutes: 0,
        colorClass: 'text-emerald-600 font-extrabold',
        badgeText: 'On time',
      };
    }
  };

  // In the screenshot, only the major stops are shown: Bhopal, Ujjain, Kota, Jodhpur
  const displayedStops = showAllStops ? train.stops : train.stops.filter((s) => s.isMajor);

  // Calculate actual distance covered by the train in KM
  const currentCoveredKm = (() => {
    if (typeof train.currentLocation.distanceCoveredKm === 'number') {
      return train.currentLocation.distanceCoveredKm;
    }
    // Fallback: if train has currentStationCode, find its distance
    if (train.currentLocation.currentStationCode) {
      const currentStop = train.stops.find(s => s.code === train.currentLocation.currentStationCode);
      if (currentStop) {
        return currentStop.distanceKm;
      }
    }
    // Fallback to highest passed station
    const passedStops = train.stops.filter(s => s.status === 'passed' || s.status === 'current');
    if (passedStops.length > 0) {
      return passedStops[passedStops.length - 1].distanceKm;
    }
    return 0;
  })();

  // Find which segment of displayed stops the train is currently in:
  // e.g., train is between displayedStops[segIndex] and displayedStops[segIndex + 1],
  // or exactly at displayedStops[segIndex]
  const currentSegment = (() => {
    if (displayedStops.length <= 1) return null;

    // Check if train is at the very first station
    if (currentCoveredKm <= displayedStops[0].distanceKm) {
      return { type: 'at_station' as const, index: 0, station: displayedStops[0] };
    }

    // Check if train is at or past the last displayed station
    const lastIdx = displayedStops.length - 1;
    if (currentCoveredKm >= displayedStops[lastIdx].distanceKm) {
      return { type: 'at_station' as const, index: lastIdx, station: displayedStops[lastIdx] };
    }

    // Iterate through segments between consecutive displayed stations
    for (let i = 0; i < lastIdx; i++) {
      const prevStop = displayedStops[i];
      const nextStop = displayedStops[i + 1];

      // Exact match at prevStop
      if (currentCoveredKm === prevStop.distanceKm) {
        return { type: 'at_station' as const, index: i, station: prevStop };
      }

      // Train is between prevStop and nextStop
      if (currentCoveredKm > prevStop.distanceKm && currentCoveredKm < nextStop.distanceKm) {
        const segDist = nextStop.distanceKm - prevStop.distanceKm;
        const distFromPrev = currentCoveredKm - prevStop.distanceKm;
        const progressRatio = Math.max(0.15, Math.min(0.85, distFromPrev / (segDist || 1)));

        return {
          type: 'between_stations' as const,
          prevIndex: i,
          prevStation: prevStop,
          nextIndex: i + 1,
          nextStation: nextStop,
          progressRatio,
          distFromPrev,
          distToNext: nextStop.distanceKm - currentCoveredKm,
        };
      }
    }

    return { type: 'at_station' as const, index: 0, station: displayedStops[0] };
  })();

  return (
    <div className="w-full max-w-lg mx-auto bg-[#0a1329] min-h-screen text-white flex flex-col shadow-2xl relative select-none">
      
      {/* ======================================================== */}
      {/* TOP HEADER SECTION (Faithfully matching user screenshot) */}
      {/* ======================================================== */}
      <header className="pt-4 px-4 pb-2 bg-[#0a1329] shrink-0">
        {/* Row 1: Back arrow + Train Number & Name */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToSearch || (() => setIsSearchModalOpen(true))}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Go back or search train"
            title="Search another train"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <button 
            onClick={() => setIsSearchModalOpen(true)}
            className="flex-1 text-left group flex items-center justify-between"
          >
            <h1 className="text-[17px] font-bold tracking-tight text-white leading-tight line-clamp-1 group-hover:text-blue-200 transition-colors">
              {train.number} - {train.name}
            </h1>
          </button>
        </div>

        {/* Row 2: Date Selector Dropdown Pill */}
        <div className="mt-2.5 flex items-center justify-between">
          <button
            onClick={() => setIsDateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142347] hover:bg-[#1c3061] text-white border border-[#233869] text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <span>{dateLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          {/* Tracking mode badge / quick switch */}
          <div className="flex items-center gap-1 bg-[#121f3d] p-0.5 rounded-lg border border-[#1e325c]">
            <button
              onClick={() => setTrackingMode('gps')}
              title="GPS Speed & Station Tracking"
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                trackingMode === 'gps'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>GPS</span>
            </button>
            <button
              onClick={() => setTrackingMode('cell_tower')}
              title="Cell Tower Signal (No Internet Required)"
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                trackingMode === 'cell_tower'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Tower</span>
            </button>
            <button
              onClick={() => setTrackingMode('internet')}
              title="Online Live Sync"
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                trackingMode === 'internet'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>Net</span>
            </button>
          </div>
        </div>

        {/* Row 3: Day 0 - Sep 22, Tue */}
        <div className="mt-3 flex items-center justify-between text-xs font-semibold px-0.5 text-slate-200">
          <div className="flex items-center gap-2">
            <span>{dayText}</span>
          </div>
          <div className="text-[11px] text-blue-300 font-medium">
            <span>Live Train Tracking</span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* LIVE SPEED & RUNNING STATUS RIBBON                        */}
      {/* ======================================================== */}
      <div className="px-3.5 py-2.5 bg-[#0d1a38] border-t border-b border-[#1b2b4e] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 truncate">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-200 truncate">
              {train.currentLocation.statusSummary || `Covered ${currentCoveredKm} km`}
            </span>
            <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
              {currentCoveredKm} km covered
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400">
            {lastRefreshedTime}
          </span>
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-all ${
              isRefreshing ? 'animate-spin text-blue-400' : ''
            }`}
            title="Refresh running status"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN WHITE CARD CONTAINER (With exact curved top border) */}
      {/* ======================================================== */}
      <main className="flex-1 bg-white text-slate-900 rounded-t-[32px] pt-6 pb-24 px-5 shadow-2xl overflow-y-auto">
        
        {/* Station Timeline Header with clear column indicators */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Station</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 text-right">
              <div className="min-w-[70px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Arrival</div>
                <div className="text-[9px] text-slate-400 font-medium">Sched · Act / Exp</div>
              </div>
              <div className="min-w-[70px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Departure</div>
                <div className="text-[9px] text-slate-400 font-medium">Sched · Act / Exp</div>
              </div>
            </div>

            <button
              onClick={() => setShowAllStops(!showAllStops)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50/80 hover:bg-blue-100/80 transition-colors shrink-0"
              title="Toggle station filter"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showAllStops ? 'Major' : 'All'}</span>
            </button>
          </div>
        </div>

        {/* Station Timeline List */}
        <div className="relative pl-1">
          {displayedStops.map((station, index) => {
            const isFirst = index === 0;
            const isLast = index === displayedStops.length - 1;
            const isSelected = selectedStationId === station.id;
            
            // Station status relative to train's covered distance
            const isStationPassed = currentCoveredKm > station.distanceKm;
            const isStationExactCurrent = currentSegment?.type === 'at_station' && currentSegment.index === index;
            const isStationUpcoming = currentCoveredKm < station.distanceKm;

            // Check if train is currently traversing the segment after this station
            const isTrainInThisSegment = currentSegment?.type === 'between_stations' && currentSegment.prevIndex === index;

            return (
              <div 
                key={station.id} 
                className="relative pb-9 last:pb-2 group cursor-pointer"
                onClick={() => setSelectedStationId(isSelected ? null : station.id)}
              >
                {/* Vertical timeline connecting line */}
                {!isLast && (
                  <div 
                    className={`absolute left-[15px] top-[26px] bottom-0 w-[2px] transition-colors ${
                      isStationPassed && !isTrainInThisSegment ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                    aria-hidden="true"
                  >
                    {/* If train is traversing between this station and the next station, show progressive colored line and train badge */}
                    {isTrainInThisSegment && (
                      <div 
                        className="w-full bg-blue-600"
                        style={{ height: `${(currentSegment.progressRatio * 100).toFixed(0)}%` }}
                      />
                    )}
                  </div>
                )}

                {/* Train Moving Symbol along the segment between stations based on km covered */}
                {isTrainInThisSegment && (
                  <div 
                    className="absolute left-[3px] z-20 flex items-center gap-2 pointer-events-none transform -translate-y-1/2"
                    style={{ top: `${(26 + currentSegment.progressRatio * 44).toFixed(0)}px` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 ring-4 ring-blue-100 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white animate-pulse">
                      <TrainIcon className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <div className="bg-blue-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-blue-400/40 flex items-center gap-1">
                      <span>{currentCoveredKm} km</span>
                      <span className="text-blue-300 font-normal">({currentSegment.distToNext} km to {currentSegment.nextStation.shortName})</span>
                    </div>
                  </div>
                )}

                {/* Station row layout */}
                <div className="flex items-start justify-between relative z-10">
                  {/* Left part: Timeline Icon + Station Name */}
                  <div className="flex items-center gap-3.5">
                    {/* Icon Column: Show the train icon badge if train is stopped exactly at this station */}
                    <div className="shrink-0 flex items-center justify-center w-8 h-8">
                      {isStationExactCurrent ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 ring-4 ring-blue-100 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
                          <TrainIcon className="w-4 h-4 fill-white" />
                        </div>
                      ) : isStationPassed ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100 shadow-xs" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-slate-100 shadow-xs group-hover:scale-125 transition-transform" />
                      )}
                    </div>

                    {/* Station Name Column */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[17px] font-bold tracking-tight leading-snug ${
                          isStationPassed || isStationExactCurrent ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {station.shortName}
                        </span>
                        {isStationExactCurrent && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full border border-blue-300 animate-pulse">
                            Current Stop ({currentCoveredKm} km)
                          </span>
                        )}
                        {station.platform && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {station.platform}
                          </span>
                        )}
                      </div>
                      
                      {/* Secondary info without on-time/delay text */}
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className={station.distanceKm <= currentCoveredKm ? 'font-medium text-slate-600' : ''}>
                          {station.distanceKm} km
                        </span>
                        {station.haltMinutes > 0 && (
                          <>
                            <span>·</span>
                            <span>{station.haltMinutes}m halt</span>
                          </>
                        )}
                        <span>· Day {station.day}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right part: Time Column (Separated Scheduled and Actual Arrival & Departure times) */}
                  <div className="text-right flex items-start gap-4">
                    {/* Arrival Column */}
                    {station.arrivalTime !== '--' && (() => {
                      const effectiveStatus: 'passed' | 'current' | 'upcoming' = isStationPassed 
                        ? 'passed' 
                        : isStationExactCurrent 
                        ? 'current' 
                        : 'upcoming';
                      const arrStatus = getTimeStatus(station.arrivalTime, station.actualArrivalTime, effectiveStatus, true);
                      return (
                        <div className="flex flex-col items-end min-w-[70px]">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Arrival</span>
                          {/* Scheduled time */}
                          <span className="text-xs text-slate-500 font-medium tabular-nums">
                            {station.arrivalTime}
                          </span>
                          {/* Actual time below scheduled time */}
                          <span className={`text-xs tabular-nums ${arrStatus.colorClass}`}>
                            {station.actualArrivalTime || station.arrivalTime}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Departure Column */}
                    {station.departureTime !== '--' && (() => {
                      const effectiveStatus: 'passed' | 'current' | 'upcoming' = isStationPassed 
                        ? 'passed' 
                        : isStationExactCurrent 
                        ? 'current' 
                        : 'upcoming';
                      const depStatus = getTimeStatus(station.departureTime, station.actualDepartureTime, effectiveStatus, false);
                      return (
                        <div className="flex flex-col items-end min-w-[70px]">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Departure</span>
                          {/* Scheduled time */}
                          <span className="text-xs text-slate-500 font-medium tabular-nums">
                            {station.departureTime}
                          </span>
                          {/* Actual time below scheduled time */}
                          <span className={`text-xs tabular-nums ${depStatus.colorClass}`}>
                            {station.actualDepartureTime || station.departureTime}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Interactive Station Detail Card (When clicked) */}
                {isSelected && (() => {
                  const effectiveStatus: 'passed' | 'current' | 'upcoming' = isStationPassed 
                    ? 'passed' 
                    : isStationExactCurrent 
                    ? 'current' 
                    : 'upcoming';
                  const arrStatus = getTimeStatus(station.arrivalTime, station.actualArrivalTime, effectiveStatus, true);
                  const depStatus = getTimeStatus(station.departureTime, station.actualDepartureTime, effectiveStatus, false);

                  return (
                    <div 
                      className="mt-3 ml-11 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-sm">{station.name} ({station.code})</span>
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {station.platform}
                        </span>
                      </div>

                      {/* Both Scheduled and Actual times clearly shown with color coding */}
                      <div className="grid grid-cols-2 gap-3 text-slate-600 py-2.5 border-t border-b border-slate-200/60 my-2">
                        {/* Arrival Box */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Arrival</span>
                            {arrStatus.badgeText && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                arrStatus.status === 'late'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : arrStatus.status === 'early' || arrStatus.status === 'on-time'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {arrStatus.badgeText}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline justify-between py-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">Scheduled:</span>
                            <span className="font-semibold text-slate-700">{station.arrivalTime}</span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 mt-1">
                            <span className="text-[11px] text-slate-900 font-bold">
                              {effectiveStatus === 'upcoming' ? 'Expected:' : 'Actual:'}
                            </span>
                            <span className={`text-sm ${arrStatus.colorClass}`}>{station.actualArrivalTime || station.arrivalTime}</span>
                          </div>
                        </div>

                        {/* Departure Box */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Departure</span>
                            {depStatus.badgeText && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                depStatus.status === 'late'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : depStatus.status === 'early' || depStatus.status === 'on-time'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {depStatus.badgeText}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline justify-between py-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">Scheduled:</span>
                            <span className="font-semibold text-slate-700">{station.departureTime}</span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 mt-1">
                            <span className="text-[11px] text-slate-900 font-bold">
                              {effectiveStatus === 'upcoming' ? 'Expected:' : 'Actual:'}
                            </span>
                            <span className={`text-sm ${depStatus.colorClass}`}>{station.actualDepartureTime || station.departureTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>Day {station.day} · {station.distanceKm} km · {station.haltMinutes}m halt</span>
                        </div>
                        
                        <button
                          onClick={() => handleOpenAlarm(station)}
                          className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors active:scale-95"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Set Wake-Up Alarm</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Live Train Track Simulation Indicator */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <TrainIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-900">Current Position</div>
              <div className="text-sm font-bold text-slate-900">
                {train.currentLocation.nextStationCode
                  ? `En route towards ${train.stops.find(s => s.code === train.currentLocation.nextStationCode)?.shortName || train.destination}`
                  : `Approaching ${train.destination}`}
              </div>
              <div className="text-xs text-slate-600">
                Next stop: <strong className="text-blue-700">{train.stops.find(s => s.code === train.currentLocation.nextStationCode)?.shortName || train.stops[1]?.shortName || train.destination}</strong>
                {train.currentLocation.distanceToNextKm ? ` in ${train.currentLocation.distanceToNextKm} km` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleOpenAlarm(train.stops.find(s => s.code === train.currentLocation.nextStationCode) || train.stops[1] || train.stops[0])}
            className="p-2.5 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 shadow-xs transition-colors"
            title="Set arrival alarm for next stop"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ======================================================== */}
      {/* QUICK FLOATING ACTIONS BAR                               */}
      {/* ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-around z-30 shadow-lg">
        <button
          onClick={() => handleOpenAlarm(train.stops[train.stops.length - 1])}
          className="flex flex-col items-center justify-center text-slate-600 hover:text-blue-600 transition-colors py-1 px-2"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Alarm</span>
        </button>

        <button
          onClick={() => setIsCoachModalOpen(true)}
          className="flex flex-col items-center justify-center text-slate-600 hover:text-blue-600 transition-colors py-1 px-2"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Coach Map</span>
        </button>

        <button
          onClick={handleRefresh}
          className="flex flex-col items-center justify-center text-slate-600 hover:text-blue-600 transition-colors py-1 px-2"
        >
          <RotateCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span className="text-[10px] font-semibold mt-1">Refresh</span>
        </button>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex flex-col items-center justify-center text-slate-600 hover:text-blue-600 transition-colors py-1 px-2"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Share</span>
        </button>

        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex flex-col items-center justify-center text-blue-600 hover:text-blue-800 transition-colors py-1 px-2 font-bold"
        >
          <TrainIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Trains</span>
        </button>
      </footer>

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}
      <StationAlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        station={selectedStationForAlarm}
        trainName={train.name}
      />

      <CoachLayoutModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        train={train}
      />

      <TrainSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTrain={onSelectTrain}
        currentTrainNumber={train.number}
      />

      <DateSelectModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        selectedDateLabel={dateLabel}
        onSelectDate={(label, sub) => {
          setDateLabel(label);
          setDayText(sub);
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        train={train}
        dateLabel={dateLabel}
      />
    </div>
  );
};
