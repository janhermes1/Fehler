# Fehlersimulator 110 kV – Hinweise für Claude Code

Lehr-/Analysewerkzeug: 110-kV-Drehstromsystem mit Leiterunterbrechung und Erdschluss,
Spannungszeiger an Netz, Mast, Transformatoren (HS/MS Yy0, MS/NS Dyn5) und Ableiter
am HS-Sternpunkt M. Oberfläche und Texte sind **deutsch** (Dezimalkomma, Formelzeichen
unterstrichen für komplexe Größen).

## Aufbau

Alles steckt in **einer Datei**: `fehlersimulator.html` (HTML + CSS + Vanilla-JS, keine
Abhängigkeiten, kein Build). Öffnen im Browser genügt.

Im `<script>`:

| Bereich | Inhalt |
|---|---|
| `/*<CORE>*/ … /*</CORE>*/` | Rechenkern ohne DOM: `Complex`, `gaussSolve`, `solveMNA`, `buildNetwork`, `compute`, `DEF` (Standardwerte), TOV-Funktionen (`tovPts`, `tovAt`, `tovTime`, `tovOpVoltage`), Formatierung, `selfTest` |
| danach | UI: `SYM` (Formelzeichen), `renderSchematic` (SVG-Schaltbild), `renderPhasors` / `renderPhasorsLV` / `drawPhasors`, `renderTable` (`ROWS`), `updateInfo`, `renderAnalysis` (Sonderanalysen), `buildForm`, `syncInputs`, `onInput`, `init` |

Zustand: globales `state` (Klon von `DEF`). Eingabefelder binden über `data-path`
(z. B. `tov.Ur`, `ZW.0.m`); `onInput` → `setPath` → `update()` rechnet alles neu.
Der Kern muss DOM-frei bleiben, damit `tools/selftest.mjs` ihn in Node ausführen kann.

## Rechenmodell

- Modifizierte Knotenpunktanalyse (MNA), komplexe Effektivwertzeiger, 50 Hz.
  Knoten: N, S1–3, A1–3 (Mast), T1–3 (Trafoklemmen), M (HS-Sternpunkt); Erde E = Bezug.
- `ZERO_Z = 1e-6 Ω` ersetzt Z → 0; `ISO_Z = 1e9 Ω` ersetzt freien Sternpunkt.
- **Vereinfachtes Modell** (`ideal`, Standard an): Z_N und Z_1–3 → 0 wie die Musterlösung.
- **Sternpunktbehandlung** `gnd`: `iso` (Standard: Generator-Sternpunkt frei, Kompensation
  liegt in einem anderen Netzbereich), `comp` (Petersenspule Z_P), `low` (Z_E), `solid`.
  C_E wird immer aus Z_P und Verstimmung v berechnet (Netzausdehnung), auch ohne Spule.
- **HS/MS-Trafo Yy0**: HS-Wicklungen Z_W1–3 zwischen T_k und M. `coup`: `none`
  (unabhängige Wicklungen) oder `core` (Standard; Dreischenkelkern/Ausgleichswicklung,
  Nullsystem über Z_0W, Admittanzmatrix-Element `YM`).
  MS-Strang = U_Wk · U_MS/110 (Nullsystem wird übertragen).
- **MS/NS-Trafo Dyn5**: U_NS1 = ü·U_MS31, U_NS2 = ü·U_MS12, U_NS3 = ü·U_MS23 mit
  ü = (U_NS/√3)/U_MS → Nullsystem gesperrt, 150° Nacheilung. Z_D1–3 (Δ-Wicklungen)
  liefern nur Wicklungsströme I_D; die MS-Seite ist ideal eingeprägt (keine Rückwirkung).
  NS-Sternpunkt N ist geerdet (Betriebserder).
- Ableiter-Modi `arr.mode`: `inf`, `zero`, `free`, `res` (Thevenin aus Restspannung).
- Fälle der Musterlösung: S.2 = Doppelfehler L3 (Unterbrechung + Erdschluss netzseitig),
  Ableiter Z → ∞ (U_M = 1,5·U_G = 95,26 kV ∠60°); S.3 = dasselbe mit Ableiter Z → 0.
  Die Buttons setzen `ideal` und `gnd = 'iso'`, lassen aber die Kopplung unverändert.

## Sonderanalyse TOV / Zündzeitpunkt

U_M wird immer mit Ableiter Z → ∞ (vor dem Ansprechen) bestimmt und als T = U_M/U_r
mit den Kennlinien T(t) „ohne/mit Vorbelastung“ verglichen (log-lineare Interpolation,
Stützpunkte 0,1 … 10000 s). t* = Schnittpunkt = Zündzeitpunkt; Vergleich mit Schutzzeit t_S.
Rückrechnung `tovOpVoltage`: Betriebsspannung, bei der t* = t_Z (Netz linear).
Standard: U_r = 96 kV, U_c = 76 kV, t_S = 3 s, t_Z = 360 s.
**Die Kennlinienwerte sind typische Beispielwerte, keine Normwerte** (IEC 60099-4/-5
schreibt keine Kurve vor) – das muss im UI-Text so bleiben.

## Schaltbild

- SVG mit dynamischer Breite: `dyView` `detail` (Δ-/Stern-Wicklungen des MS/NS-Trafos)
  oder `block`; Button `#btnDy`. Konstanten `YL` (Leiterhöhen), `YE` (Erdlinie), `NS0`, `VBW`.
- Impedanzwerte werden im Schaltbild **nicht** angezeigt, nur Formelzeichen und
  Grenzzustände (→ 0 / → ∞). R_F wird angezeigt.
- Leitungskapazitäten C_E werden nicht gezeichnet (gehen aber in die Rechnung ein).
- Verkettete HS-Spannungen stehen rechts der Fehlerstelle als U_T12/23/31 (Trafoklemmen).
- Geänderte Werte bekommen einen gelben Marker (`decorate`), Auswahl per Klick ist über
  Schaltbild, Zeigerdiagramme und Tabelle synchron (`selKey`).

## Arbeitsweise

- Nach jeder Änderung am Kern: `node tools/selftest.mjs` (Exit-Code 0 = alle bestanden,
  `-v` zeigt alle Prüfungen). Der Selbsttest läuft auch beim Laden im Browser (Fußzeile).
- Neue Rechengrößen: in `compute` ergänzen, Formelzeichen in `SYM`, Zeile in `ROWS`,
  bei Bedarf Prüfung in `selfTest`.
- Referenztests der Musterlösung rechnen ausdrücklich ungekoppelt (`base.coup = 'none'`);
  Standardänderungen in `DEF` dürfen diese Tests nicht verändern.
- Darstellung im Browser prüfen (Playwright o. ä.), besonders Beschriftungskollisionen
  im Schaltbild; Layout muss auch bei 390 px Breite ohne horizontales Scrollen bleiben.
