# Fehler – 110-kV-Fehlersimulator

Interaktive Simulation eines 110-kV-Drehstromsystems bei Leiterunterbrechung und
Erdschluss: Spannungszeiger an Netz, Mast, HS/MS-Transformator (Yy0), MS/NS-Transformator
(Dyn5) und Überspannungsableiter am Trafo-Sternpunkt, inklusive TOV-Bewertung des
Ableiters (Zündzeitpunkt).

## Starten

`fehlersimulator.html` im Browser öffnen – keine Installation, kein Build.

## Selbsttest (ohne Browser)

```bash
node tools/selftest.mjs      # nur Zusammenfassung und Fehler
node tools/selftest.mjs -v   # alle Prüfungen
```

Benötigt Node.js ≥ 18.

## Weiterentwickeln mit Claude Code

```bash
git clone https://github.com/janhermes1/fehler.git
cd fehler
claude
```

`CLAUDE.md` beschreibt Aufbau, Rechenmodell und die bisher getroffenen Festlegungen.
