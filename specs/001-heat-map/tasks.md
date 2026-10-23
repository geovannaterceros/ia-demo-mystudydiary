# Tareas 001 — Mapa de calor de estudio

Basado en `specs/001-heat-map/spec.md` y `specs/001-heat-map/plan.md`. Orden de dependencia: primero las utilidades de fecha compartidas, luego la lógica pura del mapa, luego el marcado/estilos, y al final la conexión con `app.js` y la verificación. No empezar una tarea de un grupo posterior sin que las anteriores tengan sus tests en verde (Constitución #4).

## Grupo A — Utilidades de fecha compartidas (`fechas.js`)

- [x] **T1 — Crear `fechas.js` con las funciones movidas desde `app.js`**
  Mueve `fechaATexto`, `textoAFecha`, `diaAnterior`, `obtenerLunesDeLaSemana` y `hoyEnTexto` a un nuevo archivo `fechas.js`, sin cambiar su lógica interna, con exportación condicional (`module.exports` solo si existe `module`).
  RF: ninguno directo (infraestructura para RF-2, RF-6, RF-8).
  **Hecho cuando:** `fechas.js` existe con las 5 funciones y, al hacer `require("./fechas.js")` desde Node, no lanza ningún error.

- [ ] **T2 — Quitar esas funciones de `app.js` y cargar `fechas.js` antes**
  Elimina los cuerpos de esas 5 funciones de `app.js` (las llamadas existentes se quedan igual) y añade `<script src="fechas.js">` justo antes de `<script src="app.js">` en `index.html`.
  RF: ninguno directo (no debe cambiar ningún comportamiento existente).
  **Hecho cuando:** al abrir `index.html` con doble clic, la racha, los minutos de la semana, los días del mes y la lista de sesiones funcionan exactamente igual que antes, sin errores en la consola.

- [ ] **T3 — Añadir `sumarDias(fecha, cantidad)` a `fechas.js`**
  Función pura que suma (o resta, si `cantidad` es negativa) días a una fecha en texto `"AAAA-MM-DD"`.
  RF: RF-2, RF-8 (la necesita el algoritmo del mapa para saltar semanas y días).
  **Hecho cuando:** la función está definida y exportada igual que las demás de `fechas.js`.

- [ ] **T4 — Tests de `fechas.js`**
  Crea `fechas.test.js` con casos para `sumarDias` (suma, resta, cruce de mes, cruce de año) y casos básicos de regresión para las funciones movidas en T1.
  RF: RF-2, RF-8.
  **Hecho cuando:** `node --test fechas.test.js` pasa en verde.

## Grupo B — Lógica pura del mapa de calor (`mapa-calor.js`)

- [ ] **T5 — Crear el esqueleto de `mapa-calor.js` y `mapa-calor.test.js`**
  Archivo nuevo con exportación condicional (igual patrón que `fechas.js`) y su archivo de test, ambos vacíos de lógica todavía.
  RF: ninguno directo (infraestructura).
  **Hecho cuando:** `require("./mapa-calor.js")` funciona desde Node sin error y `node --test mapa-calor.test.js` corre (aunque sin tests todavía) sin fallos.

- [ ] **T6 — Implementar `calcularMinutosPorDia(sesiones)` + tests**
  Suma los minutos de todas las sesiones de cada fecha.
  RF: RF-3.
  **Hecho cuando:** tests cubren un día con una sesión, un día con varias sesiones (minutos sumados) y un día sin sesiones (no aparece en el resultado), y todos pasan en verde.

- [ ] **T7 — Implementar `obtenerTemasPorDia(sesiones)` + tests**
  Agrupa los temas de las sesiones por fecha, en el orden en que aparecen en `sesiones`.
  RF: RF-5 (datos para el detalle).
  **Hecho cuando:** tests cubren un día con un tema, un día con varios temas distintos y un día sin sesiones, y todos pasan en verde.

- [ ] **T8 — Implementar `calcularNivelColor(minutos)` + tests de límites**
  Devuelve el nivel 0 a 4 según los cortes de RF-4 (0, 1-30, 31-60, 61-120, 120+).
  RF: RF-4.
  **Hecho cuando:** hay un test por cada valor límite (0, 1, 30, 31, 60, 61, 120, 121 minutos) con el nivel esperado, y todos pasan en verde.

- [ ] **T9 — Implementar `esDiaFuturo(fecha, hoy)` + tests**
  Compara `fecha > hoy` como texto `"AAAA-MM-DD"` (nunca con `Date`).
  RF: RF-6.
  **Hecho cuando:** hay tests para fecha anterior, igual y posterior a "hoy", y todos pasan en verde.

- [ ] **T10 — Implementar `construirDatosMapaCalor(sesiones, hoy)` + tests**
  Función principal: combina T6–T9 y las utilidades de `fechas.js` para devolver las 52 semanas de 7 días con `{ fecha, minutos, nivel, futuro, temas }` cada uno.
  RF: RF-2, RF-3, RF-4, RF-6, RF-7, RF-8.
  **Hecho cuando:** los tests cubren: exactamente 52 semanas de 7 días (364 en total); el último día es "hoy"; sin sesiones todo queda en nivel 0 salvo los días futuros; una sesión con fecha futura no suma minutos y ese día queda marcado `futuro`; "hoy" es lunes (resto de la semana futuro); "hoy" es domingo (ningún día futuro esa semana); el rango cruza fin de año sin errores; y todos pasan en verde.

- [ ] **T11 — Implementar `formatearDetalleDia(diaDatos)` + tests**
  Arma el texto del detalle de un día (fecha completa, minutos y temas, o el mensaje de "sin estudio"); si hay más de 4 temas distintos, muestra los primeros 4 y añade "+N más".
  RF: RF-5, RF-6.
  **Hecho cuando:** hay tests para un día con una sesión, un día con varias sesiones y varios temas, un día con más de 4 temas (verifica el truncado), un día sin sesiones y un día futuro, y todos pasan en verde.

## Grupo C — Estructura visual (HTML/CSS)

- [ ] **T12 — Añadir el marcado del mapa en `index.html`**
  Dentro de `<section class="seccion-racha">`, después de `racha-datos`: un contenedor con scroll horizontal vacío para la rejilla, y un elemento de detalle oculto por defecto.
  RF: RF-1.
  **Hecho cuando:** el marcado nuevo existe en el HTML (vacío y oculto) y el resto de la página se ve y funciona igual que antes, sin errores en consola.

- [ ] **T13 — Estilos de la rejilla y los niveles de color**
  En `styles.css`: clases para la rejilla de semanas/días, los 5 niveles de color (0 a 4) y el estado `futuro`, y el contenedor con scroll horizontal.
  RF: RF-4, RF-6 (y RNF-3).
  **Hecho cuando:** aplicando a mano las clases de nivel y `futuro` a un par de celdas de prueba en Chrome DevTools, se distinguen claramente los 5 tonos y el estado futuro, y el contenedor permite scroll horizontal en una vista de móvil (~360px).

- [ ] **T14 — Estilos del cuadro de detalle**
  En `styles.css`: posición, apariencia y estados visible/oculto del cuadro de detalle.
  RF: RF-5 (y RNF-4).
  **Hecho cuando:** alternando a mano el estado oculto/visible del detalle en Chrome DevTools, se ve bien posicionado junto a una celda de prueba, sin tapar el contenido ni desbordar la pantalla.

## Grupo D — Conexión con `app.js`

- [ ] **T15 — Implementar `pintarMapaCalor(semanas)` en `app.js`**
  Pinta las 52×7 celdas en la rejilla creada en T12, con la clase de nivel o `futuro` de cada una (sin interacción todavía).
  RF: RF-1, RF-4, RF-6.
  **Hecho cuando:** al abrir `index.html` en el navegador con datos reales de `localStorage`, se ven 364 celdas coloreadas según corresponda, verificado con Chrome DevTools (sin errores en consola).

- [ ] **T16 — Llamar al mapa desde `mostrarTodo()`**
  Dentro de `mostrarTodo()`, llamar a `construirDatosMapaCalor(sesiones, hoyEnTexto())` y luego a `pintarMapaCalor(...)`.
  RF: RF-2, RF-3, RF-7, RF-8.
  **Hecho cuando:** al guardar una sesión nueva desde el formulario, el mapa se repinta reflejando esa sesión sin recargar la página.

- [ ] **T17 — Conectar la interacción de las celdas**
  `mouseenter`/`mouseleave` en escritorio y `click` (alterna, también sirve al tocar) para mostrar/ocultar el detalle de cada celda usando `formatearDetalleDia`.
  RF: RF-5.
  **Hecho cuando:** pasar el cursor por una celda en vista de escritorio muestra el detalle correcto y lo oculta al salir; tocar una celda en la vista de móvil de Chrome DevTools la muestra, y tocarla de nuevo la oculta.

- [ ] **T18 — Posición inicial del scroll**
  Tras pintar, desplazar el contenedor con scroll horizontal hasta el extremo derecho para mostrar "hoy" por defecto.
  RF: RNF-3 (relacionado con RF-2).
  **Hecho cuando:** al cargar la página, el mapa aparece ya desplazado mostrando la columna de "hoy", sin que el usuario tenga que desplazarse manualmente.

## Grupo E — Verificación y cierre

- [ ] **T19 — Verificación completa**
  Ejecutar `node --test` en todo el proyecto y verificar manualmente con el MCP de Chrome DevTools según la sección "Verificación" de `CLAUDE.md` (funcionalidad, consola, vista móvil).
  RF: todos (RF-1 a RF-8).
  **Hecho cuando:** todos los tests pasan en verde, la consola no muestra errores, y el mapa se ve y funciona correctamente tanto en vista de escritorio como de móvil.

- [ ] **T20 — Actualizar `MEMORY.md`**
  Registrar el estado final del mapa de calor implementado y cualquier decisión revisada durante la implementación (por ejemplo, si alguna de las 4 "propuestas a confirmar" del plan cambió).
  RF: ninguno directo.
  **Hecho cuando:** `MEMORY.md` refleja el estado actual del mapa de calor y sigue dentro del límite de ~50 líneas.
