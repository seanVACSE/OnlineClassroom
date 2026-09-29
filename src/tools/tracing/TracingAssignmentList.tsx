import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { tracingAssignments } from '../../data/tracingAssets'
import './Tracing.css'

export function TracingAssignmentList() {
  return (
    <main className="dashboard">
      <Link className="back-link" to="/"><ArrowLeft size={17} /> Back to classroom</Link>
      <header className="page-heading">
        <h1>Tracing</h1>
        <p>Choose an assignment to start tracing.</p>
      </header>
      {tracingAssignments.length === 0 ? (
        <p className="tracing-empty">No tracing assignments have been added yet.</p>
      ) : (
        <section className="tool-grid" aria-label="Tracing assignments">
          {tracingAssignments.map((assignment) => (
            <Link className="tool-card" to={`/tools/tracing/${assignment.id}`} key={assignment.id}>
              <span className="tool-card-copy">
                <strong>{assignment.name}</strong>
                <span>{assignment.images.length} image{assignment.images.length === 1 ? '' : 's'}</span>
              </span>
              <ArrowUpRight className="tool-arrow" size={18} aria-hidden="true" />
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
