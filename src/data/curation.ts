/** Original editorial descriptions written for MYTHOS. Mythology is not an archaeological dating system. */
export interface CuratorialRecord {
  epithet: string
  lead: string
  narrative: string[]
  symbols: string[]
  symbolMeanings: Record<string, string>
  context: string
  connections: { title: string; description: string }[]
  reading: string
  audio: string
}

export const CURATION: Record<'athena' | 'jupiter' | 'anubis', CuratorialRecord> = {
  athena: {
    epithet: 'Wisdom · Craft · Strategy',
    lead: 'Protector of the city, patron of skill, and a goddess whose power was measured by judgment as much as strength.',
    narrative: [
      'In a celebrated Athenian tradition, Athena and Poseidon competed to become the city’s patron. Poseidon offered a spring; Athena brought forth the olive tree, a gift associated with nourishment, craft and peace. The city took her name.',
      'Other ancient narratives present Athena as emerging, fully armed, from the head of Zeus. Her birth places intellect and disciplined power at the centre of her divine identity.',
      'Athena appears throughout epic and drama as a guide to heroes, but she is never simply a modern symbol of “wisdom”: the myths also depict rivalry, anger and the demands of divine authority.',
    ],
    symbols: ['Owl', 'Olive branch', 'Aegis', 'Spear and shield'],
    symbolMeanings: {
      'Owl': 'The little owl became a distinctive emblem of Athena and appears on ancient Athenian coins.',
      'Olive branch': 'In the contest for Athens, the olive tree represented a valuable gift: food, oil, wood and civic prosperity.',
      'Aegis': 'A protective divine garment or shield associated with Athena, often shown bearing the Gorgon’s head.',
      'Spear and shield': 'Her martial attributes emphasize strategy, defence and disciplined strength rather than battle alone.',
    },
    context: 'The statue on display is the Newton Hall (Walston) Athena, a Roman marble image of the Greek goddess dating to around 100–200 CE. Its digital scan was made available by the Fitzwilliam Museum; the original is catalogued as GR.1.2006. Greek myth, Roman copying, and the date of the surviving sculpture are different historical layers.',
    connections: [{ title: 'Zeus', description: 'Athena is presented as the daughter of Zeus in many Greek traditions.' }, { title: 'Poseidon', description: 'Their contest for Athens expresses competing kinds of divine patronage.' }],
    reading: 'Hesiod, Theogony; Homer, Iliad and Odyssey; Pseudo-Apollodorus, Bibliotheca.',
    audio: 'Athena. Goddess of wisdom, craft, and strategic warfare. A celebrated story tells how Athena and Poseidon competed for the city of Athens. Athena offered the olive tree, which became a symbol of the city. The sculpture shown here is a Roman-period image of the Greek goddess, preserved today in the Fitzwilliam Museum.',
  },
  jupiter: {
    epithet: 'Sky · Oaths · Sovereignty',
    lead: 'Guardian of the Roman state, witness to oaths and treaties, and the highest authority of the Roman divine order.',
    narrative: [
      'Jupiter, known in Latin as Iuppiter, held a central role in Rome’s public religion. The great temple of Jupiter Optimus Maximus on the Capitoline Hill symbolised the relationship between divine protection and political authority.',
      'Roman writers frequently associated Jupiter with the Greek Zeus, and artists borrowed familiar visual forms: the seated ruler, the eagle and the thunderbolt. The traditions were closely entangled, but Roman worship and civic responsibilities gave Jupiter a distinctive cultural role.',
      'In epic poetry, Jupiter is often the voice of cosmic or historical order. His authority is sometimes reassuring, sometimes terrifying, and always bound to the Roman imagination of power.',
    ],
    symbols: ['Thunderbolt', 'Eagle', 'Sceptre', 'Oak'],
    symbolMeanings: {
      'Thunderbolt': 'The thunderbolt represents the sky god’s capacity to command the heavens and enforce divine authority.',
      'Eagle': 'An eagle is a familiar attribute of Jupiter in Roman art and expresses divine sovereignty.',
      'Sceptre': 'A sceptre visually communicates Jupiter’s rule among the gods and his place within Roman civic religion.',
      'Oak': 'The oak was especially associated with Zeus and Jupiter, including the ancient oracle at Dodona in Greece.',
    },
    context: 'This gallery explores Jupiter as a figure of Roman public worship and literature. The figure displayed here is an interpretive digital sculpture, not a reconstruction of a specific statue.',
    connections: [{ title: 'Zeus', description: 'The Greek deity frequently identified with Jupiter through interpretatio and artistic exchange.' }, { title: 'Juno', description: 'Jupiter and Juno form part of the Capitoline Triad with Minerva.' }],
    reading: 'Virgil, Aeneid; Ovid, Fasti; Livy, Ab Urbe Condita.',
    audio: 'Jupiter. God of the sky, oaths, and sovereignty. His worship stood at the heart of Rome’s public religion. Roman artists often adopted imagery associated with the Greek Zeus, yet Jupiter’s role in civic ritual remained distinct. The figure here is a modern digital interpretation.',
  },
  anubis: {
    epithet: 'Embalming · Protection · Passage',
    lead: 'A jackal-headed guardian of burial rites, whose image evokes the care given to the dead and the passage beyond life.',
    narrative: [
      'Anubis is among the most recognisable deities of ancient Egypt. Depicted as a jackal or a man with a jackal’s head, he was closely associated with embalming, cemeteries and the protection of the deceased.',
      'In funerary traditions, Anubis may be shown attending the weighing of the heart, an image associated with judgment in the afterlife. The precise roles of deities differed across texts, periods and local traditions.',
      'As the cult of Osiris grew, associations among Anubis, Osiris and other funerary deities changed. Egyptian mythology is a long, evolving body of religious traditions, not a single fixed story.',
    ],
    symbols: ['Jackal', 'Funerary cloth', 'Scales', 'Necropolis'],
    symbolMeanings: {
      'Jackal': 'The canine form connects Anubis with desert-edge burial grounds and the protection of the dead.',
      'Funerary cloth': 'Anubis was associated with embalming and the rituals that prepared a deceased person for burial.',
      'Scales': 'In later funerary scenes, Anubis may attend the weighing of the heart, a test connected with Ma’at.',
      'Necropolis': 'As guardian of cemeteries, Anubis protects the spaces separating the living from the dead.',
    },
    context: 'This contemporary Anubis bust is a digital artwork by lucasthx88, not an excavated object. The mythological tradition spans numerous periods of Egyptian history.',
    connections: [{ title: 'Osiris', description: 'Anubis and Osiris share important functions in evolving Egyptian funerary belief.' }, { title: 'Ma’at', description: 'The weighing of the heart evokes truth, justice and cosmic balance.' }],
    reading: 'The Book of the Dead (selected manuscripts); Pyramid Texts; Coffin Texts.',
    audio: 'Anubis. Guardian of burial rites and a guide in the journey beyond life. Ancient Egyptians portrayed Anubis as a jackal or as a jackal-headed man. In funerary scenes, he may attend the weighing of the heart. His roles changed over centuries. This is a modern digital interpretation.',
  },
}

export const HISTORICAL_TIMELINE = [
  { era: 'c. 2400–2300 BCE', label: 'Pyramid Texts', civilization: 'Egypt', description: 'Some of the earliest surviving Egyptian royal funerary inscriptions, preserving a complex world of deities and afterlife beliefs.' },
  { era: 'c. 2000–1600 BCE', label: 'Coffin Texts', civilization: 'Egypt', description: 'Funerary compositions broadened and adapted earlier traditions; the dates vary by manuscript and context.' },
  { era: 'c. 8th century BCE', label: 'Homeric epics', civilization: 'Greece', description: 'The Iliad and Odyssey preserve poetic traditions concerning the Olympian gods and heroes.' },
  { era: 'c. 700 BCE', label: 'Hesiod’s Theogony', civilization: 'Greece', description: 'An influential account of divine genealogies and the origins of cosmic rule.' },
  { era: '509–27 BCE', label: 'Roman Republic', civilization: 'Rome', description: 'Jupiter’s cult and the rituals of public religion occupied a central position in civic life.' },
  { era: '29–19 BCE', label: 'Virgil’s Aeneid', civilization: 'Rome', description: 'An Augustan epic linking divine action, heroic narrative and Roman identity.' },
]
