# Spec 001 — Mapa de calor de estudio

## Contexto y objetivo

El Diario de Estudio ya muestra la racha actual, los minutos estudiados esta semana y los días estudiados este mes dentro de una tarjeta de racha. Esto da una foto del presente, pero no deja ver de un vistazo la constancia a lo largo del tiempo.

El objetivo de esta funcionalidad es añadir un mapa de calor (estilo GitHub) que muestre, para cada día de las últimas 52 semanas, cuánto se estudió ese día mediante la intensidad de un color. Así el usuario puede identificar patrones, rachas pasadas y huecos de inactividad sin tener que revisar la lista de sesiones una por una.

## Usuarios

- La misma persona que ya usa el diario para registrar sus propias sesiones de estudio. Es una aplicación de un único usuario, sin cuentas ni datos compartidos.

## Historias de usuario

- Como usuario del diario, quiero ver un mapa de calor del último año de estudio para identificar de un vistazo mis rachas y mis periodos de baja actividad.
- Como usuario, quiero que el color de cada día refleje cuánto estudié ese día, para poder comparar visualmente días intensos con días flojos.
- Como usuario, quiero ver el detalle (minutos y temas) de un día concreto pasando el cursor o tocando su celda, para recordar qué estudié sin tener que buscar en la lista de sesiones.
- Como usuario, quiero distinguir claramente los días futuros de los días pasados en los que no estudié, para no confundir "todavía no ha llegado" con "no estudié".

## Requisitos funcionales

### RF-1 — Ubicación del mapa de calor
El sistema debe mostrar el mapa de calor dentro de la tarjeta de racha existente, junto a la racha actual, los minutos de la semana y los días del mes.

- Cuando el usuario abra el diario, el sistema debe mostrar el mapa de calor dentro de la tarjeta de racha, junto a los demás datos de resumen.

### RF-2 — Rango de fechas mostrado
El sistema debe mostrar siempre las 52 semanas más recientes (lunes a domingo), terminando en la semana que contiene el día de hoy.

- El sistema debe mostrar siempre 52 columnas, cada una representando una semana de lunes a domingo, siendo la última columna la semana que contiene la fecha de hoy.
- Las columnas deben usar la misma convención de semana (lunes a domingo) que ya se usa para calcular los minutos de la semana actual.

### RF-3 — Minutos totales por día
Cuando un día tenga una o varias sesiones registradas, el sistema debe sumar los minutos de todas ellas para determinar la intensidad de color de ese día (coherente con la regla ya existente de que varias sesiones el mismo día cuentan como un solo día).

### RF-4 — Niveles de color fijos
El sistema debe asignar a cada día pasado uno de estos niveles de intensidad según sus minutos totales, con los mismos umbrales para cualquier usuario:

- Sin sesión: 0 minutos.
- Nivel 1: de 1 a 30 minutos.
- Nivel 2: de 31 a 60 minutos.
- Nivel 3: de 61 a 120 minutos.
- Nivel 4: más de 120 minutos.

[NECESITA ACLARACIÓN: estos cortes son un ejemplo ilustrativo aceptado como punto de partida; confirmar o ajustar los valores exactos antes de implementar.]

### RF-5 — Detalle al pasar el cursor o tocar un día
Cuando el usuario pase el cursor (o toque, en móvil) sobre un día del mapa de calor, el sistema debe mostrar la fecha completa, el total de minutos estudiados ese día y los temas de las sesiones de ese día.

- Si el día no tiene sesiones registradas, el sistema debe mostrar un detalle indicando que no hubo estudio ese día (sin minutos ni temas).
- Si el día tiene varias sesiones con temas distintos, el sistema debe listar todos los temas de ese día en el detalle.

### RF-6 — Días futuros diferenciados
Si un día del mapa de calor es posterior al día de hoy, el sistema debe mostrarlo con una apariencia visualmente distinta (más tenue o deshabilitada) a la de un día pasado sin sesión, para no confundir ambos casos.

- El sistema no debe sumar minutos de días futuros al nivel de color, igual que ya ocurre con la racha, la semana y el mes.

### RF-7 — Reutilización de los datos existentes
El sistema debe calcular el mapa de calor a partir de las sesiones ya guardadas en `localStorage` bajo la clave `diario-estudio-sesiones`, sin requerir ni crear un nuevo formato de datos.

### RF-8 — Semana actual incompleta
Cuando la semana actual esté incompleta (todavía no haya llegado el domingo), el sistema debe mostrar igualmente esa columna: los días ya transcurridos coloreados según sus minutos, y los días restantes de esa misma semana marcados como futuros (RF-6).

