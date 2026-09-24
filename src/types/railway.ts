export interface StationStop {
  id: string;
  code: string;
  name: string;
  shortName: string;
  arrivalTime: string; // Scheduled arrival time
  departureTime: string; // Scheduled departure time
  actualArrivalTime?: string; // Actual arrival time when train came
  actualDepartureTime?: string; // Actual departure time when train departed
  displayTime: string; // The primary time shown in the main column (as in user screenshot)
  distanceKm: number;
  day: number;
  platform: string;
  delayMinutes: number; // 0 = on time
  haltMinutes: number;
  status: 'passed' | 'current' | 'upcoming';
  isMajor: boolean;
}

export type TrackingMode = 'internet' | 'gps' | 'cell_tower';

export interface TrainInfo {
  number: string;
  name: string;
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  totalDistanceKm: number;
  totalDuration: string;
  type: string; // Express, Superfast, Rajdhani, Shatabdi, Vande Bharat
  runsOn: string[]; // Mon, Tue, Wed, etc.
  currentLocation: {
    statusSummary: string;
    currentStationCode?: string;
    nextStationCode?: string;
    distanceToNextKm?: number;
    distanceCoveredKm?: number;
    speedKmH: number;
    delayMinutes: number;
    lastUpdated: string;
    trackingMode: TrackingMode;
  };
  stops: StationStop[];
  coaches: {
    code: string;
    type: 'ENGINE' | 'EOG' | 'GEN' | 'SL' | '3AC' | '2AC' | '1AC' | 'PANTRY' | 'CC' | 'EC';
    label: string;
  }[];
}

export interface PnrRecord {
  pnr: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  fromStation: string;
  toStation: string;
  boardingStation: string;
  travelClass: string;
  quota: string;
  chartPrepared: boolean;
  passengers: {
    number: number;
    bookingStatus: string;
    currentStatus: string;
    coach: string;
    berthNumber: string;
    berthType: string;
    confirmationProbability?: number;
  }[];
}

export interface LiveStationTrain {
  trainNumber: string;
  trainName: string;
  scheduledTime: string;
  expectedTime: string;
  delayMinutes: number;
  platform: string;
  type: 'Arrival' | 'Departure';
  from: string;
  to: string;
  status: 'On Time' | 'Delayed' | 'Arrived' | 'Departed';
}
