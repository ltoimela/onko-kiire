import React from "react";
import { DepartureRow } from "./DepartureRow";
import { Departure, PatternAndStopTimes, Stop } from "./types";


function patternAndStopTimeToDeparture(past : PatternAndStopTimes) : Departure[]
{
 
    // Reference time at midnight
    
    const currentTime = new Date();
    let d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    const secondsAtMidnight = d.getTime() / 1000;

    const departures : Departure[] = [];
   
    for (const st of past.stoptimes)
    {
        const secondsUTC = secondsAtMidnight + st.realtimeArrival;
        let realtimeArrival = st.realtimeArrival;
        let secondsToArrival = secondsUTC - currentTime.getTime() / 1000;
        if (secondsToArrival < 0)
        {
            secondsToArrival += 24*60*60;
            realtimeArrival += 24*60*60;
            
        }
        let minutesToArrival = Math.floor(secondsToArrival / 60);
        const hoursToArrival = Math.floor(minutesToArrival / 60) % 60;
        secondsToArrival %= 60;
        minutesToArrival %= 60;
        if (hoursToArrival <= 1)
        {
            let lineName = past.pattern.name;
            lineName = lineName.substr(0,lineName.indexOf(' '))
            const d : Departure = { line: lineName, realtimeArrival : realtimeArrival, 
                timeToDepart : hoursToArrival === 0 ? `${minutesToArrival}m ${secondsToArrival}s` :
                `${hoursToArrival}h ${minutesToArrival}m ${secondsToArrival}s`};
            departures.push(d);
        }
    }

    return departures;
}


export const StopComponent = ({stop} : {stop:Stop})  =>
{
    const departureListOfLists = stop.stoptimesForPatterns.map((value, ix) => patternAndStopTimeToDeparture(value));
    var merged =  ([] as Departure[]).concat(...departureListOfLists);
    merged.sort((a,b) => {
        return a.realtimeArrival < b.realtimeArrival ? -1 : 1;
    });


    return <div>
        <div><b>Pysäkki {stop.name}</b></div>
        {merged.map((d,dix) =>
            <DepartureRow key={dix} departure={d} />
        )}

    </div>
}