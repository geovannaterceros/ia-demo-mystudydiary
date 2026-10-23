// Utilidades de fecha compartidas. Siempre en hora local, nunca UTC
// (nunca toISOString() ni new Date("AAAA-MM-DD")).
// Movidas desde app.js sin cambiar su lógica, para poder probarlas con
// `node --test` y para que las use también mapa-calor.js.

// Convierte un objeto Date en texto "AAAA-MM-DD" usando la fecha local
function fechaATexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

// Convierte un texto "AAAA-MM-DD" en un objeto Date local
function textoAFecha(texto) {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

// Devuelve la fecha de hoy como "AAAA-MM-DD"
function hoyEnTexto() {
  return fechaATexto(new Date());
}

// Devuelve el día anterior a una fecha en texto
function diaAnterior(texto) {
  const fecha = textoAFecha(texto);
  fecha.setDate(fecha.getDate() - 1);
  return fechaATexto(fecha);
}

// Devuelve el lunes (hora local) de la semana que contiene la fecha dada
function obtenerLunesDeLaSemana(fecha) {
  const copia = new Date(fecha);
  const diaSemana = copia.getDay(); // 0 = domingo ... 6 = sábado
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  copia.setDate(copia.getDate() - diasDesdeLunes);
  return copia;
}

// Exportación condicional: en el navegador (<script> normal) "module" no
// existe y este bloque no hace nada; en Node (node --test) expone las
// funciones para poder probarlas con require().
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fechaATexto,
    textoAFecha,
    hoyEnTexto,
    diaAnterior,
    obtenerLunesDeLaSemana,
  };
}
