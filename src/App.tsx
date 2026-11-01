import { useCallback, useEffect, useRef, useState } from 'react'
import { Bookmark, Compass, Gauge, Route, HelpCircle, X } from 'lucide-react'
import { useGraphicsQuality, type GraphicsQuality } from './hooks/useGraphicsQuality'
import { GraphicsQualityProvider } from './hooks/GraphicsQualityContext'
import { MotionProvider, useMotionPreference, type MotionMode } from './hooks/MotionPreference'
import './App.css'
import { SceneCanvas } from './components/canvas/SceneCanvas'
import { MuseumWorld } from './app/MuseumWorld'
import { MuseumStateProvider, useMuseumState } from './app/AppStateContext'
import { WelcomeOverlay } from './components/ui/WelcomeOverlay'
import { MuseumHeader } from './components/ui/MuseumHeader'
import { LocationCaption } from './components/ui/LocationCaption'
import { ExhibitInformationPanel } from './components/ui/ExhibitInformationPanel'
import { ArchiveOverlay } from './components/ui/ArchiveOverlay'
import { GuidedTour } from './components/ui/GuidedTour'
import { GUIDED_TOUR } from './data/guidedTour'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { TransitionVeil } from './components/ui/TransitionVeil'
import { CivilizationNavigation } from './components/navigation/CivilizationNavigation'
import { BackButton } from './components/navigation/BackButton'
import { ROOMS } from './data/world'
import { getExhibit } from './data/exhibits'
import { useMuseumProgress } from './hooks/useMuseumProgress'
import type { AppState, Civilization } from './types/museum'

type ArchiveTab = 'collection' | 'timeline' | 'journal'

const LOCATION_LABEL: Record<AppState, string> = {
  WELCOME: 'Welcome', ATRIUM: 'The Atrium', GREECE: 'Greece — Light & Reason',
  ROME: 'Rome — Order & Empire', EGYPT: 'Egypt — The Eternal Kingdom', EXHIBIT_VIEW: 'Inspecting',
}

