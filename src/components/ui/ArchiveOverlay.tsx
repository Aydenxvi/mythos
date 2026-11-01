import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Clock3, Compass, Search, X } from 'lucide-react'
import { CURATION, HISTORICAL_TIMELINE } from '../../data/curation'
import { EXHIBITS } from '../../data/exhibits'
import type { Civilization } from '../../types/museum'
import './ArchiveOverlay.css'

type ArchiveTab = 'collection' | 'timeline' | 'journal'
const ROOMS: { id: Civilization; name: string; caption: string; numeral: string }[] = [
  { id: 'greece', name: 'Hellas', caption: 'The Olympians · Heroes · Wisdom', numeral: 'I' },
  { id: 'rome', name: 'Roma', caption: 'Sovereignty · Ritual · Empire', numeral: 'II' },
  { id: 'egypt', name: 'Kemet', caption: 'Transformation · Afterlife · Eternity', numeral: 'III' },
]
const ITEMS = ['athena', 'jupiter', 'anubis'] as const

export interface ArchiveOverlayProps {
  initialTab: ArchiveTab
  onClose: () => void
  onVisit: (room: Civilization) => void
  favorites: string[]
  visited: Civilization[]
  onToggleFavorite: (id: string) => void
}

export function ArchiveOverlay({ initialTab, onClose, onVisit, favorites, visited, onToggleFavorite }: ArchiveOverlayProps) {
  const [tab, setTab] = useState<ArchiveTab>(initialTab)
  const [search, setSearch] = useState('')
  const [timelineFilter, setTimelineFilter] = useState<'All' | 'Greece' | 'Rome' | 'Egypt'>('All')
  const closeRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    function keyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !containerRef.current) return
      const elements = Array.from(containerRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]'))
      if (!elements.length) return
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', keyDown)
    return () => window.removeEventListener('keydown', keyDown)
  }, [onClose])

  const filtered = ITEMS.filter(id => {
    const item = EXHIBITS[id]
    const text = `${item.title} ${item.civilization} ${CURATION[id].epithet} ${CURATION[id].lead}`
    return text.toLowerCase().includes(search.trim().toLowerCase())
  })

  function visit(room: Civilization) { onClose(); onVisit(room) }

  return <div className="archive-scrim" onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div ref={containerRef} className="archive" role="dialog" aria-modal="true" aria-labelledby="archive-heading">
      <div className="archive__top">
        <div className="archive__logo"><span className="archive__monogram">M</span><span>MYTHOS <small>THE ETERNAL MUSEUM</small></span></div>
        <button ref={closeRef} className="archive__close" type="button" onClick={onClose} aria-label="Close the atlas"><X size={18}/></button>
      </div>
      <div className="archive__body">
        <nav className="archive__rail" aria-label="Museum archives">
          <p>THE ARCHIVE<br/><span>EST. BEYOND TIME</span></p>
          <button className={tab==='collection'?'is-active':''} onClick={()=>setTab('collection')}><Compass size={17}/> Collection <span>01</span></button>
          <button className={tab==='timeline'?'is-active':''} onClick={()=>setTab('timeline')}><Clock3 size={17}/> Timeline <span>02</span></button>
          <button className={tab==='journal'?'is-active':''} onClick={()=>setTab('journal')}><Bookmark size={17}/> My journal <span>{String(favorites.length).padStart(2,'0')}</span></button>
          <div className="archive__rail-foot">THREE CIVILIZATIONS<br/>AN UNENDING STORY</div>
        </nav>
        <div className="archive__content" key={tab}>
          {tab === 'collection' && <>
            <p className="archive__eyebrow">ARCHIVE / 001 — DIGITAL COLLECTION</p>
            <h2 id="archive-heading">An atlas of the divine.</h2>
            <p className="archive__intro">A starting point for exploring three worlds. Choose a gallery, encounter a figure, and follow the stories that shaped ancient imaginations.</p>
            <div className="archive__rooms">{ROOMS.map(room => <button key={room.id} onClick={()=>visit(room.id)} className={`archive__room archive__room--${room.id}`}>
              <span className="archive__roman">{room.numeral}</span><span className="archive__room-name">{room.name}</span><span className="archive__room-caption">{room.caption}</span><ArrowRight size={17}/>
            </button>)}</div>
            <div className="archive__section-heading"><h3>Selected works</h3><label className="archive__search"><Search size={16}/><span className="visually-hidden">Search exhibits</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search the collection..."/></label></div>
            <div className="archive__works">{filtered.map((id,i) => {
              const exhibit=EXHIBITS[id]
              return <article className="archive__work" key={id}>
                <span className="archive__work-number">{String(i+1).padStart(2,'0')} / 03</span><div><h4>{exhibit.title}</h4><p>{CURATION[id].epithet}</p></div>
                <button title={favorites.includes(id)?'Remove from journal':'Save to journal'} aria-label={`${favorites.includes(id)?'Remove':'Save'} ${exhibit.title}`} onClick={()=>onToggleFavorite(id)} className={favorites.includes(id)?'is-saved':''}><Bookmark size={17} fill={favorites.includes(id)?'currentColor':'none'}/></button>
                <button onClick={()=>visit(exhibit.civilization)} aria-label={`Visit ${exhibit.civilization} gallery`}><ArrowRight size={18}/></button>
              </article>
            })}{filtered.length===0&&<p className="archive__empty">No exhibits match that search.</p>}</div>
            <p className="archive__disclaimer">The Athena model is a digital scan of a Roman-period sculpture in the Fitzwilliam Museum. The Zeus and Anubis models are contemporary 3D artworks, not authenticated antiquities. Model credits appear in each exhibit’s Details tab.</p>
          </>}
          {tab === 'timeline' && <>
            <p className="archive__eyebrow">ARCHIVE / 002 — THE HISTORICAL RECORD</p>
            <h2 id="archive-heading">A history of stories.</h2>
            <p className="archive__intro">This timeline dates surviving texts and historical periods — <em>not the fictional births or deeds of gods</em>. Mythic traditions frequently predate the sources in which they survive.</p>
            <div className="archive__timeline-filters" role="group" aria-label="Filter timeline by civilization">
              {(['All','Greece','Rome','Egypt'] as const).map(filter=><button type="button" key={filter}
                aria-pressed={timelineFilter===filter} className={timelineFilter===filter?'is-active':''}
                onClick={()=>setTimelineFilter(filter)}>{filter}</button>)}
            </div>
            <div className="archive__timeline">{HISTORICAL_TIMELINE.filter(item=>timelineFilter==='All'||item.civilization===timelineFilter).map((item,i)=><div className="archive__event" key={`${item.label}-${i}`}>
              <div className="archive__event-date">{item.era}</div><div className="archive__event-mark"/><div className="archive__event-copy"><span>{item.civilization}</span><h3>{item.label}</h3><p>{item.description}</p></div>
            </div>)}</div>
            <p className="archive__disclaimer">Dates are approximate scholarly conventions. Individual inscriptions, manuscripts and traditions may have different datings.</p>
          </>}
          {tab === 'journal' && <>
            <p className="archive__eyebrow">ARCHIVE / 003 — YOUR PERSONAL JOURNEY</p>
            <h2 id="archive-heading">The journey is yours.</h2>
            <p className="archive__intro">Collect the figures that intrigued you. Your journal stays in this browser and requires no account.</p>
            <div className="archive__progress"><div><strong>{visited.length}<small> / 3</small></strong><span>Galleries explored</span></div><div><strong>{favorites.length}<small> / 3</small></strong><span>Works collected</span></div></div>
            <div className="archive__section-heading"><h3>Your collection</h3></div>
            {favorites.length===0 ? <div className="archive__journal-empty"><BookOpen size={25}/><p>Your collection is waiting to be discovered.</p><button onClick={()=>setTab('collection')}>Explore the collection <ArrowRight size={15}/></button></div>
              : <div className="archive__works">{favorites.map(id=>{const item=EXHIBITS[id];if(!item)return null;return <article key={id} className="archive__work"><span className="archive__work-number">SAVED</span><div><h4>{item.title}</h4><p>{CURATION[id as keyof typeof CURATION].epithet}</p></div><button onClick={()=>onToggleFavorite(id)} aria-label={`Remove ${item.title} from journal`}><X size={18}/></button><button onClick={()=>visit(item.civilization)} aria-label={`Visit ${item.title} in gallery`}><ArrowRight size={18}/></button></article>})}</div>}
            <div className="archive__section-heading"><h3>Visited galleries</h3></div>
            <div className="archive__visits">{ROOMS.map(room=><div key={room.id}><span>{room.name}</span><span>{visited.includes(room.id)?'EXPLORED':'UNDISCOVERED'}</span></div>)}</div>
            <p className="archive__disclaimer">Saved locally in browser storage. Clearing site data resets your journal.</p>
          </>}
        </div>
      </div>
      <div className="archive__bottom"><button onClick={onClose}><ArrowLeft size={15}/> Return to the museum</button><span>MYTHOS — THE ETERNAL MUSEUM</span></div>
    </div>
  </div>
}
