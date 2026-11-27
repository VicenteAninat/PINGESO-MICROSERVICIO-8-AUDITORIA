import { useMemo, useState } from 'react'

const eventos = [
  {
    id: 'EV-1048',
    fecha: '2026-11-27T10:42:00',
    usuario: 'María Pérez',
    iniciales: 'MP',
    accion: 'Actualizó permisos',
    recurso: 'Rol · Analista financiero',
    resultado: 'Correcto',
  },
  {
    id: 'EV-1047',
    fecha: '2026-11-27T09:18:00',
    usuario: 'Diego Soto',
    iniciales: 'DS',
    accion: 'Exportó informe',
    recurso: 'Reporte · Cierre mensual',
    resultado: 'Correcto',
  },
  {
    id: 'EV-1046',
    fecha: '2026-11-26T16:05:00',
    usuario: 'Camila Rojas',
    iniciales: 'CR',
    accion: 'Intento de acceso',
    recurso: 'Módulo · Administración',
    resultado: 'Revisión',
  },
  {
    id: 'EV-1045',
    fecha: '2026-11-26T14:31:00',
    usuario: 'Javier Muñoz',
    iniciales: 'JM',
    accion: 'Modificó registro',
    recurso: 'Proveedor · Andes Ltda.',
    resultado: 'Correcto',
  },
  {
    id: 'EV-1044',
    fecha: '2026-11-25T11:12:00',
    usuario: 'María Pérez',
    iniciales: 'MP',
    accion: 'Inició sesión',
    recurso: 'Portal de auditoría',
    resultado: 'Correcto',
  },
]

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export default function DashboardAuditoria() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroResultado, setFiltroResultado] = useState('Todos')

  const eventosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es-CL')

    return eventos.filter((evento) => {
      const coincideTexto = [
        evento.usuario,
        evento.accion,
        evento.recurso,
        evento.id,
      ]
        .join(' ')
        .toLocaleLowerCase('es-CL')
        .includes(consulta)
      const coincideResultado =
        filtroResultado === 'Todos' || evento.resultado === filtroResultado

      return coincideTexto && coincideResultado
    })
  }, [busqueda, filtroResultado])

  const revisionesPendientes = eventos.filter(
    (evento) => evento.resultado === 'Revisión',
  ).length
  const usuariosActivos = new Set(eventos.map((evento) => evento.usuario)).size

  return (
    <main className="dashboard">
      <div className="contenido">
        <section className="encabezado">
          <div>
            <p className="sobretitulo">PINGESO MICROSERVICIO 8 - AUDITORÍA</p>
            <h1>Panel de auditoría</h1>
          </div>
          <span className="periodo">
            <span className="punto-verde" aria-hidden="true" />
            Últimos 7 días
          </span>
        </section>

        <aside className="aviso-demo" aria-label="Aviso de datos simulados">
          <span className="aviso-icono" aria-hidden="true">i</span>
          <p>
            <strong>Vista de demostración.</strong> Estos eventos son datos
            simulados; todavía no se conectan a una bitácora real.
          </p>
        </aside>

        <section className="indicadores" aria-label="Resumen de actividad">
          <article className="tarjeta-indicador">
            <span className="indicador-icono icono-azul" aria-hidden="true">↗</span>
            <p className="indicador-etiqueta">Eventos registrados</p>
            <p className="indicador-valor">{eventos.length}</p>
            <p className="indicador-nota">En el período seleccionado</p>
          </article>
          <article className="tarjeta-indicador">
            <span className="indicador-icono icono-verde" aria-hidden="true">✓</span>
            <p className="indicador-etiqueta">Acciones correctas</p>
            <p className="indicador-valor">
              {eventos.length - revisionesPendientes}
            </p>
            <p className="indicador-nota">Sin alertas detectadas</p>
          </article>
          <article className="tarjeta-indicador">
            <span className="indicador-icono icono-ambar" aria-hidden="true">!</span>
            <p className="indicador-etiqueta">Requieren revisión</p>
            <p className="indicador-valor">{revisionesPendientes}</p>
            <p className="indicador-nota">Revisar actividad marcada</p>
          </article>
          <article className="tarjeta-indicador">
            <span className="indicador-icono icono-violeta" aria-hidden="true">◉</span>
            <p className="indicador-etiqueta">Usuarios activos</p>
            <p className="indicador-valor">{usuariosActivos}</p>
            <p className="indicador-nota">Con actividad registrada</p>
          </article>
        </section>

        <section className="panel-eventos" id="eventos">
          <div className="panel-encabezado">
            <div>
              <h2>Actividad reciente</h2>
              <p>Registro de acciones realizadas en el sistema</p>
            </div>
            <span className="contador-eventos">{eventosFiltrados.length} eventos</span>
          </div>

          <div className="filtros">
            <label className="busqueda">
              <span className="busqueda-icono" aria-hidden="true">⌕</span>
              <span className="solo-lectores">Buscar eventos</span>
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar usuario, acción o recurso..."
              />
            </label>
            <label className="filtro-resultado">
              <span className="solo-lectores">Filtrar por resultado</span>
              <select
                value={filtroResultado}
                onChange={(event) => setFiltroResultado(event.target.value)}
              >
                <option>Todos</option>
                <option>Correcto</option>
                <option>Revisión</option>
              </select>
            </label>
          </div>

          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th scope="col">Evento</th>
                  <th scope="col">Usuario</th>
                  <th scope="col">Acción</th>
                  <th scope="col">Recurso</th>
                  <th scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {eventosFiltrados.map((evento) => (
                  <tr key={evento.id}>
                    <td>
                      <span className="evento-id">{evento.id}</span>
                      <time className="evento-fecha" dateTime={evento.fecha}>
                        {formatoFecha.format(new Date(evento.fecha))}
                      </time>
                    </td>
                    <td>
                      <span className="usuario-celda">
                        <span className="usuario-iniciales" aria-hidden="true">
                          {evento.iniciales}
                        </span>
                        {evento.usuario}
                      </span>
                    </td>
                    <td className="accion-celda">{evento.accion}</td>
                    <td className="recurso-celda">{evento.recurso}</td>
                    <td>
                      <span
                        className={`etiqueta-resultado ${
                          evento.resultado === 'Correcto'
                            ? 'resultado-correcto'
                            : 'resultado-revision'
                        }`}
                      >
                        <span aria-hidden="true">●</span>
                        {evento.resultado}
                      </span>
                    </td>
                  </tr>
                ))}
                {eventosFiltrados.length === 0 && (
                  <tr>
                    <td className="sin-resultados" colSpan="5">
                      No hay eventos que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pie-dashboard">
          <span>Auditoría · Entorno demostrativo</span>
          <span>Los registros mostrados no son datos reales</span>
        </footer>
      </div>
    </main>
  )
}
