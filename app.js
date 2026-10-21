// Clave con la que guardamos las sesiones en localStorage
const CLAVE_GUARDADO = "diario-estudio-sesiones";

// Elementos de la página que vamos a usar
const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const textoError = document.getElementById("error");
const lista = document.getElementById("lista");
const mensajeVacio = document.getElementById("vacio");
const rachaDias = document.getElementById("racha-dias");
const rachaTexto = document.getElementById("racha-texto");
const semanaMinutos = document.getElementById("semana-minutos");
const mesDias = document.getElementById("mes-dias");

// Lista de sesiones. Cada sesión es: { id, fecha: "AAAA-MM-DD", tema, minutos }
let sesiones = cargarSesiones();

// ---------- Fechas (siempre en hora local, nunca UTC) ----------

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

// Muestra la fecha de forma bonita, por ejemplo: "jueves, 9 de octubre de 2026"
function fechaBonita(texto) {
  return textoAFecha(texto).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------- Guardar y cargar ----------

function cargarSesiones() {
  const guardado = localStorage.getItem(CLAVE_GUARDADO);
  if (!guardado) {
    return [];
  }
  try {
    return JSON.parse(guardado);
  } catch (error) {
    // Si los datos están dañados, empezamos de cero
    return [];
  }
}

function guardarSesiones() {
  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(sesiones));
}

// ---------- Racha ----------

function calcularRacha() {
  // Guardamos los días que tienen al menos una sesión
  const diasConSesion = new Set();
  sesiones.forEach(function (sesion) {
    diasConSesion.add(sesion.fecha);
  });

  // Empezamos a contar desde hoy. Si hoy aún no hay sesión,
  // empezamos desde ayer: la racha sigue viva hasta que termine el día.
  let dia = hoyEnTexto();
  if (!diasConSesion.has(dia)) {
    dia = diaAnterior(dia);
  }

  // Contamos hacia atrás mientras haya días seguidos con sesión
  let racha = 0;
  while (diasConSesion.has(dia)) {
    racha = racha + 1;
    dia = diaAnterior(dia);
  }
  return racha;
}

// ---------- Minutos de esta semana ----------

// Devuelve el lunes (hora local) de la semana que contiene la fecha dada
function obtenerLunesDeLaSemana(fecha) {
  const copia = new Date(fecha);
  const diaSemana = copia.getDay(); // 0 = domingo ... 6 = sábado
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  copia.setDate(copia.getDate() - diasDesdeLunes);
  return copia;
}

function calcularMinutosSemana() {
  const hoy = hoyEnTexto();
  const lunes = fechaATexto(obtenerLunesDeLaSemana(new Date()));

  let total = 0;
  sesiones.forEach(function (sesion) {
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto
    if (sesion.fecha >= lunes && sesion.fecha <= hoy) {
      total = total + sesion.minutos;
    }
  });
  return total;
}

// ---------- Días estudiados este mes ----------

function calcularDiasEstudiadosEsteMes() {
  const hoy = hoyEnTexto();
  const inicioMes = hoy.slice(0, 7) + "-01"; // primer día del mes actual

  const diasUnicos = new Set();
  sesiones.forEach(function (sesion) {
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto
    if (sesion.fecha >= inicioMes && sesion.fecha <= hoy) {
      diasUnicos.add(sesion.fecha);
    }
  });
  return diasUnicos.size;
}

// ---------- Pintar en pantalla ----------

function mostrarRacha() {
  const racha = calcularRacha();
  rachaDias.textContent = racha;
  rachaTexto.textContent = racha === 1 ? "día seguido" : "días seguidos";
}

function mostrarMinutosSemana() {
  const minutos = calcularMinutosSemana();
  semanaMinutos.textContent = minutos + " min";
}

function mostrarDiasMes() {
  const dias = calcularDiasEstudiadosEsteMes();
  mesDias.textContent = dias + (dias === 1 ? " día" : " días");
}

function mostrarLista() {
  // Ordenamos de la más reciente a la más antigua.
  // Si dos sesiones tienen la misma fecha, va primero la última creada.
  const ordenadas = sesiones.slice().sort(function (a, b) {
    if (a.fecha !== b.fecha) {
      return a.fecha < b.fecha ? 1 : -1;
    }
    return b.id - a.id;
  });

  lista.innerHTML = "";
  mensajeVacio.hidden = ordenadas.length > 0;

  ordenadas.forEach(function (sesion) {
    const elemento = document.createElement("li");
    elemento.className = "sesion";

    const linea = document.createElement("div");
    linea.className = "sesion-linea";

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;
    tema.title = sesion.tema; // texto completo si el nombre no cabe

    const puntos = document.createElement("span");
    puntos.className = "sesion-puntos";
    puntos.setAttribute("aria-hidden", "true");

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = sesion.minutos + " min";

    linea.appendChild(tema);
    linea.appendChild(puntos);
    linea.appendChild(minutos);

    const fecha = document.createElement("p");
    fecha.className = "sesion-fecha";
    fecha.textContent = fechaBonita(sesion.fecha);

    elemento.appendChild(linea);
    elemento.appendChild(fecha);
    lista.appendChild(elemento);
  });
}

function mostrarTodo() {
  mostrarRacha();
  mostrarMinutosSemana();
  mostrarDiasMes();
  mostrarLista();
}

// ---------- Formulario ----------

formulario.addEventListener("submit", function (evento) {
  // Evita que la página se recargue al enviar
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // Validaciones
  if (!fecha) {
    textoError.textContent = "Elige una fecha.";
    return;
  }
  if (tema === "") {
    textoError.textContent = "Escribe el tema que has estudiado.";
    return;
  }
  if (!Number.isInteger(minutos) || minutos <= 0) {
    textoError.textContent = "Los minutos deben ser un número entero mayor que 0.";
    return;
  }

  textoError.textContent = "";

  sesiones.push({
    id: Date.now(),
    fecha: fecha,
    tema: tema,
    minutos: minutos,
  });

  guardarSesiones();
  mostrarTodo();

  // Limpiamos el formulario y volvemos a poner la fecha de hoy
  formulario.reset();
  campoFecha.value = hoyEnTexto();
});

// ---------- Inicio ----------

campoFecha.value = hoyEnTexto();
mostrarTodo();
