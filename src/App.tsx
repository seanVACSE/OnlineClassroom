import { ArrowLeft, PenLine } from 'lucide-react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { TracingAssignmentList } from './tools/tracing/TracingAssignmentList'
import { TracingWorkspace } from './tools/tracing/TracingWorkspace'
import './App.css'

const tools = [
  { id: 'tracing', name: 'Tracing', icon: PenLine },
]

const HOME_IMAGES = {
  banner: `${import.meta.env.BASE_URL}images/home/banner.png`,
  background: `${import.meta.env.BASE_URL}images/home/background.png`,
  tracing: `${import.meta.env.BASE_URL}images/home/tracing.png`,
  title: `${import.meta.env.BASE_URL}images/home/toptext.png`,
}

function HomePage() {
  return (
    <main className="home-page">
      <header className="home-banner" style={{ backgroundImage: `url("${HOME_IMAGES.banner}")` }}>
        <h1 className="home-banner-title">
          <img src={HOME_IMAGES.title} alt="Mr. Berndlmaier's Classroom" />
        </h1>
      </header>
      <section
        className="home-content"
        aria-label="Classroom tools"
        style={{ backgroundImage: `url("${HOME_IMAGES.background}")` }}
      >
        <div className="home-tool-grid">
          {tools.map(({ id, name, icon: Icon }) => (
            <Link className="home-tool-link" to={`/tools/${id}`} key={id} aria-label={name}>
              <span className="home-tool-image">
                <Icon className="home-tool-fallback" size={76} strokeWidth={1.5} aria-hidden="true" />
                <img src={HOME_IMAGES.tracing} alt="" onError={(event) => { event.currentTarget.hidden = true }} />
              </span>
              <span className="home-tool-title">{name}</span>
            </Link>
          ))}
        </div>
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
