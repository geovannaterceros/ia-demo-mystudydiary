// Tests de las utilidades de fecha compartidas (fechas.js).
// Tarea T1: solo verifican que las funciones movidas desde app.js
// se comportan igual que antes (fecha local, nunca UTC).

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  fechaATexto,
  textoAFecha,
  hoyEnTexto,
  diaAnterior,
  obtenerLunesDeLaSemana,
} = require("./fechas.js");

test("fechaATexto convierte una fecha local a AAAA-MM-DD con ceros a la izquierda", () => {
  assert.equal(fechaATexto(new Date(2026, 9, 22)), "2026-10-22");
  assert.equal(fechaATexto(new Date(2026, 2, 3)), "2026-03-03");
});

test("textoAFecha convierte AAAA-MM-DD a una fecha local (no UTC)", () => {
  const fecha = textoAFecha("2026-10-22");
  assert.equal(fecha.getFullYear(), 2026);
  assert.equal(fecha.getMonth(), 9); // octubre = índice 9
  assert.equal(fecha.getDate(), 22);
});

test("hoyEnTexto devuelve la fecha de hoy en formato AAAA-MM-DD", () => {
  assert.match(hoyEnTexto(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(hoyEnTexto(), fechaATexto(new Date()));
});

test("diaAnterior resta un día dentro del mismo mes", () => {
  assert.equal(diaAnterior("2026-10-22"), "2026-10-21");
});

test("diaAnterior cruza correctamente un cambio de mes", () => {
  assert.equal(diaAnterior("2026-03-01"), "2026-02-28");
});

test("diaAnterior cruza correctamente un cambio de año", () => {
  assert.equal(diaAnterior("2026-01-01"), "2025-12-31");
});

test("obtenerLunesDeLaSemana devuelve el lunes de la semana para un jueves", () => {
  // 22 de octubre de 2026 es jueves; el lunes de esa semana es el 19.
  const lunes = obtenerLunesDeLaSemana(new Date(2026, 9, 22));
  assert.equal(fechaATexto(lunes), "2026-10-19");
});

test("obtenerLunesDeLaSemana devuelve el lunes de la semana para un domingo", () => {
  // 25 de octubre de 2026 es domingo; sigue siendo la semana que empieza el 19.
  const lunes = obtenerLunesDeLaSemana(new Date(2026, 9, 25));
  assert.equal(fechaATexto(lunes), "2026-10-19");
});

test("obtenerLunesDeLaSemana siempre devuelve un lunes a 0-6 días del original", () => {
  const base = new Date(2026, 9, 19); // lunes de referencia
  for (let i = 0; i < 14; i++) {
    const fecha = new Date(base);
    fecha.setDate(fecha.getDate() + i);
    const lunes = obtenerLunesDeLaSemana(fecha);
    assert.equal(lunes.getDay(), 1, `getDay() debe ser 1 (lunes) para +${i} días`);
    const diferenciaDias = Math.round((fecha - lunes) / 86400000);
    assert.ok(
      diferenciaDias >= 0 && diferenciaDias <= 6,
      `la diferencia debe estar entre 0 y 6 días para +${i} días`
    );
  }
});
