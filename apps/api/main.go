package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"auditoria/config"
	"auditoria/controllers"
)

func setupRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/tareas", controllers.GetTareas)
	mux.HandleFunc("POST /api/tareas", controllers.CreateTarea)
	mux.HandleFunc("OPTIONS /api/tareas", controllers.GetTareas)
	mux.HandleFunc("GET /api/v1/tareas", controllers.GetTareas)
	mux.HandleFunc("POST /api/v1/tareas", controllers.CreateTarea)
	mux.HandleFunc("OPTIONS /api/v1/tareas", controllers.GetTareas)
	mux.HandleFunc("GET /api/logs/prueba", controllers.GetLogsPrueba)
	mux.HandleFunc("GET /api/v1/logs/prueba", controllers.GetLogsPrueba)

	// Healthchecks según estándar de la asignatura (sección 4 y 8)
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		if config.DB == nil {
			http.Error(w, "base de datos no inicializada", http.StatusServiceUnavailable)
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := config.DB.PingContext(ctx); err != nil {
			http.Error(w, "base de datos no disponible", http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ready"))
	})
	return mux
}

func main() {
	// 1. Conectar a PostgreSQL
	config.ConnectDB()

	// 2. Definir rutas
	mux := setupRouter()

	// 3. Emitir logs de prueba para la pestaña del frontend
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	controllers.StartGeneradorLogsPrueba(ctx)

	// 4. Levantar servidor
	fmt.Println("Servidor corriendo en el puerto 8080 (PostgreSQL)")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}
