import { ArrowLeft, Grid2X2, Paintbrush } from 'lucide-react'
import { Link } from 'react-router-dom'
import turkeyLogo from '../../assets/thanksgiving/turkeys/turkeyLogo.webp'
import turkeyImage from '../../assets/thanksgiving/turkeys/Turkey.png'
import { TracingWorkspace } from '../tracing/TracingWorkspace'
import type { TracingAssignment } from '../../data/tracingAssets'
import '../tracing/Tracing.css'
import './Thanksgiving.css'

const turkeyAssignment: TracingAssignment = {
  id: 'thanksgiving-turkey',
  name: 'Disguise a Turkey',
  images: [{ fileName: 'Turkey.png', url: turkeyImage }],
}

const background = `${import.meta.env.BASE_URL}images/home/background.png`
const banner = `${import.meta.env.BASE_URL}images/tracing/banner.png`

function Page({ title, back, children }: { title: string; back: string; children: React.ReactNode }) {
  return <main className="tracing-page thanksgiving-page">
    <header className="tracing-banner" style={{ backgroundImage: `url("${banner}")` }}>
      <Link className="back-link" to={back}><ArrowLeft size={17} /> Back</Link>
      <h1 className="tracing-banner-title">{title}</h1>
    </header>
    <section className="thanksgiving-content" style={{ backgroundImage: `url("${background}")` }}>{children}</section>
  </main>
}

export function ThanksgivingPage() {
  return <Page title="Thanksgiving" back="/">
    <h2>Choose an activity</h2>
    <div className="tracing-assignment-grid thanksgiving-activity-grid">
      <Link className="tracing-assignment-link" to="/tools/thanksgiving/turkey">
        <span className="tracing-assignment-image"><Paintbrush size={64} aria-hidden="true" /><img src={turkeyLogo} alt="" /></span>
        <span className="tracing-assignment-title">Disguise a Turkey</span>
      </Link>
      <Link className="tracing-assignment-link" to="/tools/thanksgiving/crossword">
        <span className="tracing-assignment-image"><Grid2X2 size={76} strokeWidth={1.5} aria-hidden="true" /></span>
        <span className="tracing-assignment-title">Crossword 2–3</span>
      </Link>
      <Link className="tracing-assignment-link" to="/tools/thanksgiving/crossword-4-6">
        <span className="tracing-assignment-image"><Grid2X2 size={76} strokeWidth={1.5} aria-hidden="true" /></span>
        <span className="tracing-assignment-title">Crossword 4–6</span>
      </Link>
    </div>
  </Page>
}

export function TurkeyWorkspace() {
  return <TracingWorkspace turkeyAssignment={turkeyAssignment} />
}
