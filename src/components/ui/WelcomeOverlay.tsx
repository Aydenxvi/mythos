import { EnterButton } from './EnterButton'
import './WelcomeOverlay.css'

export interface WelcomeOverlayProps { onEnter: () => void; disabled?: boolean }

export function WelcomeOverlay({onEnter,disabled}:WelcomeOverlayProps) {
  return <main className="welcome-overlay">
    <div className="welcome-overlay__masthead" aria-label="MYTHOS — The Eternal Museum">
      <span className="welcome-overlay__monogram">M</span>
      <span className="welcome-overlay__brand">MYTHOS <small>THE ETERNAL MUSEUM</small></span>
      <span className="welcome-overlay__edition">A JOURNEY THROUGH TIME <span>EST. BEYOND TIME</span></span>
    </div>
    <div className="welcome-overlay__content">
      <p className="welcome-overlay__eyebrow"><span className="welcome-overlay__line"/> AN IMMERSIVE EXHIBITION</p>
      <h1 className="welcome-overlay__title">MYTHOS</h1>
      <p className="welcome-overlay__subtitle">THE ETERNAL MUSEUM</p>
      <p className="welcome-overlay__tagline">The gods have faded.<br/>Their stories remain.</p>
      <EnterButton onClick={onEnter} disabled={disabled}/>
    </div>
    <div className="welcome-overlay__footnote"><span>01 — 03</span><span>GREECE <i/> ROME <i/> EGYPT</span></div>
  </main>
}