## Requisitos no funcionales

- RNF-1: Debe seguir funcionando abriendo `index.html` con doble clic, sin servidor, módulos ES ni dependencias nuevas.
- RNF-2: El cálculo de minutos por día y de niveles de intensidad debe implementarse como función(es) pura(s) que reciban las sesiones y la fecha de "hoy" como parámetros, sin acceder al DOM ni a `localStorage` directamente.
- RNF-3: El mapa de calor debe ser usable en pantallas de móvil (anchos típicos desde ~360px), permitiendo desplazamiento horizontal dentro del propio mapa sin romper el resto del diseño de la página.
- RNF-4: El color no debe ser la única forma de transmitir la información: el detalle textual de cada día (fecha, minutos, temas) debe estar siempre disponible, no solo deducible por el tono del color.
- RNF-5: Los textos del mapa de calor (detalle, mensajes de días sin sesión, etc.) deben estar en español, igual que el resto de la interfaz.

## Casos límite

- Usuario sin ninguna sesión guardada: todo el mapa aparece como "sin sesión", excepto los días futuros dentro del rango, que se marcan como tales.
- Varias sesiones el mismo día con temas distintos: se suman los minutos de todas y se listan todos los temas en el detalle de ese día.
- El rango de 52 semanas cruza un cambio de año (por ejemplo, de diciembre a enero): las fechas deben calcularse correctamente sin errores, usando siempre fecha local.
- Hoy es lunes: la columna de la semana actual solo tiene un día pasado (hoy); el resto de días de esa semana (martes a domingo) se muestran como futuros.
- Existe una sesión guardada con una fecha futura (el formulario actual no impide elegir una fecha posterior a hoy): ese día debe tratarse igual que cualquier día futuro en el mapa de calor (RF-6), ignorando sus minutos para el nivel de color.
- Datos corruptos en `localStorage`: se mantiene el comportamiento ya existente (se ignoran y se parte de una lista vacía); el mapa de calor se muestra vacío en ese caso.
- Pantalla muy estrecha: el mapa debe seguir siendo usable mediante desplazamiento horizontal, sin desbordar ni romper el resto del diseño de la tarjeta de racha.

## Fuera de alcance

- Exportar o compartir el mapa de calor como imagen.
- Filtrar el mapa de calor por tema de estudio.
- Permitir que el usuario configure el rango de semanas mostrado o navegue a años anteriores.
- Cambiar la definición ya existente de racha, semana o mes.
- Click en un día para navegar o filtrar la lista de sesiones por esa fecha.
- Animaciones de transición avanzadas al cargar o actualizar el mapa.

## Criterios de finalización

- El mapa de calor se muestra dentro de la tarjeta de racha, con 52 columnas semanales (lunes a domingo) terminando en la semana de hoy.
- Cada día pasado muestra el nivel de color correspondiente a la suma de minutos de sus sesiones, según los niveles de RF-4.
- Pasar el cursor o tocar cualquier día muestra su fecha, minutos totales y temas (o la indicación de que no hubo estudio).
- Los días futuros se distinguen visualmente de los días pasados sin sesión.
- La función o funciones que calculan los datos del mapa de calor son puras (reciben sesiones y "hoy" como parámetros) y tienen tests con `node --test`.
- El diario sigue funcionando abriendo `index.html` con doble clic, sin dependencias nuevas, y ninguna sesión guardada se pierde ni cambia de formato.
- Se ve bien en una vista de móvil (~360px de ancho) y no rompe el resto de la página.
- Verificado manualmente con el MCP de Chrome DevTools: funcionalidad, consola sin errores y vista móvil.

## Dudas abiertas

- [NECESITA ACLARACIÓN] Los umbrales exactos de minutos de cada nivel de color (RF-4) se tomaron como ejemplo ilustrativo durante la definición de esta spec; deben confirmarse o ajustarse antes de implementar.
- [NECESITA ACLARACIÓN] Al cargar la página en móvil, ¿el mapa de calor debe posicionar el scroll horizontal mostrando primero el extremo derecho (hoy) o el extremo izquierdo (hace un año)?
- [NECESITA ACLARACIÓN] Si un día tiene muchos temas distintos, ¿se listan todos en el detalle sin límite, o debe truncarse la lista a partir de cierto número?
- [NECESITA ACLARACIÓN] La tarjeta de racha actual tiene un diseño tipo "hoja de cuaderno" con un sello circular de racha; encajar 52 columnas dentro de esa misma tarjeta puede requerir ajustar su diseño visual. Esta decisión de diseño se deja para el plan, pero conviene tenerla presente al planificarlo.
