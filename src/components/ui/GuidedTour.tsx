import { ArrowRight, Check, Compass, X } from 'lucide-react'
import { GUIDED_TOUR } from '../../data/guidedTour'
import type { Civilization } from '../../types/museum'
import './GuidedTour.css'

export interface GuidedTourProps {
  index: number
  inspected: boolean[]
  activeRoom: Civilization | null
  transitioning: boolean
  onTravel: (room: Civilization) => void
  onInspect: (room: Civilization, exhibitId: string) => void
  onNext: () => void
  onClose: () => void
  onJournal: () => void
}

export function GuidedTour({ index, inspected, activeRoom, transitioning, onTravel, onInspect, onNext, onClose, onJournal }: GuidedTourProps) {
  const complete = index >= GUIDED_TOUR.length
  const stop = GUIDED_TOUR[Math.min(index, GUIDED_TOUR.length - 1)]
  const viewed = inspected[index] ?? false
  let action = `Travel to ${stop.gallery}`
  if (complete) action = 'Open my journal'
  else if (viewed) action = index === GUIDED_TOUR.length - 1 ? 'Complete the journey' : 'Continue to the next gallery'
  else if (activeRoom === stop.civilization) action = `Inspect ${stop.exhibit}`

  function proceed() {
    if (transitioning) return
    if (complete) onJournal()
    else if (viewed) onNext()
    else if (activeRoom === stop.civilization) onInspect(stop.civilization, stop.exhibitId)
    else onTravel(stop.civilization)
  }

  return <section className="guided-tour" aria-label="Curated museum journey">
    <div className="guided-tour__top">
      <span><Compass size={15} aria-hidden="true"/> A CURATED JOURNEY</span>
      <button type="button" onClick={onClose} aria-label="End guided journey" title="End journey"><X size={17}/></button>
    </div>
    <div className="guided-tour__progress" aria-label={`${inspected.filter(Boolean).length} of 3 exhibits inspected`}>
      {GUIDED_TOUR.map((item, i) => <span key={item.id} className={i < index || inspected[i] ? 'is-complete' : i === index ? 'is-current' : ''} aria-label={`${item.gallery}: ${inspected[i] ? 'inspected' : i===index ? 'current' : 'upcoming'}`}/>) }
    </div>
    {complete ? <>
      <p className="guided-tour__eyebrow">YOUR JOURNEY / COMPLETE</p>
      <h2>Three worlds. One story.</h2>
      <p>You've explored three ways ancient cultures imagined wisdom, sovereignty and the world beyond life.</p>
      <p className="guided-tour__question">Your journal is ready for the works you chose to save.</p>
    </> : <>
      <p className="guided-tour__eyebrow">CHAPTER {String(index + 1).padStart(2, '0')} / 03 · {stop.gallery.toUpperCase()}</p>
      <h2>{stop.title}</h2>
      <p>{stop.story}</p>
      <p className="guided-tour__question">{viewed ? <Check size={15} aria-hidden="true"/> : null}{viewed ? `${stop.exhibit} explored — continue when you're ready.` : stop.question}</p>
    </>}
    <button type="button" className="guided-tour__action" onClick={proceed} disabled={transitioning}>
      {action}<ArrowRight size={16} aria-hidden="true"/>
    </button>
    <span className="guided-tour__footnote">You can explore freely or end this journey at any time.</span>
  </section>
}