function MuseumUI() {
  const { state, dispatch } = useMuseumState()
  const [archiveTab, setArchiveTab] = useState<ArchiveTab | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const helpCloseRef = useRef<HTMLButtonElement>(null)
  const helpButtonRef = useRef<HTMLButtonElement>(null)
  const helpDialogRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!helpOpen) return
    helpCloseRef.current?.focus()
    const helpButton = helpButtonRef.current
    function trapHelpFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !helpDialogRef.current) return
      const buttons = Array.from(helpDialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'))
      if (!buttons.length) return
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trapHelpFocus)
    return () => { document.removeEventListener('keydown', trapHelpFocus); helpButton?.focus() }
  }, [helpOpen])
  const [tourIndex, setTourIndex] = useState<number | null>(null)
  const [tourInspected, setTourInspected] = useState<boolean[]>([false, false, false])
  const closeArchive = useCallback(() => setArchiveTab(null), [])
  const { progress, toggleFavorite, visitRoom } = useMuseumProgress()
  const selectedExhibit = state.selectedExhibitId ? getExhibit(state.selectedExhibitId) : undefined

  useEffect(() => { if (state.activeRoom) visitRoom(state.activeRoom) }, [state.activeRoom, visitRoom])

  // Inspecting the right work completes its chapter; the visitor decides when to move on.
  useEffect(() => {
    if (tourIndex === null || tourIndex >= GUIDED_TOUR.length || state.appState !== 'EXHIBIT_VIEW') return
    if (state.selectedExhibitId !== GUIDED_TOUR[tourIndex].exhibitId) return
    setTourInspected(previous => previous[tourIndex] ? previous : previous.map((done, i) => i === tourIndex ? true : done))
  }, [tourIndex, state.appState, state.selectedExhibitId])

  function beginTour() { setTourInspected([false, false, false]); setTourIndex(0) }
  function continueTour() {
    if (tourIndex === null || state.isTransitioning) return
    const next = tourIndex + 1
    setTourIndex(next)
    if (next < GUIDED_TOUR.length) dispatch({ type: 'GO_TO_ROOM', room: GUIDED_TOUR[next].civilization })
  }

  useEffect(() => {
    function handleKeys(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLElement && e.target.isContentEditable) return
      if (archiveTab) return // the archive handles Escape and Tab itself
      if (helpOpen) { if (e.key === 'Escape') setHelpOpen(false); return }
      if (e.key === '?' || e.key.toLowerCase() === 'h') { setHelpOpen(true); return }
      if (state.appState === 'WELCOME' || state.isTransitioning) return
      if (e.key.toLowerCase() === 'a') setArchiveTab('collection')
      if (e.key.toLowerCase() === 'j') setArchiveTab('journal')
      if (e.key.toLowerCase() === 't' && state.appState !== 'EXHIBIT_VIEW') { if (tourIndex === null) beginTour(); else setTourIndex(null) }
      if (e.key === 'Escape' && state.appState === 'EXHIBIT_VIEW') dispatch({ type: 'RETURN_TO_ROOM' })
    }
    window.addEventListener('keydown', handleKeys)
    return () => window.removeEventListener('keydown', handleKeys)
  }, [archiveTab, helpOpen, dispatch, state.appState, state.isTransitioning, tourIndex])

  function handleBack() {
    if (state.appState === 'EXHIBIT_VIEW') dispatch({ type: 'RETURN_TO_ROOM' })
    else dispatch({ type: 'RETURN_TO_ATRIUM' })
  }

  if (state.appState === 'WELCOME') return <WelcomeOverlay onEnter={() => dispatch({ type: 'ENTER_MUSEUM' })} disabled={state.isTransitioning} />

  const showBack = state.appState !== 'ATRIUM'
  const backLabel = state.appState === 'EXHIBIT_VIEW' ? `Back to ${ROOMS[state.activeRoom ?? 'greece'].name}` : 'Atrium'

  return <>
    <MuseumHeader locationLabel={LOCATION_LABEL[state.appState]} />
    {showBack && <BackButton label={backLabel} onClick={handleBack} disabled={state.isTransitioning} />}
    {state.appState !== 'EXHIBIT_VIEW' && <div className={`museum-tools ${showBack ? 'museum-tools--with-back' : ''}`}>
      <button type="button" aria-label={tourIndex === null ? 'TOUR' : 'END TOUR'} disabled={state.isTransitioning} onClick={tourIndex === null ? beginTour : () => setTourIndex(null)} title="Start or end a curated museum journey (T)" aria-pressed={tourIndex !== null}><Route size={17} strokeWidth={1.5}/><span>{tourIndex === null ? 'TOUR' : 'END TOUR'}</span></button>
      <button type="button" aria-label="ATLAS" disabled={state.isTransitioning} onClick={()=>setArchiveTab('collection')} title="Open atlas (A)"><Compass size={17} strokeWidth={1.5}/><span>ATLAS</span></button>
      <button type="button" aria-label={`JOURNAL ${progress.favorites.length}`} disabled={state.isTransitioning} onClick={()=>setArchiveTab('journal')} title="My journal (J)"><Bookmark size={17} strokeWidth={1.5}/><span>JOURNAL</span><small>{progress.favorites.length}</small></button>
    </div>}
    {state.appState !== 'EXHIBIT_VIEW' && tourIndex === null && <LocationCaption location={state.activeLocation} />}
    {tourIndex !== null && state.appState !== 'EXHIBIT_VIEW' && !archiveTab && <GuidedTour
      index={tourIndex} inspected={tourInspected} activeRoom={state.activeRoom}
      transitioning={state.isTransitioning} onClose={() => setTourIndex(null)}
      onTravel={(room) => dispatch({ type:'GO_TO_ROOM', room })}
      onInspect={(room, exhibitId) => dispatch({ type:'SELECT_EXHIBIT', room, exhibitId })}
      onNext={continueTour} onJournal={() => { setTourIndex(null); setArchiveTab('journal') }} />}

    {state.appState !== 'EXHIBIT_VIEW' && <CivilizationNavigation
      activeLocation={state.activeLocation} disabled={state.isTransitioning}
      onSelectRoom={(room: Civilization)=>dispatch({type:'GO_TO_ROOM',room})}
      onSelectAtrium={()=>dispatch({type:'RETURN_TO_ATRIUM'})}
    />}
    {state.appState==='EXHIBIT_VIEW' && selectedExhibit && <ExhibitInformationPanel key={selectedExhibit.id} exhibit={selectedExhibit}
      saved={progress.favorites.includes(selectedExhibit.id)} onToggleSaved={()=>toggleFavorite(selectedExhibit.id)} />}
    {!archiveTab && <button ref={helpButtonRef} className="museum-help" type="button" onClick={() => setHelpOpen(true)} title="How to navigate (?)" aria-label="How to navigate"><HelpCircle size={17}/></button>}
    {helpOpen && <div className="help-scrim" onMouseDown={e => { if (e.target === e.currentTarget) setHelpOpen(false) }}>
      <section ref={helpDialogRef} className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-heading">
        <button type="button" ref={helpCloseRef} className="help-dialog__close" onClick={() => setHelpOpen(false)} aria-label="Close help"><X size={19}/></button>
        <p className="help-dialog__eyebrow">VISITOR GUIDE · MYTHOS</p>
        <h2 id="help-heading">Explore at your pace.</h2>
        <p>Choose a wing using the archways or the navigation bar. Select a sculpture to inspect it.</p>
        <dl><dt>Rotate an exhibit</dt><dd>Drag with a mouse or swipe with a finger</dd><dt>Zoom</dt><dd>Scroll or pinch in exhibit view</dd><dt>Return</dt><dd>Use Back, or press Escape</dd><dt>Atlas / journal</dt><dd>Press A / J on the keyboard</dd><dt>Curated tour</dt><dd>Press T, or choose TOUR</dd><dt>Performance</dt><dd>Change QUALITY to ECO and CAMERA to INSTANT if animation stutters</dd></dl>
        <p className="help-dialog__credits"><a href={`${import.meta.env.BASE_URL}credits.html`} target="_blank" rel="noopener noreferrer">Artwork credits, original creators &amp; licenses ↗</a></p>
        <button type="button" className="help-dialog__action" onClick={() => setHelpOpen(false)}>CONTINUE EXPLORING</button>
      </section>
    </div>}
    {archiveTab && <ArchiveOverlay initialTab={archiveTab} onClose={closeArchive}
      onVisit={(room)=>dispatch({ type:'GO_TO_ROOM',room })}
      favorites={progress.favorites} visited={progress.visited} onToggleFavorite={toggleFavorite} />}
  </>
}

