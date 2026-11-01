import { useEffect, useState } from 'react'
import { Bookmark, BookOpen, Headphones, PauseCircle, RotateCcw, Eye, PanelRightClose } from 'lucide-react'
import { CURATION } from '../../data/curation'
import type { ExhibitData } from '../../types/museum'
import './ExhibitInformationPanel.css'

export interface ExhibitInformationPanelProps {
  exhibit: ExhibitData
  saved: boolean
  onToggleSaved: () => void
}
type DetailTab = 'overview' | 'myth' | 'details'
const CIVILIZATION_LABEL: Record<ExhibitData['civilization'], string> = { greece: 'Hellas / Greece', rome: 'Roma / Rome', egypt: 'Kemet / Egypt' }

export function ExhibitInformationPanel({ exhibit, saved, onToggleSaved }: ExhibitInformationPanelProps) {
  const [tab, setTab] = useState<DetailTab>('overview')
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [immersive, setImmersive] = useState(false)
  const record = CURATION[exhibit.id as keyof typeof CURATION]
  const voiceAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    setTab('overview')
    setSelectedSymbol(null)
    setSpeaking(false)
    setImmersive(false)
    return () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel() }
  }, [exhibit.id])

  function toggleAudio() {
    if (!voiceAvailable || !record) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(record.audio)
    utterance.lang = 'en-US'
    utterance.rate = 0.91
    utterance.pitch = 0.92
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  if (immersive) return <button type="button" className="exhibit-panel__restore" onClick={() => setImmersive(false)}
    aria-label="Show exhibit information"><BookOpen size={18}/> Show exhibit details</button>

  return <aside className="exhibit-panel" aria-label={`${exhibit.title} exhibit information`}>
    <div className="exhibit-panel__top"><span>MYTHOS / COLLECTION 001</span><div className="exhibit-panel__actions"><button type="button" onClick={() => setImmersive(true)} title="Hide details to view sculpture" aria-label="Hide panel and view sculpture"><Eye size={16}/></button><button type="button" onClick={onToggleSaved} className={saved?'is-saved':''} aria-label={saved?'Remove from journal':'Save to journal'} title={saved?'Remove from journal':'Save to journal'}><Bookmark size={17} fill={saved?'currentColor':'none'}/></button></div></div>
    <div className="exhibit-panel__scroll">
      <p className="exhibit-panel__civilization">{CIVILIZATION_LABEL[exhibit.civilization]}</p>
      <h2 className="exhibit-panel__title">{exhibit.title}</h2>
      <p className="exhibit-panel__epithet">{record?.epithet ?? ''}</p>
      <div className="exhibit-panel__tabs" role="tablist" aria-label="Exhibit information sections">
        {([['overview','Overview'],['myth','The myth'],['details','Details']] as const).map(([value,label])=><button key={value} type="button" role="tab" aria-selected={tab===value} className={tab===value?'is-active':''} onClick={()=>setTab(value)}>{label}</button>)}
      </div>
      {tab==='overview' && <div role="tabpanel" className="exhibit-panel__content">
        <p className="exhibit-panel__lead">{record?.lead ?? exhibit.description}</p>
        {record && <><p className="exhibit-panel__kicker">ICONOGRAPHY · SELECT A SYMBOL</p>
          <div className="exhibit-panel__symbols">{record.symbols.map(symbol=><button type="button" key={symbol}
            aria-pressed={selectedSymbol===symbol} className={selectedSymbol===symbol?'is-selected':''}
            onClick={()=>setSelectedSymbol(current=>current===symbol?null:symbol)}>{symbol}</button>)}</div>
          {selectedSymbol && <p className="exhibit-panel__symbol-meaning" role="status"><strong>{selectedSymbol}</strong> — {record.symbolMeanings[selectedSymbol]}</p>}
        </>}
        <p className="exhibit-panel__annotation"><RotateCcw size={14}/> Drag the sculpture to rotate · Scroll to zoom</p>
      </div>}
      {tab==='myth' && <div role="tabpanel" className="exhibit-panel__content">
        {record?.narrative.map((paragraph,i)=><p key={i} className={i===0?'exhibit-panel__lead':''}>{paragraph}</p>)}
        <p className="exhibit-panel__note">Stories are presented as ancient traditions, not historical events.</p>
      </div>}
      {tab==='details' && <div role="tabpanel" className="exhibit-panel__content">
        {exhibit.metadata && <dl className="exhibit-panel__meta">
          {exhibit.metadata.period && <><dt>Period</dt><dd>{exhibit.metadata.period}</dd></>}
          {exhibit.metadata.origin && <><dt>Tradition</dt><dd>{exhibit.metadata.origin}</dd></>}
          {exhibit.metadata.material && <><dt>Object</dt><dd>{exhibit.metadata.material}</dd></>}
        </dl>}
        {record && <><p>{record.context}</p><p className="exhibit-panel__kicker">LINKED TRADITIONS</p>{record.connections.map(c=><p className="exhibit-panel__connection" key={c.title}><strong>{c.title}</strong> — {c.description}</p>)}<p className="exhibit-panel__kicker">ANCIENT SOURCES TO EXPLORE</p><p>{record.reading}</p></>}
        <p className="exhibit-panel__note">{exhibit.metadata?.note}</p>
        {exhibit.asset?.attribution && <div className="exhibit-panel__credit">
          <p className="exhibit-panel__kicker">3D MODEL CREDIT</p>
          <p><strong>{exhibit.asset.attribution.title}</strong> — {exhibit.asset.attribution.artist}</p>
          <p>{exhibit.asset.attribution.license} · {exhibit.asset.attribution.note}</p>
          <a href={exhibit.asset.attribution.sourceUrl} target="_blank" rel="noopener noreferrer">View creator and original model ↗</a>
        </div>}

      </div>}
    </div>
    <div className="exhibit-panel__footer">
      <button type="button" disabled={!voiceAvailable || !record} onClick={toggleAudio} className={speaking?'is-speaking':''}><span>{speaking?<PauseCircle size={17}/>:<Headphones size={17}/>}</span>{speaking?'Stop guide':'Listen to guide'}</button>
      <span className="exhibit-panel__guide-note" title="Uses a built-in device voice; no external audio service">{voiceAvailable?'DEVICE NARRATION':'NO AUDIO SUPPORT'}</span>
      <button type="button" className="exhibit-panel__focus-link" onClick={() => setImmersive(true)} aria-label="View sculpture without information panel"><PanelRightClose size={15}/> View artwork</button>
    </div>
  </aside>
}
