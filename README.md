# Vakantie Uitgaven Tracker

Een offline werkende website om vakantie-uitgaven per dag bij te houden tegen
een vooraf ingesteld budget per categorie (Vervoer, Drank, Lunch, Diner,
Aankopen), met een apart overzicht voor al betaalde vaste kosten (Vlucht,
Accommodatie, Autohuur).

Alle data wordt lokaal op je apparaat bewaard (`localStorage`) — er is geen
account en geen internetverbinding nodig na de eerste keer laden.

## Lokaal openen

```bash
cd vakantie-uitgaven-tracker
python3 -m http.server 8000
```

Open daarna `http://localhost:8000` in de browser.

## Tests draaien

```bash
cd vakantie-uitgaven-tracker
npm test
```

## Hosten (bijv. GitHub Pages)

Zet de inhoud van deze map online, bijvoorbeeld via GitHub Pages: zet de map
in een repository, ga naar Settings → Pages, en kies de map/branch waar deze
bestanden in staan.

## Installeren op je telefoon

1. Open de gehoste link in de browser van je telefoon
2. **Android (Chrome):** menu (⋮) → "App installeren" of "Toevoegen aan
   startscherm"
3. **iOS (Safari):** Deel-knop → "Zet op beginscherm"

De app verschijnt daarna als app-icoon en werkt ook zonder internetverbinding.

## Let op

De ingevoerde data staat alleen op het apparaat/de browser waarin je hem
invoert. Er is geen synchronisatie tussen apparaten.
