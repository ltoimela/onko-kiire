import { Departure } from "./types"


export const DepartureRow = ({departure} : {departure:Departure}) => {
    return <div>{departure.line} lähtee {departure.timeToDepart} päästä</div>
}