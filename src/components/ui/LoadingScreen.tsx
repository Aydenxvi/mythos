import './LoadingScreen.css'

export interface LoadingScreenProps {
  visible: boolean
}

/** A minimal, brief cover shown only until the WebGL context is ready — not a cinematic. */
export function LoadingScreen({ visible }: LoadingScreenProps) {
  return (
    <div className={`loading-screen${visible ? '' : ' is-hidden'}`} aria-hidden={!visible}>
      <span className="loading-screen__mark">MYTHOS</span>
    </div>
  )
}
