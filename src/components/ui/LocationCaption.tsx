import { ROOMS } from '../../data/world'
import type { Civilization, LocationId } from '../../types/museum'
import './LocationCaption.css'

const SUBTITLES: Record<LocationId,{number:string;label:string;caption:string}> = {
  atrium:{number:'00',label:'The Eternal Atrium',caption:'Three civilizations. One eternal story. Choose an archway to begin.'},
  greece:{number:'01',label:'Hellas · Greece',caption:'Olympian gods, heroic journeys and the search for harmony.'},
  rome:{number:'02',label:'Roma · Rome',caption:'Divine power, civic ritual and the myths of an empire.'},
  egypt:{number:'03',label:'Kemet · Egypt',caption:'A world of sun, shadow, transformation and eternity.'},
}
export function LocationCaption({location}: {location:LocationId}) {
  const info=SUBTITLES[location]
  const activeRoom=location==='atrium'?null:ROOMS[location as Civilization]
  return <section className="location-caption" aria-label={info.label}>
    <span className="location-caption__overline">GALLERY {info.number} <span/> MYTHOS COLLECTION</span>
    <h2>{info.label}</h2>
    <p>{activeRoom?.description || info.caption}</p>
    <span className="location-caption__hint">{location==='atrium'?'SELECT A CIVILIZATION TO CONTINUE':'SELECT THE SCULPTURE TO EXPLORE'} <span aria-hidden="true">↗</span></span>
  </section>
}
