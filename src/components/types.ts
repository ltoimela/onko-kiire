
export interface Departure
{
  line : string;
  realtimeArrival : number;
  timeToDepart : string;
}
export interface DepartureInformation
{
  departures : Record<string, Departure>;
}

export type StopTime =
{
  realtimeArrival : number;
}

export type Pattern = 
{
  name : string;
}

export type PatternAndStopTimes  =
{
  pattern : Pattern;
  stoptimes : StopTime[];
}

export type Stop =
{
  name : string;
  id : string;
  stoptimesForPatterns : PatternAndStopTimes[];
}
