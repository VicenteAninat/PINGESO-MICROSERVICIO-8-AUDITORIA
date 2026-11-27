# React + Vite

La SPA usa React y Vite dentro del workspace pnpm del repositorio. **Vista general**
muestra datos simulados; **Logs de prueba** consulta `GET /api/v1/logs/prueba`, que
devuelve registros generados por el backend cada 2 segundos. La vista consulta la API
cada segundo, muestra 10 registros por página y conserva en memoria los registros más
recientes; no es una bitácora persistente. El backend limita la muestra a 100 registros.

Desde la raíz del repositorio:

```bash
pnpm install --frozen-lockfile
pnpm --filter frontend dev
```

El servidor de desarrollo reenvía `/api` al backend local publicado en `http://localhost:5180`.
Para compilar la aplicación, ejecuta `pnpm --filter frontend build`.
