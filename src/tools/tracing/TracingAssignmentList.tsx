import { ArrowLeft, NotebookPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { tracingAssignments } from '../../data/tracingAssets'
import './Tracing.css'

const TRACING_IMAGES = {
  banner: `${import.meta.env.BASE_URL}images/tracing/banner.png`,
  background: `${import.meta.env.BASE_URL}images/tracing/background.png`,
  notepad: `${import.meta.env.BASE_URL}images/tracing/notepad.png`,
}

export function TracingAssignmentList() {
  return (
    <main className="tracing-page">
      <header className="tracing-banner" style={{ backgroundImage: `url("${TRACING_IMAGES.banner}")` }}>
        <Link className="back-link" to="/"><ArrowLeft size={17} /> Back to classroom</Link>
        <h1 className="tracing-banner-title">Tracing</h1>
      </header>
      <section
        className="tracing-content"
        aria-label="Tracing assignments"
        style={{ backgroundImage: `url("${TRACING_IMAGES.background}")` }}
      >
        {tracingAssignments.length === 0 ? (
          <p className="tracing-empty">No tracing assignments have been added yet.</p>
        ) : (
          <div className="tracing-assignment-grid">
            {tracingAssignments.map((assignment) => (
              <Link className="tracing-assignment-link" to={`/tools/tracing/${assignment.id}`} key={assignment.id}>
                <span className="tracing-assignment-image">
                  <NotebookPen className="tracing-assignment-fallback" size={64} strokeWidth={1.5} aria-hidden="true" />
                  <img src={TRACING_IMAGES.notepad} alt="" onError={(event) => { event.currentTarget.hidden = true }} />
                </span>
                <span className="tracing-assignment-title">
                  {assignment.name} <span className="tracing-assignment-count">[{assignment.images.length}]</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
