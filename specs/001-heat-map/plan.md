# Plan 001 — Mapa de calor de estudio

Basado en `specs/001-heat-map/spec.md` y en `docs/constitution.md`. Este documento no contiene código: solo arquitectura, pseudocódigo y decisiones. Las 4 dudas marcadas `[NECESITA ACLARACIÓN]` en la spec siguen abiertas; donde este plan necesita un valor concreto para poder describirse, lo indica como **propuesta a confirmar**, no como decisión cerrada (Constitución #2: "si falta una decisión, se para y se pregunta").

## 1. Archivos que se crean o modifican

| Archivo | Tipo | Responsabilidad |
|---|---|---|
| `fechas.js` | **Nuevo** | Utilidades de fecha compartidas, en texto `"AAAA-MM-DD"` y hora local: convertir Date↔texto, sumar/restar días, calcular el lunes de una semana, y obtener "hoy". Sin DOM, sin `localStorage`. Se extraen aquí las funciones que hoy viven en `app.js` (`fechaATexto`, `textoAFecha`, `diaAnterior`, `obtenerLunesDeLaSemana`, `hoyEnTexto`) **sin cambiar su cuerpo**, solo su ubicación, para que `mapa-calor.js` y sus tests puedan usarlas sin arrastrar `app.js`. |
| `mapa-calor.js` | **Nuevo** | Toda la lógica pura del mapa de calor: agrupar sesiones por día, calcular niveles de color, detectar días futuros, construir la estructura de 52 semanas y formatear el texto del detalle. Cubre RF-2, RF-3, RF-4, RF-5 (datos), RF-6, RF-7, RF-8. Depende de las funciones de `fechas.js` (cargadas antes). Sin DOM, sin `localStorage`. |
| `fechas.test.js` | **Nuevo** | Tests con `node --test` de las utilidades de `fechas.js` (incluida `sumarDias`, nueva). Cierra el hueco de cobertura de tests que ya existía para estas funciones antes de esta feature. |
| `mapa-calor.test.js` | **Nuevo** | Tests con `node --test` de toda la lógica de `mapa-calor.js`: niveles de color, días futuros, construcción de las 52 semanas, formato del detalle. |
| `app.js` | **Modificado** | Se eliminan los cuerpos de las 5 funciones movidas a `fechas.js` (quedan como llamadas a funciones globales, sin cambiar ningún punto donde se usan). Se añade: referencias a los nuevos elementos del DOM (contenedor del mapa y detalle), una llamada a `construirDatosMapaCalor(sesiones, hoyEnTexto())` dentro de `mostrarTodo()`, y una nueva función `pintarMapaCalor(semanas)` que dibuja la rejilla y conecta la interacción (RF-1, RF-5, RF-6). |
| `index.html` | **Modificado** | Se añaden `<script src="fechas.js">` y `<script src="mapa-calor.js">` **antes** de `<script src="app.js">` (orden necesario: `app.js` los usa al cargar). Se añade el contenedor del mapa de calor y el elemento de detalle dentro de `<section class="seccion-racha">` (RF-1), después de `racha-datos`. |
| `styles.css` | **Modificado** | Reglas nuevas: contenedor con scroll horizontal (RNF-3), rejilla de semanas/días, 5 niveles de color + estado "futuro" (RF-4, RF-6), y el cuadro de detalle (RF-5). No se toca el CSS existente de racha/formulario/lista. |

No se crea ningún archivo de configuración, `package.json` ni carpeta `tests/`: los dos `*.test.js` quedan en la raíz del proyecto porque `node --test` los descubre automáticamente por ese patrón de nombre, sin argumentos ni configuración adicional (Constitución #1, #4).

## 2. Funciones puras necesarias (reciben "hoy" como parámetro)

En `fechas.js` (movidas desde `app.js`, mismo comportamiento):

- `fechaATexto(fecha)` — Date → `"AAAA-MM-DD"` local.
- `textoAFecha(texto)` — `"AAAA-MM-DD"` → Date local.
- `diaAnterior(texto)` — día anterior a una fecha en texto.
- `obtenerLunesDeLaSemana(fecha)` — lunes de la semana que contiene una fecha.
- `hoyEnTexto()` — única función no pura de este archivo: lee el reloj real para producir el "hoy" que todo lo demás recibe como parámetro (es la frontera entre el mundo real y la lógica pura, no un cálculo en sí).

Nueva en `fechas.js`:

- `sumarDias(texto, cantidad)` — suma (o resta, si `cantidad` es negativa) días a una fecha en texto. La necesita el algoritmo del mapa para saltar semanas hacia atrás y recorrer los 7 días de cada una. [RF-2, RF-8]

En `mapa-calor.js` (todas puras, sin DOM ni `localStorage`):

- `calcularMinutosPorDia(sesiones)` → `{ "AAAA-MM-DD": minutosTotales }`, sumando todas las sesiones de cada fecha. [RF-3]
- `obtenerTemasPorDia(sesiones)` → `{ "AAAA-MM-DD": [temas...] }`, en el mismo orden en que aparecen en `sesiones`. [RF-5]
- `calcularNivelColor(minutos)` → nivel 0 a 4 según los cortes de RF-4. [RF-4]
- `esDiaFuturo(fecha, hoy)` → compara `fecha > hoy` como texto (nunca como `Date`, igual que ya hace el resto de `app.js`). [RF-6]
- `construirDatosMapaCalor(sesiones, hoy)` → función principal: recibe las sesiones ya cargadas y "hoy", y devuelve las 52 semanas con el estado de cada día. Es la única función que `app.js` necesita llamar para obtener todos los datos del mapa. [RF-2, RF-3, RF-4, RF-6, RF-7, RF-8]
- `formatearDetalleDia(diaDatos)` → texto del detalle para un día (fecha completa + minutos + temas, o el mensaje de "sin estudio"). Recibe el objeto día que ya salió de `construirDatosMapaCalor`, no vuelve a tocar `sesiones` ni fechas. [RF-5]

## 3. Algoritmo del mapa de calor (pseudocódigo)

```
FUNCIÓN construirDatosMapaCalor(sesiones, hoy):
  minutosPorDia  = calcularMinutosPorDia(sesiones)        # RF-3
  temasPorDia    = obtenerTemasPorDia(sesiones)            # RF-5

  lunesSemanaActual = obtenerLunesDeLaSemana(hoy)
  lunesInicio       = sumarDias(lunesSemanaActual, -51 * 7)   # 52 columnas en total [RF-2]

  semanas = lista vacía
  PARA s DESDE 0 HASTA 51 HACER:
    lunesDeEstaSemana = sumarDias(lunesInicio, s * 7)
    dias = lista vacía
    PARA d DESDE 0 HASTA 6 HACER:                           # lunes(0) .. domingo(6)
      fecha = sumarDias(lunesDeEstaSemana, d)
      futuro = esDiaFuturo(fecha, hoy)                      # [RF-6]
      SI futuro:
        minutos = 0
        nivel   = NINGUNO          # no se colorea por nivel, se marca como futuro
        temas   = lista vacía      # RF-6: no se cuentan minutos de días futuros
      SINO:
        minutos = minutosPorDia[fecha] O 0
        nivel   = calcularNivelColor(minutos)               # [RF-4]
        temas   = temasPorDia[fecha] O lista vacía
      dias.agregar({ fecha, minutos, nivel, futuro, temas })
    semanas.agregar(dias)

  DEVOLVER semanas   # 52 listas de 7 días: [RF-2, RF-8 quedan cubiertos porque
                      # la última semana mezcla días pasados (coloreados) y futuros]
```

```
FUNCIÓN calcularNivelColor(minutos):                       # [RF-4]
  SI minutos = 0:            DEVOLVER 0
  SI minutos <= 30:          DEVOLVER 1
  SI minutos <= 60:          DEVOLVER 2
  SI minutos <= 120:         DEVOLVER 3
  SINO:                      DEVOLVER 4
```

```
FUNCIÓN esDiaFuturo(fecha, hoy):                            # [RF-6]
  DEVOLVER fecha > hoy   # comparación de texto "AAAA-MM-DD", nunca Date
```

Nota sobre el caso límite de "hoy": como `esDiaFuturo(hoy, hoy)` da `falso` (hoy no es *posterior* a hoy), el día de hoy siempre cae en la rama de "día pasado" del algoritmo y se colorea con sus minutos reales, aunque sean 0. Esto resuelve la ambigüedad de la spec sobre si "hoy" cuenta como "día pasado" para RF-4: en este plan, sí cuenta.

## 4. Cómo se pinta en la interfaz

**Ubicación (RF-1):** dentro de `<section class="seccion-racha">`, debajo del bloque `racha-datos` (minutos de la semana / días del mes), sin tocar el sello de racha existente. Un contenedor con scroll horizontal envuelve la rejilla, para que las 52 columnas no desborden la tarjeta en móvil (RNF-3).

**Estructura del contenido (descrita, no es código):**
- Un contenedor con scroll horizontal, que a su vez contiene una fila de 52 bloques de "semana".
- Cada bloque de semana contiene 7 celdas de "día", en el mismo orden que devuelve `construirDatosMapaCalor` (lunes arriba, domingo abajo — **propuesta a confirmar**, ya que la spec no fija el orden de filas).
- Cada celda lleva una clase según su `nivel` (0 a 4) o una clase `futuro` si `dia.futuro` es verdadero (RF-6), más la fecha guardada como atributo de datos para poder identificarla al interactuar.
- Un único elemento de "detalle" (tooltip), fuera de la rejilla, oculto por defecto, compartido por las 364 celdas.

**Pintado (`pintarMapaCalor(semanas)` en `app.js`):**
1. Vacía el contenedor de la rejilla.
2. Por cada semana y cada día de `semanas`, crea la celda, le pone la clase de nivel o `futuro`, y guarda sus datos (fecha, minutos, temas) para la interacción.
3. Al terminar de pintar, desplaza el contenedor con scroll horizontal hasta el extremo derecho, para que el usuario vea primero el presente en vez de hace un año (**propuesta a confirmar** — resuelve la duda abierta de la spec sobre la posición inicial del scroll).

**Interacción (RF-5):**
- En escritorio: al entrar el cursor en una celda (`mouseenter`), se rellena el detalle con `formatearDetalleDia(dia)` y se muestra junto a la celda; al salir (`mouseleave`), se oculta.
- En móvil/táctil: un toque (`click`, que también se dispara al tocar) alterna mostrar/ocultar el detalle de esa celda; tocar otra celda cambia el detalle a la nueva; tocar la misma celda otra vez lo cierra.
- El texto del detalle para un día sin sesiones es el mensaje de "sin estudio" que ya arma `formatearDetalleDia`; para un día futuro, el detalle indica que ese día aún no llega (sin mostrar minutos ni temas, aunque existiera una sesión guardada con esa fecha futura — RF-6).
- Si un día tiene más de 4 temas distintos, el detalle muestra los primeros 4 y añade "+N más" (**propuesta a confirmar** — resuelve la duda abierta sobre truncar temas largos; evita que el cuadro de detalle desborde en pantallas pequeñas, RNF-3).

**Actualización en vivo:** `construirDatosMapaCalor` y `pintarMapaCalor` se llaman dentro de `mostrarTodo()`, igual que ya se hace con racha/semana/mes, así que el mapa se recalcula también justo después de guardar una sesión nueva, no solo al cargar la página.

**Estilos (`styles.css`):** clases de nivel con colores de intensidad creciente, una clase `futuro` claramente distinta (más tenue/con patrón, no solo "vacío"), el contenedor de scroll con `overflow-x`, y el cuadro de detalle posicionado sin tapar la celda. El color nunca es la única pista: el detalle textual siempre está disponible (RNF-4).

## 5. Decisiones técnicas justificadas

1. **Exportación condicional tipo CommonJS** (`if (typeof module !== "undefined") module.exports = {...}`) en `fechas.js` y `mapa-calor.js`, en vez de `import`/`export` de módulos ES.
   *Por qué:* permite cargar los archivos como `<script>` normal en `index.html` (abre con doble clic) y a la vez usarlos con `require()` desde `node --test`, sin servidor ni build.
   *Alternativa descartada:* módulos ES (`type="module"`) — prohibidos explícitamente por `CLAUDE.md` y poco fiables al abrir `index.html` como `file://` en algunos navegadores.

2. **Extraer las funciones de fecha compartidas a `fechas.js`** en vez de duplicarlas dentro de `mapa-calor.js`.
   *Por qué:* la Constitución #3 exige que los cálculos de fechas sean funciones puras y probadas; duplicar la lógica de fechas en dos archivos arriesga que uno se corrija y el otro no, lo que podría romper la racha o el mapa de forma distinta ante el mismo dato.
   *Alternativa descartada:* copiar `fechaATexto`/`diaAnterior`/etc. dentro de `mapa-calor.js` sin tocar `app.js` — más rápido de escribir, pero dos implementaciones del mismo cálculo violan "los datos del usuario son sagrados" (Constitución #5) si alguna vez divergen.

3. **Comparar fechas como texto `"AAAA-MM-DD"`** (`fecha > hoy`) para detectar días futuros, igual que ya hace `app.js` para semana y mes.
   *Por qué:* es coherente con el resto del código y evita el problema de huso horario de convertir a `Date` (CLAUDE.md: nunca `new Date("AAAA-MM-DD")`).
   *Alternativa descartada:* convertir ambas fechas a `Date` y comparar con `getTime()` — descartado por el riesgo de desfase UTC ya documentado como error típico en este proyecto.

4. **Niveles de color como clases CSS** (`nivel-0` … `nivel-4`, `futuro`) en vez de colores calculados e inyectados por JS.
   *Por qño:* mantiene el color en CSS, separado del cálculo (Constitución #1 y #3); ajustar la paleta no requiere tocar lógica.
   *Alternativa descartada:* calcular un color RGB/HSL en JavaScript y asignarlo como estilo en línea — añade complejidad a la lógica pura sin necesidad.

5. **Un único elemento de detalle compartido** para las 364 celdas, actualizado en cada interacción, en vez de un tooltip propio por celda.
   *Por qué:* simplicidad (Constitución #1) y menos nodos en el DOM.
   *Alternativa descartada:* un tooltip individual por celda — 364 elementos adicionales sin ningún beneficio funcional.

6. **El mapa se recalcula dentro de `mostrarTodo()`** (se repinta tras cada sesión guardada), en vez de calcularse una sola vez al cargar la página.
   *Por qué:* evita que el mapa quede desactualizado frente a racha/semana/mes, que sí se refrescan al guardar.
   *Alternativa descartada:* calcular el mapa solo en la carga inicial — más simple, pero dejaría el mapa "atrasado" un recargo de página, inconsistente con el resto de la tarjeta.

7. **Interacción híbrida `mouseenter`/`mouseleave` (escritorio) + `click` (alterna, sirve también para toque)**, en vez de manejar eventos táctiles por separado.
   *Por qué:* `click` ya se dispara de forma fiable al tocar en navegadores móviles, cubriendo RF-5 sin duplicar lógica de interacción para cada tipo de dispositivo.
   *Alternativa descartada:* usar `touchstart`/`touchend` explícitos además de los eventos de ratón — más código para el mismo resultado.

8. **El código nuevo mantiene nombres de función y variable en español** (`calcularNivelColor`, `esDiaFuturo`, etc.), igual que el resto de `app.js` actual.
   *Por qué:* consistencia con el código ya existente en el proyecto.
   *Tensión con la constitución:* la Constitución #6 pide "código en inglés; interfaz y documentación en español", y el código base ya existente (`app.js`) no lo cumple. Este plan no corrige esa desviación heredada (sería reescribir código que ya funciona, fuera del alcance de esta feature); queda como punto a decidir aparte, no como parte de este plan.

## 6. Estrategia de tests (`node --test`)

Los dos archivos de test se descubren automáticamente por nombre (`*.test.js`), sin configuración.

**`fechas.test.js`:**
- `sumarDias`: suma positiva, resta (negativo), cruce de mes, cruce de año, cruce de año bisiesto. [RF-2, RF-8]
- `fechaATexto` / `textoAFecha` / `diaAnterior` / `obtenerLunesDeLaSemana`: casos ya implícitos en el comportamiento actual de la app (se trasladan, no se reinventan); sirven de red de seguridad para el movimiento de archivo.

**`mapa-calor.test.js`:**
- `calcularNivelColor`: límites exactos 0, 1, 30, 31, 60, 61, 120, 121 minutos → niveles 0/1/1/2/2/3/3/4. [RF-4]
- `esDiaFuturo`: fecha anterior, igual y posterior a "hoy". [RF-6]
- `calcularMinutosPorDia` / `obtenerTemasPorDia`: varias sesiones el mismo día (se suman minutos, se listan todos los temas); día sin sesiones (no aparece en el resultado). [RF-3, RF-5]
- `construirDatosMapaCalor(sesiones, hoy)`:
  - Devuelve exactamente 52 semanas de 7 días (364 días en total). [RF-2]
  - El último día de la última semana es exactamente "hoy". [RF-2]
  - Sin ninguna sesión: todos los días pasados quedan en nivel 0, ninguno marcado como futuro salvo los posteriores a "hoy". [Caso límite: usuario sin sesiones]
  - Con una sesión de fecha posterior a "hoy": ese día se marca `futuro = verdadero` y sus minutos no se cuentan, aunque exista la sesión. [RF-6, caso límite: sesión con fecha futura]
  - "Hoy" es lunes: los seis días siguientes de esa semana quedan marcados como futuros; los días anteriores de otras semanas no se ven afectados. [Caso límite: hoy es lunes]
  - "Hoy" es domingo: ningún día de la semana actual queda marcado como futuro. [Caso límite simétrico, detectado en la revisión QA]
  - El rango cruza fin de año (ej. "hoy" en enero, la semana 52 cae en diciembre del año anterior): las 52 semanas se calculan sin errores de fecha. [Caso límite: cambio de año]
- `formatearDetalleDia`: día con una sesión, día con varias sesiones y temas distintos, día sin sesiones, día futuro. [RF-5, RF-6]

Si algún test falla, no se avanza con la implementación (Constitución #4: "prohibido avanzar con tests en rojo").

## 7. Cobertura de requisitos funcionales

| RF | Dónde se cubre en este plan |
|---|---|
| RF-1 (ubicación) | Sección 4, "Ubicación"; `index.html` modificado |
| RF-2 (rango de 52 semanas) | `construirDatosMapaCalor`, pseudocódigo sección 3 |
| RF-3 (suma de minutos por día) | `calcularMinutosPorDia` |
| RF-4 (niveles fijos de color) | `calcularNivelColor` |
| RF-5 (detalle al interactuar) | `obtenerTemasPorDia`, `formatearDetalleDia`, sección 4 "Interacción" |
| RF-6 (días futuros diferenciados) | `esDiaFuturo`, rama `futuro` del pseudocódigo, clase CSS `futuro` |
| RF-7 (reutiliza datos existentes) | `construirDatosMapaCalor` recibe `sesiones` ya cargadas por `cargarSesiones()`; no se toca el formato guardado |
| RF-8 (semana actual incompleta) | Pseudocódigo sección 3 (la última semana mezcla días pasados y futuros de forma natural) |

## 8. Pendientes heredados de la spec (no resueltos, solo acotados aquí)

Estas 4 dudas siguen marcadas `[NECESITA ACLARACIÓN]` en `specs/001-heat-map/spec.md`. Este plan propuso un valor concreto para poder describirse, pero deben confirmarse antes de implementar (Constitución #2):

1. Umbrales exactos de `calcularNivelColor` (se mantuvo el ejemplo de la spec: 30/60/120).
2. Posición inicial del scroll (se propuso: extremo derecho, mostrando "hoy").
3. Truncado de temas en el detalle (se propuso: máximo 4 + "+N más").
4. Si la tarjeta "cuaderno" de racha necesita rediseño visual para caber el mapa (se propuso: añadirlo debajo de `racha-datos` sin tocar el sello existente, pero el aspecto final no se decide en este plan).
