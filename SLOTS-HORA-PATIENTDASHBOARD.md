# Selector de hora por slots en PatientDashboard

**Rama:** `development` · **Alcance:** solo front · **Fecha:** 2026-10-07

## Qué se cambió

Archivo único: `src/Components/Sistema/SystemComponents/PatientDashboard/PatientDashboard.tsx` (el CSS no se tocó; el nuevo `<select>` usa los estilos existentes de `.dashboardForm select`, incluido `select:disabled`).

1. **Helpers nuevos** (a nivel módulo, fuera del componente):
   - `NUMBER_TO_DAY`: inverso de `DAY_TO_NUMBER` (`getDay()` → `DayOfWeek`). Con esto el import de `DayOfWeek` queda en uso.
   - `toMinutes("HH:MM")` → minutos desde medianoche.
   - `toHHMM(minutos)` → `"HH:MM"` con padding de ceros.
   - `generateTimeSlots(professional, specialty, date)` → `string[]` de horarios de inicio.
2. **Estado derivado** en el componente: `timeSlots` (`useMemo` sobre profesional, especialidad y fecha) y `canPickTime` (hay profesional + especialidad + fecha).
3. **UI:** el `<input type="time" name="timeFrom">` pasó a ser un `<select name="timeFrom">`:
   - Primera opción `value=""`: "Seleccioná un horario".
   - Deshabilitado mientras falte profesional, especialidad o fecha.
   - Si la combinación no tiene slots, queda deshabilitado y la opción placeholder dice "No hay horarios disponibles para esta fecha".
   - Se mantiene el texto amarillo "Horario: X - Y" cuando la especialidad tiene restricción.
4. **Reset de `timeFrom`:** al cambiar profesional, especialidad o fecha, `timeFrom` vuelve a `''`. Así nunca queda guardado un slot que no existe en la nueva combinación.

No se tocó: `isDateDisabled`, las validaciones de restricción (en `handleInputChange` y en `handleSubmit`), los loading states (`submitting`, `cancellingId`), el merge optimista al crear o cancelar, ni el `console.log` de debug del catch.

## Lógica de generación de slots

Entrada: profesional seleccionado, `selectedSpecialty` y la fecha (`YYYY-MM-DD`).

1. Si falta alguno de los tres, o `durationMinutes` no es un número mayor que 0, se devuelve `[]`.
2. Se calcula el día de la semana de la fecha (`new Date(date + 'T00:00:00').getDay()`, igual que `isDateDisabled`) y se pasa a `DayOfWeek`.
3. Se toman los tramos `professional.scheduleId.weeklySlots` de ese día. Puede haber varios (horario cortado). También se descartan los que tienen `isAvailable === false`: el campo existe en `IWeeklySlot` y no tenía sentido ofrecer un tramo marcado como no disponible. Si el campo viene `undefined`, el tramo se considera disponible.
4. Para cada tramo, en minutos:
   - `from = timeFrom` y `to = timeTo` del tramo.
   - Si la especialidad tiene `restriction.hasRestriction`, se hace la intersección: `from = max(from, restriction.timeFrom)` y `to = min(to, restriction.timeTo)`.
   - Se generan slots desde `from` sumando `durationMinutes`. Un slot entra **solo si `inicio + durationMinutes <= to`**.
5. Los slots de todos los tramos se juntan en un `Set` (así se eliminan duplicados si hay tramos solapados), se ordenan de menor a mayor y se formatean a `"HH:MM"`.

**Ejemplo (tramo 08:00-12:00, duración 45):** 08:00, 08:45, 09:30, 10:15, 11:00. El último es 11:00 (termina 11:45). El siguiente, 11:45, terminaría 12:30 y queda afuera. El brief mencionaba 11:15 como último válido, pero 11:15 no cae en la grilla de 45 minutos que arranca a las 08:00. Por la regla `inicio + duración <= fin`, el último es 11:00.