function MuseumExperience() {
  const [canvasReady, setCanvasReady] = useState(false)
  const [startupError, setStartupError] = useState(false)
  useEffect(() => {
    if (canvasReady) { return }
    const timeout = window.setTimeout(() => setStartupError(true), 12000)
    return () => window.clearTimeout(timeout)
  }, [canvasReady])
  const { quality, setQuality } = useGraphicsQuality()
  const { motion, setMotion } = useMotionPreference()
  const { state } = useMuseumState()
  return <GraphicsQualityProvider quality={quality}><div className="museum-app">
    <MotionProvider mode={motion}><SceneCanvas quality={quality} onReady={() => { setCanvasReady(true); setStartupError(false) }}><MuseumWorld /></SceneCanvas></MotionProvider>
    <LoadingScreen visible={!canvasReady && !startupError} />
    {startupError && <div className="startup-error" role="alert">
      <h2>MYTHOS could not start 3D graphics.</h2>
      <p>Enable hardware acceleration in your browser, update graphics drivers, or reload the museum.</p>
      <button type="button" onClick={() => window.location.reload()}>RELOAD MUSEUM</button>
    </div>}
    <TransitionVeil />
    <MuseumUI />
    {state.appState !== 'WELCOME' && <div className="experience-settings" aria-label="Museum performance settings">
    <div className="graphics-quality" title="Lower graphics quality if camera movement stutters">
      <Gauge size={15} strokeWidth={1.5} aria-hidden="true" />
      <label htmlFor="mythos-quality">QUALITY</label>
      <select id="mythos-quality" aria-label="Graphics quality" value={quality}
        onChange={e => setQuality(e.target.value as GraphicsQuality)}>
        <option value="eco">ECO · fastest</option>
        <option value="balanced">BALANCED</option>
        <option value="high">HIGH · detail</option>
      </select>
    </div>
    <div className="motion-setting" title="Select a smooth journey or immediate camera transitions">
      <label htmlFor="mythos-motion">CAMERA</label>
      <select id="mythos-motion" value={motion} aria-label="Camera movement style" onChange={e => setMotion(e.target.value as MotionMode)}>
        <option value="cinematic">CINEMATIC</option>
        <option value="instant">INSTANT · faster</option>
      </select>
    </div>
    </div>}
  </div></GraphicsQualityProvider>
}

export default function App() { return <MuseumStateProvider><MuseumExperience /></MuseumStateProvider> }
