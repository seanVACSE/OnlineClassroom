import { ArrowLeft, ArrowUpRight, CodeXml, Keyboard, Paintbrush, PenLine } from 'lucide-react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { TracingAssignmentList } from './tools/tracing/TracingAssignmentList'
import { TracingWorkspace } from './tools/tracing/TracingWorkspace'
import './App.css'

const tools = [
  { id: 'pixel-art', name: 'Pixel Art', description: 'Make a picture one pixel at a time.', icon: Paintbrush, color: 'coral' },
  { id: 'typing-practice', name: 'Typing Practice', description: 'Practice your keyboard skills.', icon: Keyboard, color: 'blue' },
  { id: 'code-playground', name: 'Code Playground', description: 'Try out a small coding project.', icon: CodeXml, color: 'green' },
  { id: 'tracing', name: 'Tracing', description: 'Trace over assigned images.', icon: PenLine, color: 'coral' },
]

function HomePage() {
  return (
    <main className="dashboard">
      <header className="page-heading">
        <h1>Mr. Berndlmaier's Classroom</h1>
        <p>Choose a tool to get started.</p>
      </header>
      <section className="tool-grid" aria-label="Classroom tools">
        {tools.map(({ id, name, description, icon: Icon, color }) => (
          <Link className="tool-card" to={`/tools/${id}`} key={id}>
            <span className={`tool-icon tool-icon--${color}`}><Icon size={24} aria-hidden="true" /></span>
            <span className="tool-card-copy">
              <strong>{name}</strong>
              <span>{description}</span>
            </span>
            <ArrowUpRight className="tool-arrow" size={18} aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  )
}

function ToolPage() {
  const { toolId } = useParams()
  const tool = tools.find((item) => item.id === toolId)

  if (!tool) return <Navigate to="/" replace />

  return (
    <main className="tool-placeholder">
      <Link className="back-link" to="/"><ArrowLeft size={17} /> Back to classroom</Link>
      <h1>{tool.name}</h1>
      <p>This is a placeholder for the tool.</p>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tools/tracing" element={<TracingAssignmentList />} />
      <Route path="/tools/tracing/:assignmentId" element={<TracingWorkspace />} />
      <Route path="/tools/:toolId" element={<ToolPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
