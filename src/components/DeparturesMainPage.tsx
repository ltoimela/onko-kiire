import React, { useDebugValue, useEffect, useState } from 'react';
import { Stop } from './types';
import { StopComponent } from './StopComponent';
import { Carousel, CarouselItem } from 'react-bootstrap';

const HSL_GRAPHQL_URL = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';


const BUS_LINES = ['97 ', '841 ', '93 '];
const initialStopsFromHome : Stop[] = [
    {id:'U3RvcDpIU0w6MTQ3MzEyMA==', name:'Fallpakka', stoptimesForPatterns:[]}, 
    {id:'U3RvcDpIU0w6MTQ3MzE2NQ==', name:'Mellunmäentie', stoptimesForPatterns:[]}
];
const initialStopsFromSchool : Stop[] = [
    {id:'U3RvcDpIU0w6MTQ1MjExMg==', name:'Rantakartanontie', stoptimesForPatterns:[]}
]

function handleErrors(response : Response) {
  if (!response.ok) {
      throw Error(response.statusText);
  }
  return response;
}


export const DeparturesMainPage = () => {

  const [stopsFromHome, setStopsFromHome] = useState<Stop[]>(initialStopsFromHome);
  const [stopsFromSchool, setStopsFromSchool] = useState<Stop[]>(initialStopsFromSchool);
  const [index, setIndex] = useState(0);
      
  const handleSelect = (selectedIndex:number, e:Record<string, unknown>|null) => {
    setIndex(selectedIndex);
  };

  let postRequestInterval : NodeJS.Timeout;

  function pollDeparatureInformation(stop : Stop) : Promise<boolean>
  {
    return new Promise((resolve, reject) => {

    const stopRequest = `{
      stops(name:"${stop.name}") {
        id
        name
        stoptimesForPatterns {
          pattern {
            name
          }
          stoptimes {
            realtimeArrival
          }
        }
      }
    }`;

    fetch(HSL_GRAPHQL_URL,
        {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            },
            body :JSON.stringify({query: stopRequest})
        })
        .then(handleErrors)
        .then(res => res.json())
        .then(json => {
                //console.log(json.data.stops);

            const stopList = json.data.stops as Stop[];
            //console.log('Total of ', stopList.length, ' stops found')

            stop.stoptimesForPatterns = [];

            for (const s of stopList)
            {
                if (stop.id === s.id)
                {
                    for (const p of s.stoptimesForPatterns)
                    {
                        if (BUS_LINES.find(line => p.pattern.name.startsWith(line))) {
                            stop.stoptimesForPatterns.push(p);
                        }
                    }
                }
            }
            resolve(true);
        })
        .catch(error => {
            console.log('Error performing request: ',error);
            reject(false);
        });
    });
  }

  async function updateTimetable()
  {
    const promises : Promise<boolean>[] = [];

    const newStopsFromSchool = [...stopsFromSchool];
    for (const s of newStopsFromSchool)
    {
        promises.push(pollDeparatureInformation(s));
    }
    const newStopsFromHome = [...stopsFromHome];
    for (const s of newStopsFromHome)
    {
        promises.push(pollDeparatureInformation(s));
    }
    await Promise.all(promises);

    setStopsFromHome(newStopsFromHome);
    setStopsFromSchool(newStopsFromSchool);
  }

  useEffect(() => {
    
    // Manually invoke first update
    updateTimetable();

    // Later updates at 10s intervals
    setInterval(updateTimetable,10000);
  }, []);

    return  <div style={{ width:"100%"}}>
            <h1>Onko Kiire?</h1>
            <Carousel style={{ marginLeft:"20%", marginRight:"20%", height:"400px"}} activeIndex={index} onSelect={handleSelect}>
                <CarouselItem>
                    <div>
                        <h2>Kotoa kouluun</h2>
                        {stopsFromHome.map((value, ix) => 
                            <StopComponent key={ix} stop={value} />
                        )}
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <div>
                        <h2>Koululta kotiin</h2>

                        {stopsFromSchool.map((value, ix) =>
                            <StopComponent key={ix+1000} stop={value} />
                        )}
                    </div>
                </CarouselItem>
            </Carousel>

            <p/>
            </div>
}