import { useState } from 'react'
import DashboardAuditoria from './components/DashboardAuditoria.jsx'
import LogsPrueba from './components/LogsPrueba.jsx'

function IconoMicroservicio() {
  return (
    <svg
      className="nav-icono"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.2" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.2" />
    </svg>
  )
}

export default function App() {
  const [vista, setVista] = useState('general')
  const [menuPlegado, setMenuPlegado] = useState(false)

  return (
    <div className={`app-shell ${menuPlegado ? 'menu-plegado' : ''}`}>
      <aside className="sidebar" id="sidebar">
        <button
          className="sidebar-control"
          type="button"
          aria-label={menuPlegado ? 'Expandir menú' : 'Colapsar menú'}
          aria-controls="sidebar"
          aria-expanded={!menuPlegado}
          onClick={() => setMenuPlegado((plegado) => !plegado)}
        >
          <span className="sidebar-control-icono" aria-hidden="true">
            {menuPlegado ? '›' : '‹'}
          </span>
          <span className="nav-texto">
            {menuPlegado ? 'Expandir menú' : 'Colapsar menú'}
          </span>
        </button>
        <p className="sidebar-titulo">VISTAS</p>
        <nav className="sidebar-nav" aria-label="Secciones del panel">
          <button
            className={`nav-item ${vista === 'general' ? 'nav-item-activo' : ''}`}
            type="button"
            title="Vista general"
            aria-current={vista === 'general' ? 'page' : undefined}
            onClick={() => setVista('general')}
          >
            <IconoMicroservicio />
            <span className="nav-texto">Vista general</span>
          </button>
          <button
            className={`nav-item ${vista === 'logs' ? 'nav-item-activo' : ''}`}
            type="button"
            title="Logs de prueba"
            aria-current={vista === 'logs' ? 'page' : undefined}
            onClick={() => setVista('logs')}
          >
            <IconoMicroservicio />
            <span className="nav-texto">Logs de prueba</span>
          </button>
        </nav>
      </aside>

      <div className="dashboard-main">
        {vista === 'general' ? <DashboardAuditoria /> : <LogsPrueba />}
      </div>
    </div>
  )
}
