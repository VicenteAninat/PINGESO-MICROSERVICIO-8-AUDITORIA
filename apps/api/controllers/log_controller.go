package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"auditoria/models"
)

const maxLogsPrueba = 100

var logsPrueba = newLogBuffer()

var muestrasLogsPrueba = [...]struct {
	nivel    string
	servicio string
	mensaje  string
}{
	{"INFO", "api", "Solicitud de prueba procesada correctamente"},
	{"WARN", "seguridad", "Evento de acceso rechazado generado para pruebas"},
	{"DEBUG", "postgres", "Verificación de conexión de prueba completada"},
	{"ERROR", "api", "Error de prueba generado para validar el panel"},
}

type logBuffer struct {
	mutex     sync.RWMutex
	registros []models.LogPrueba
	siguiente uint64
}

func newLogBuffer() *logBuffer {
	return &logBuffer{registros: make([]models.LogPrueba, 0, maxLogsPrueba)}
}

func (b *logBuffer) agregar(fecha time.Time) models.LogPrueba {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	b.siguiente++
	muestra := muestrasLogsPrueba[(b.siguiente-1)%uint64(len(muestrasLogsPrueba))]
	registro := models.LogPrueba{
		ID:       fmt.Sprintf("LOG-PRUEBA-%06d", b.siguiente),
		Fecha:    fecha.UTC(),
		Nivel:    muestra.nivel,
		Servicio: muestra.servicio,
		Mensaje:  muestra.mensaje,
		EsPrueba: true,
	}

	if len(b.registros) == maxLogsPrueba {
		copy(b.registros, b.registros[1:])
		b.registros[len(b.registros)-1] = registro
	} else {
		b.registros = append(b.registros, registro)
	}
	return registro
}

func (b *logBuffer) obtenerRecientes() []models.LogPrueba {
	b.mutex.RLock()
	defer b.mutex.RUnlock()

	recientes := make([]models.LogPrueba, len(b.registros))
	for i := range b.registros {
		recientes[i] = b.registros[len(b.registros)-1-i]
	}
	return recientes
}

func StartGeneradorLogsPrueba(ctx context.Context) {
	iniciarGeneradorLogsPrueba(ctx, 2*time.Second, logsPrueba)
}

func iniciarGeneradorLogsPrueba(
	ctx context.Context,
	intervalo time.Duration,
	destino *logBuffer,
) <-chan struct{} {
	terminado := make(chan struct{})
	go func() {
		defer close(terminado)
		ticker := time.NewTicker(intervalo)
		defer ticker.Stop()

		for {
			select {
			case fecha := <-ticker.C:
				registro := destino.agregar(fecha)
				log.Printf(
					"log de prueba emitido id=%s nivel=%s servicio=%s",
					registro.ID,
					registro.Nivel,
					registro.Servicio,
				)
			case <-ctx.Done():
				return
			}
		}
	}()
	return terminado
}

func GetLogsPrueba(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(logsPrueba.obtenerRecientes()); err != nil {
		log.Printf("Error al responder logs de prueba: %v", err)
	}
}