**Decisión a revisar (restricción):** con restricción, la grilla arranca al **inicio de la intersección**, no al inicio del tramo del profesional. Ejemplo: profesional 08:00-12:00, restricción 09:00-11:00, duración 45 → 09:00, 09:45 (y no 09:30, 10:15, que saldrían de alinear con las 08:00). Me pareció lo más natural para el paciente. Si se prefiere alinear con el tramo del profesional, el cambio es de 2 líneas en `generateTimeSlots`.

## Fuera de alcance (a propósito)

- **Disponibilidad real:** el select no sabe si un slot ya tiene turnos tomados.
- **`maxCapacity`:** no se descuentan cupos.
- **Bloqueos y excepciones** (feriados, licencias, días puntuales) que no estén en `weeklySlots`.
- **Horarios ya pasados del día de hoy:** si la fecha es hoy, se ofrecen también los slots anteriores a la hora actual. Lo valida el backend, si es que lo hace (no lo verifiqué).

El backend sigue siendo la validación final. Si el slot está lleno o no es válido, lo rechaza al enviar y el front muestra el error en un toast, igual que antes.

## Estado de la verificación

| Verificación | Estado |
|---|---|
| `npm run build` (`tsc -b` + `vite build`) | ✅ Sin errores (baseline también limpio) |
| ESLint sobre el componente | ⚠️ 1 error **preexistente** (`error: any` en el catch de `handleSubmit`), no introducido por este cambio |
| Lógica de `generateTimeSlots`, probada aislada con Node sobre datos mock | ✅ Ver casos abajo |
| Prueba en navegador (UI real) | ❌ **No se hizo** |
| Prueba end-to-end contra la base real (crear un turno con un slot) | ❌ **No se hizo** |

Casos probados sobre la función (con datos mock, no con la base):

| Caso | Resultado |
|---|---|
| Tramo 08:00-12:00, 45 min | 08:00, 08:45, 09:30, 10:15, 11:00 |
| Horario cortado 08:00-12:00 + 14:00-17:00, 45 min (cargados desordenados) | 08:00 … 11:00, 14:00, 14:45, 15:30, 16:15 (ordenados) |
| Restricción 09:00-11:00 sobre tramo 08:00-12:00, 30 min | 09:00, 09:30, 10:00, 10:30 |
| Restricción sin intersección con el tramo | `[]` → select deshabilitado con mensaje |
| Tramos solapados 08:00-10:00 + 09:00-11:00, 60 min | 08:00, 09:00, 10:00 (sin duplicados) |
| Fecha en un día que el profesional no atiende | `[]` → select deshabilitado con mensaje |
| Tramo con `isAvailable: false` | `[]` |
| Profesional sin `scheduleId` | `[]` |

**Pendiente de probar a mano:** abrir el dashboard como paciente, elegir profesional + especialidad + fecha, verificar los slots en pantalla, cambiar la fecha a un día no atendido y crear un turno real con un slot. El payload no cambió de forma (`timeFrom` sigue siendo `"HH:MM"`), así que el envío debería funcionar igual que antes, pero no está comprobado contra el backend.

## Pendientes para la fase robusta (endpoint de disponibilidad)

- **Endpoint de disponibilidad** (por ejemplo `GET /professionals/:id/availability?specialtyId=&date=`). Debería devolver los slots ya calculados en el backend, descontando turnos `pending`/`approved` y respetando `maxCapacity`. El front reemplazaría `generateTimeSlots` por esa llamada.
- **Una sola fuente de verdad:** hoy la grilla se calcula en el front y el backend valida por su cuenta. Si el backend tiene otra regla de corte o de alineación, el front puede ofrecer slots que el backend rechaza. Con el endpoint, esa regla queda solo en el backend.
- **Slots pasados del día actual:** filtrarlos (en el endpoint o en el front).
- **Feriados y excepciones** del profesional, si se modelan.
- **UX opcional:** mostrar los cupos restantes por slot o marcar los slots llenos como deshabilitados, en lugar de ocultarlos.
- **Zona horaria:** hoy se usa la hora local del navegador para calcular el día de la semana (igual que `isDateDisabled`). Hay que revisarlo si alguna vez hay pacientes en otra zona horaria.
