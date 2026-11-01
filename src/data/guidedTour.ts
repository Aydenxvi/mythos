import type { Civilization } from '../types/museum'

/** A compact, curator-led route through the existing three museum galleries. */
export interface TourStop {
  id: string
  civilization: Civilization
  gallery: string
  exhibitId: string
  exhibit: string
  title: string
  story: string
  question: string
}

export const GUIDED_TOUR: readonly TourStop[] = [
  {
    id: 'wisdom', civilization: 'greece', gallery: 'Hellas', exhibitId: 'athena', exhibit: 'Athena',
    title: 'The gift of wisdom',
    story: 'Begin among the Greeks. Discover how Athena became a symbol of knowledge, craftsmanship and the protection of a city.',
    question: 'Why did an olive tree matter more than a display of power?',
  },
  {
    id: 'authority', civilization: 'rome', gallery: 'Roma', exhibitId: 'jupiter', exhibit: 'Jupiter',
    title: 'The language of power',
    story: 'Cross into Rome and discover how divine authority shaped public ceremonies, promises and the life of the state.',
    question: 'What changes when a Greek deity becomes central to Roman civic ritual?',
  },
  {
    id: 'eternity', civilization: 'egypt', gallery: 'Kemet', exhibitId: 'anubis', exhibit: 'Anubis',
    title: 'The passage beyond',
    story: 'End your journey in Egypt, where Anubis represents protection, funerary rites and the transition into the afterlife.',
    question: 'How might the image of a guardian change the meaning of death?',
  },
]
