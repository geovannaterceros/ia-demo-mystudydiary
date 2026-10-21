# MEMORY.md — Diario de Estudio 
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte. 

## Estado actual 
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y lista de sesiones. 
- Total de minutos estudiados en la semana actual (lunes-domingo), mostrado dentro de la tarjeta de racha. 
- Días únicos estudiados en el mes actual (día 1 hasta hoy), mostrado dentro de la tarjeta de racha. 
- Datos en localStorage. ## Aprendizajes y errores a evitar - (vacío por ahora) 

## Decisiones (y por qué) 
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic. 
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer. 
- Semana = lunes a domingo (convención habitual en español); fechas futuras no cuentan, por coherencia con la regla de la racha. Total mostrado en minutos simples, dentro de la tarjeta de racha (sin tarjeta nueva). 
- Días estudiados este mes: mismo patrón que los minutos de la semana (misma tarjeta, sin tarjeta nueva, cálculo con comparación de strings "AAAA-MM-DD", sin tocar objetos Date ni UTC). Se decidió sin confirmación explícita del usuario por estar en modo automático; revisar si no es lo que se quería. 
- Rediseño visual (2026-10-15): concepto "hoja de cuaderno sobre un escritorio" en vez de tarjetas con gradiente. Papel con renglones y margen rojo, racha en un "sello" circular, datos (minutos/semana, días/mes, tema/minutos de cada sesión) alineados con puntos guía tipo recibo. 
- Tipografías del sistema (serif para títulos, monoespaciada para números/fechas, sans para UI): a propósito sin Google Fonts ni ninguna fuente externa, para no romper la regla de "funciona con doble clic sin dependencias". 
- `app.js` cambió solo en cómo arma el texto de pantalla (spans de valor en vez de frases completas, `title` con el tema completo en cada sesión); el formato guardado en localStorage no cambió. 

## Próximos pasos 
- Revisar el nuevo diseño en el navegador (no se pudo verificar con captura de pantalla en esta sesión; el usuario rechazó instalar la extensión de Chrome). 
- Si el estilo "cuaderno" no convence, lo anterior (tarjetas con gradiente) está en el historial de git para comparar. 