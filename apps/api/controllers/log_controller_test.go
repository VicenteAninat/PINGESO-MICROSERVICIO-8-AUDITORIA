package controllers

import (
	"context"
	"testing"
	"time"
)

func TestGeneradorLogsPruebaEmitePeriodicamente(t *testing.T) {
	destino := newLogBuffer()
	ctx, cancelar := context.WithCancel(context.Background())
	terminado := iniciarGeneradorLogsPrueba(ctx, 10*time.Millisecond, destino)

	limite := time.After(time.Second)
	for len(destino.obtenerRecientes()) < 2 {
		select {
		case <-limite:
			cancelar()
			<-terminado
			t.Fatal("el generador no emitió dos logs dentro del plazo")
		case <-time.After(2 * time.Millisecond):
		}
	}
	cancelar()
	<-terminado

	registros := destino.obtenerRecientes()
	if !registros[0].Fecha.After(registros[1].Fecha) {
		t.Errorf("se esperaban los registros en orden del más reciente al más antiguo")
	}
	if !registros[0].EsPrueba || !registros[1].EsPrueba {
		t.Error("el generador debe marcar todos los registros como logs de prueba")
	}
}
