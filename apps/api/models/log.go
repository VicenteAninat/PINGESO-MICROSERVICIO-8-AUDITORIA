package models

import "time"

type LogPrueba struct {
	ID       string    `json:"id"`
	Fecha    time.Time `json:"fecha"`
	Nivel    string    `json:"nivel"`
	Servicio string    `json:"servicio"`
	Mensaje  string    `json:"mensaje"`
	EsPrueba bool      `json:"es_prueba"`
}
