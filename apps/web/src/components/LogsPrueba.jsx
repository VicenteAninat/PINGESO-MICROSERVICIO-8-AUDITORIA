import { useEffect, useMemo, useState } from 'react'

const LOGS_POR_PAGINA = 10

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'America/Santiago',
})

export default function LogsPrueba() {
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('Todos')
  const [intento, setIntento] = useState(0)
  const [paginaActual, setPaginaActual] = useState(1)

  useEffect(() => {
    const controller = new AbortController()
    let temporizador
    let primeraSolicitud = true

    async function cargarLogs() {
      try {
        const respuesta = await fetch('/api/v1/logs/prueba', {
          signal: controller.signal,
        })
        if (!respuesta.ok) {
          throw new Error(`El backend respondió con estado ${respuesta.status}`)
        }

        const datos = await respuesta.json()
        if (!Array.isArray(datos)) {
          throw new Error('El backend devolvió un formato de logs inválido')
        }
        if (!controller.signal.aborted) {
          setLogs(datos)
          setError(null)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          if (primeraSolicitud) {
            setCargando(false)
            primeraSolicitud = false
          }
          temporizador = window.setTimeout(cargarLogs, 1000)
        }
      }
    }

    cargarLogs()

    return () => {
      controller.abort()
      window.clearTimeout(temporizador)
    }
  }, [intento])

  const logsFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es-CL')

    return logs.filter((log) => {
      const coincideTexto = [log.id, log.servicio, log.mensaje]
        .join(' ')
        .toLocaleLowerCase('es-CL')
        .includes(consulta)
      const coincideNivel = filtroNivel === 'Todos' || log.nivel === filtroNivel
      return coincideTexto && coincideNivel
    })
  }, [busqueda, filtroNivel, logs])

  const totalPaginas = Math.ceil(logsFiltrados.length / LOGS_POR_PAGINA)
  const paginaVisible = Math.min(paginaActual, Math.max(totalPaginas, 1))
  const inicioPagina = (paginaVisible - 1) * LOGS_POR_PAGINA
  const logsPagina = logsFiltrados.slice(inicioPagina, inicioPagina + LOGS_POR_PAGINA)

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas)
    }
  }, [paginaActual, totalPaginas])

  return (
    <main className="logs-view">
      <div className="contenido">
        <section className="encabezado">
          <div>
            <p className="sobretitulo">INTEGRACIÓN DE BACKEND</p>
            <h1>Logs de prueba</h1>
            <p className="descripcion">
              Registros recibidos en tiempo real desde el servicio API.
            </p>
          </div>
          <span className="periodo">
            <span className="punto-azul" aria-hidden="true" />
            Actualiza cada 1 s
          </span>
        </section>

        <aside className="aviso-demo" aria-label="Aviso sobre los logs de prueba">
          <span className="aviso-icono" aria-hidden="true">i</span>
          <p>
            <strong>Solo para pruebas.</strong> El backend genera un log cada 2
            segundos y esta vista consulta la lista cada segundo. No son persistentes.
          </p>
        </aside>

        <section className="panel-eventos" aria-labelledby="titulo-logs">
          <div className="panel-encabezado">
            <div>
              <h2 id="titulo-logs">Registros emitidos por el backend</h2>
              <p>GET /api/v1/logs/prueba</p>
            </div>
            <div className="acciones-logs">
              <span className="contador-eventos">
                {cargando ? 'Cargando...' : `${logsFiltrados.length} logs`}
              </span>
              <button
                className="boton-actualizar"
                type="button"
                onClick={() => setIntento((actual) => actual + 1)}
                disabled={cargando}
              >
                Actualizar
              </button>
            </div>
          </div>

          <div className="filtros">
            <label className="busqueda">
              <span className="busqueda-icono" aria-hidden="true">⌕</span>
              <span className="solo-lectores">Buscar en logs</span>
              <input
                type="search"
                value={busqueda}
                onChange={(event) => {
                  setBusqueda(event.target.value)
                  setPaginaActual(1)
                }}
                placeholder="Buscar por servicio o mensaje..."
              />
            </label>
            <label className="filtro-resultado">
              <span className="solo-lectores">Filtrar por nivel</span>
              <select
                value={filtroNivel}
                onChange={(event) => {
                  setFiltroNivel(event.target.value)
                  setPaginaActual(1)
                }}
              >
                <option>Todos</option>
                <option>DEBUG</option>
                <option>INFO</option>
                <option>WARN</option>
                <option>ERROR</option>
              </select>
            </label>
          </div>

          {cargando && (
            <p className="estado-carga" role="status">
              Solicitando logs de prueba al backend...
            </p>
          )}

          {!cargando && error && (
            <div className="estado-error" role="alert">
              <p>No se pudieron actualizar los logs: {error}</p>
              <button
                className="boton-actualizar"
                type="button"
                onClick={() => setIntento((actual) => actual + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {!cargando && totalPaginas > 1 && (
            <nav className="paginacion-logs" aria-label="Paginación de logs">
              <span>
                Página {paginaVisible} de {totalPaginas}
              </span>
              <div className="paginacion-botones">
                <button
                  type="button"
                  aria-label="Página anterior"
                  onClick={() => setPaginaActual(paginaVisible - 1)}
                  disabled={paginaVisible === 1}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map(
                  (pagina) => (
                    <button
                      key={pagina}
                      type="button"
                      aria-label={`Página ${pagina}`}
                      aria-current={pagina === paginaVisible ? 'page' : undefined}
                      onClick={() => setPaginaActual(pagina)}
                    >
                      {pagina}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  aria-label="Página siguiente"
                  onClick={() => setPaginaActual(paginaVisible + 1)}
                  disabled={paginaVisible === totalPaginas}
                >
                  Siguiente
                </button>
              </div>
            </nav>
          )}

          {!cargando && (
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Fecha y hora</th>
                    <th scope="col">Nivel</th>
                    <th scope="col">Servicio</th>
                    <th scope="col">Mensaje</th>
                    <th scope="col">Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {logsPagina.map((log) => (
                    <tr key={log.id}>
                      <td className="log-fecha">
                        <time dateTime={log.fecha}>
                          {formatoFecha.format(new Date(log.fecha))}
                        </time>
                      </td>
                      <td>
                        <span className={`nivel-log nivel-${log.nivel.toLowerCase()}`}>
                          {log.nivel}
                        </span>
                      </td>
                      <td className="log-servicio">{log.servicio}</td>
                      <td className="log-mensaje">{log.mensaje}</td>
                      <td>
                        <span className="origen-prueba">
                          {log.es_prueba ? 'Prueba' : 'Backend'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logsFiltrados.length === 0 && (
                    <tr>
                      <td className="sin-resultados" colSpan="5">
                        {logs.length === 0
                          ? 'Esperando el primer log emitido por el backend...'
                          : 'No hay logs que coincidan con los filtros.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
