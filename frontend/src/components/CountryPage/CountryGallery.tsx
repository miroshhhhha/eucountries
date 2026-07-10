import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const WIKI_TOPICS: Record<string, string[]> = {
  AT: ['Vienna', 'Hallstatt', 'Salzburg', 'Innsbruck', 'Austrian Alps'],
  BE: ['Brussels', 'Bruges', 'Ghent', 'Antwerp', 'Belgium'],
  BG: ['Sofia', 'Plovdiv', 'Rila Monastery', 'Nessebar', 'Veliko Tarnovo'],
  CY: ['Paphos', 'Limassol', 'Nicosia', 'Kyrenia', 'Cyprus'],
  CZ: ['Prague', 'Charles Bridge', 'Prague Castle', 'Český Krumlov', 'Brno'],
  DE: ['Berlin', 'Neuschwanstein Castle', 'Munich', 'Hamburg', 'Heidelberg'],
  DK: ['Copenhagen', 'Nyhavn', 'Rosenborg Castle', 'Aarhus', 'Kronborg Castle'],
  EE: ['Tallinn', 'Tartu', 'Saaremaa', 'Lahemaa National Park', 'Estonia'],
  ES: ['Barcelona', 'Alhambra', 'Madrid', 'Sagrada Família', 'Seville'],
  FI: ['Helsinki', 'Northern Lights', 'Lake Saimaa', 'Rovaniemi', 'Finland'],
  FR: ['Paris', 'Eiffel Tower', 'Provence', 'Palace of Versailles', 'Mont Saint-Michel'],
  GR: ['Santorini', 'Acropolis of Athens', 'Mykonos', 'Meteora', 'Corfu'],
  HR: ['Dubrovnik', 'Plitvice Lakes National Park', 'Hvar', 'Split Croatia', "Diocletian's Palace"],
  HU: ['Budapest', 'Hungarian Parliament Building', "Fisherman's Bastion", 'Buda Castle', 'Lake Balaton'],
  IE: ['Cliffs of Moher', 'Dublin', 'Rock of Cashel', 'Ring of Kerry', 'Connemara'],
  IT: ['Rome', 'Venice', 'Tuscany', 'Amalfi Coast', 'Florence'],
  LT: ['Vilnius', 'Trakai Island Castle', 'Curonian Spit', 'Kaunas', 'Lithuania'],
  LU: ['Luxembourg City', 'Vianden Castle', 'Luxembourg', 'Echternach', 'Moselle wine region'],
  LV: ['Riga', 'Art Nouveau in Riga', 'Gauja National Park', 'Jūrmala', 'Latvia'],
  MT: ['Valletta', 'Malta', 'Mdina', 'Gozo', 'Blue Lagoon Malta'],
  NL: ['Amsterdam', 'Keukenhof', 'Kinderdijk', 'Netherlands', 'Windmill'],
  PL: ['Kraków', 'Warsaw', 'Wieliczka Salt Mine', 'Wrocław', 'Białowieża Forest'],
  PT: ['Lisbon', 'Porto', 'Sintra', 'Algarve', 'Pena Palace'],
  RO: ['Bucharest', 'Bran Castle', 'Transylvania', 'Sibiu', 'Carpathian Mountains'],
  SE: ['Stockholm', 'Gamla Stan', 'Swedish Lapland', 'Gothenburg', 'Sweden'],
  SI: ['Lake Bled', 'Ljubljana', 'Triglav National Park', 'Postojna Cave', 'Slovenia'],
  SK: ['Bratislava', 'Spiš Castle', 'High Tatras', 'Banská Štiavnica', 'Slovakia'],
}

interface ImageData {
  src: string
  caption: string
  description: string
}

interface Props {
  countryCode: string
  countryName: string
}

interface ModalProps {
  image: ImageData
  onClose: () => void
}

function Modal({ image, onClose }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.caption}
          className="w-full object-cover max-h-72"
        />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{image.caption}</h3>
          {image.description ? (
            <p className="text-sm text-gray-600 leading-relaxed">{image.description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No description available.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function CountryGallery({ countryCode, countryName }: Props) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [modalImage, setModalImage] = useState<ImageData | null>(null)
  const touchStartX = useRef<number | null>(null)

  const topics = WIKI_TOPICS[countryCode] ?? []

  useEffect(() => {
    if (!topics.length) return
    setLoading(true)
    setCurrent(0)

    Promise.all(
      topics.map(async (topic) => {
        try {
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
            { headers: { Accept: 'application/json' } }
          )
          if (!res.ok) return null
          const data = await res.json()
          const src = data.originalimage?.source ?? data.thumbnail?.source ?? null
          if (!src) return null
          const description: string = data.description
            ? `${data.description}. ${data.extract ?? ''}`.trim()
            : (data.extract ?? '')
          return { src, caption: topic, description }
        } catch {
          return null
        }
      })
    ).then((results) => {
      setImages(results.filter((r): r is ImageData => r !== null))
      setLoading(false)
    })
  }, [countryCode])

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length) }

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 50) setCurrent(i => (i - 1 + images.length) % images.length)
    else if (delta < -50) setCurrent(i => (i + 1) % images.length)
    touchStartX.current = null
  }

  if (loading) {
    return <div className="w-full rounded-xl bg-gray-100 animate-pulse" style={{ aspectRatio: '16/9' }} />
  }

  if (!images.length) return null

  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-xl bg-gray-900 select-none cursor-zoom-in"
        style={{ aspectRatio: '16/9' }}
        onClick={() => setModalImage(images[current])}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map(({ src, caption }, i) => (
          <img
            key={src}
            src={src}
            alt={`${countryName} — ${caption}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0 }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        <span className="absolute bottom-2 left-4 text-white/80 text-xs pointer-events-none">
          {images[current]?.caption}
        </span>

        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="absolute bottom-2 right-4 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
              aria-label={`Photo ${i + 1}`}
              className={`rounded-full transition-all ${
                i === current ? 'bg-white w-5 h-2' : 'bg-white/50 hover:bg-white/75 w-2 h-2'
              }`}
            />
          ))}
        </div>
      </div>

      {modalImage && <Modal image={modalImage} onClose={() => setModalImage(null)} />}
    </>
  )
}
