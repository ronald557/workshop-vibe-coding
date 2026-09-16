# Bouwplan fase 1 — klikbare front-endmockup

Dit document is de volledige opdracht voor fase 1. Wie dit bouwt, hoeft niets meer
te vragen: alle schermen, teksten en demo-data staan hieronder uitgeschreven.

Lees ook `STRATEGY.md` (visie en doelgroep) en `CLAUDE.md` (werkwijze).

---

## 1. Fasering op hoofdlijnen

| Fase | Wat | Status |
|---|---|---|
| **1. Klikbare mockup** | Drie schermen, zes persona's, vaste demo-reacties | **hieronder uitgewerkt** |
| 2. Inhoud en scherpte | Samenvattingsscherm met rode draad, eigen persona samenstellen, resultaat printen | later |
| 3. Echte reacties | Koppeling met een taalmodel; vraagt een kleine achterkant voor de sleutel | later |
| 4. Bewaren en delen | Accounts, eerdere sessies terugvinden, delen met je begeleider | later |
| 5. Klaar voor echt gebruik | Meerdere gebruikers, privacy en AVG, docenten beheren persona's | later |

Fases 2 tot en met 5 zijn hier alleen ter oriëntatie. Bouw ze niet.

---

## 2. Harde randvoorwaarden voor fase 1

- **Eén bestand:** `index.html`, met HTML, CSS en JavaScript erin. Geen bouwstap,
  geen npm, geen framework, geen externe CDN's of lettertypen.
- **Werkt via `file://`:** dubbelklikken op het bestand is genoeg.
- **Geen opslag.** Geen backend, database, accounts, betalingen of externe
  koppelingen. Ook **geen `localStorage`, `sessionStorage`, cookies of IndexedDB**.
  Alle toestand staat in één JavaScript-object in het geheugen. Na verversen is de
  app leeg — dat is de bedoeling.
- **Geen netwerkverzoeken.** Geen `fetch`, geen `XMLHttpRequest`, geen externe
  afbeeldingen. Avatars zijn initialen in een gekleurde cirkel.
- **Alle zichtbare tekst is Nederlands.**
- **Veilig invoegen van tekst:** gebruikersinvoer komt in de app terug. Zet die
  altijd met `textContent`, nooit met `innerHTML`.

---

## 3. Bestanden

| Bestand | Wat erin komt |
|---|---|
| `index.html` | De hele app: opmaak, vormgeving, gedrag en demo-data |
| `README.md` | Korte uitleg: wat dit is, hoe je het opent, dat de data fictief is |

`CLAUDE.md`, `STRATEGY.md` en dit plan staan er al. Niet wijzigen.

---

## 4. Toestand in het geheugen

```js
const state = {
  scherm: 1,                                  // 1, 2 of 3
  idee: { titel: '', omschrijving: '', tag: '' },
  gekozen: []                                 // array met persona-id's, 3 of 4 lang
};
```

Eén functie `toon(nummer)` verbergt alle schermen en toont er één. Navigeren gebeurt
zonder de pagina te herladen.

---

## 5. De drie schermen

Bovenaan staat op elk scherm dezelfde koptekst (**Panel**) en een voortgangsbalk met
drie stappen: *Je idee · Je panel · De reacties*. De huidige stap is gemarkeerd. De
balk is niet aanklikbaar; navigeren gaat via de knoppen.

### Scherm 1 — Idee invoeren

- Titel van het scherm: **"Welk idee wil je voorleggen?"**
- Invoerveld **Titel** (één regel, verplicht).
- Invoerveld **Korte omschrijving** (meerdere regels, optioneel).
- Rij met context-tags, één keuze, optioneel, nog eens klikken haalt weg:
  `Afstudeerproject` · `Concept` · `Onderzoeksvoorstel` · `Ontwerpvraag` · `Anders`
- Knop **"Vul voorbeeldidee in"** — vult titel, omschrijving en tag met het
  voorbeeld uit hoofdstuk 7.
- Knop **"Kies je panel →"** — uitgeschakeld zolang de titel leeg is.

### Scherm 2 — Persona's kiezen

- Titel: **"Wie wil je erover horen?"**
- Onderschrift: "Kies drie of vier persona's. Hoe verschillender, hoe meer je ziet."
- Zes kaartjes in een raster. Per kaartje: initiaal-avatar in de kleur van de
  persona, naam, rol, en de karakterzin.
- Klikken selecteert; nog eens klikken haalt weg. Een geselecteerd kaartje krijgt een
  gekleurde rand en een vinkje.
- Zijn er vier gekozen, dan zien de overige kaartjes er uitgeschakeld uit en doen ze
  niets bij klikken.
- Teller onder het raster: **"3 van maximaal 4 gekozen"**.
- Knop **"← Terug"** (naar scherm 1, idee blijft staan).
- Knop **"Toon de reacties →"** — uitgeschakeld bij minder dan drie gekozen.
- Toegankelijkheid: de kaartjes zijn echte `<button>`-elementen met `aria-pressed`.

### Scherm 3 — Panelreacties

- Bovenaan een samenvatting van het idee: de titel, en de tag als klein label.
- Daaronder de gekozen persona's naast elkaar in kaarten (raster,
  `minmax(260px, 1fr)`; op een smal scherm onder elkaar).
- Per kaart, in deze volgorde:
  1. Initiaal-avatar, naam en rol.
  2. De toon als klein label in één woord (bijvoorbeeld *methodisch*, *kritisch*).
  3. Het kernpunt (de reactie, twee tot drie zinnen).
  4. De scherpe vraag, apart uitgelicht in een kader met de kleur van de persona,
     voorafgegaan door het kopje **"Vraagt je:"**.
- Onderaan twee knoppen: **"← Wissel persona's"** (terug naar scherm 2, selectie
  blijft staan) en **"Begin opnieuw"** (wist alles en gaat naar scherm 1).

---

## 6. Vormgeving

Volgens `STRATEGY.md`: rustig en studieus, niet corporate.

- Achtergrond `#FBF9F6`, tekst `#1F2430`, kaarten wit met een zachte rand
  (`#E8E2D9`) en een lichte schaduw.
- Eén warme accentkleur voor knoppen en de actieve stap: `#B8542A`.
- Ruime witruimte, inhoud gecentreerd met `max-width: 1100px`.
- Systeemlettertypen (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`).
  Tekst is het leidende element: ruime regelafstand (1.6), rustige koppen.
- Duidelijke `:focus-visible`-omranding op alles wat aanklikbaar is.
- Alleen lichte weergave; geen donkere modus in fase 1.

### Persona-kleuren

| Persona | Kleur |
|---|---|
| Marieke de Wit | `#3B5BA5` |
| Sam Veldhuis | `#2F7D5A` |
| Hakim Boulahrouz | `#8E2F3F` |
| Ellen Bouma | `#A5761B` |
| Ruth Nakamura | `#6B4EA0` |
| Tygo Vermeer | `#1F7A8C` |

---

## 7. Het voorbeeldidee

```js
const voorbeeldIdee = {
  titel: 'Stille Ruimte — vind een rustige plek op de campus',
  omschrijving: 'Studenten die snel overprikkeld raken vinden tussen colleges door ' +
    'geen rustige plek. Ik wil onderzoeken of een app kan helpen die laat zien welke ' +
    'ruimtes op dit moment stil en vrij zijn, op basis van roosterdata en meldingen ' +
    'van studenten zelf.',
  tag: 'Afstudeerproject'
};
```

---

## 8. De zes persona's en hun reacties

Zet dit als één duidelijk gemarkeerd blok bovenin het script, zodat het makkelijk
aan te passen is. Elke persona heeft:

- `id`, `naam`, `rol`, `karakter` (één zin), `kleur`, `initialen`
- `reactie`: `{ toon, kernpunt, vraag }` — de uitgeschreven reactie op het
  voorbeeldidee
- `reserve(titel)`: functie die dezelfde vorm teruggeeft voor een zelf ingetypt idee

Deze zes teksten zijn het hart van de demo: het contrast moet meteen opvallen.

### 1. Marieke de Wit — Begeleider

- Karakter: "Let op je onderbouwing en of je vraag wel scherp genoeg is."
- Toon: **methodisch**
- Kernpunt: "Je schuift twee dingen door elkaar: een ontwerpvraag en een
  onderzoeksvraag. Je beschrijft de app al, en daarmee ligt de uitkomst vast voordat
  je onderzoek begint. Begin bij wat je nog niet weet."
- Vraag: "Wat zou je onderzoek kunnen laten zien waardoor je deze app juist niet gaat
  bouwen?"
- Reserve: "Voordat ik iets van «{titel}» kan vinden, wil ik weten welke vraag
  eronder ligt. Nu lees ik vooral een oplossing. Formuleer eerst wat je nog niet
  weet." · Vraag: "Welke vraag beantwoordt «{titel}» die nu nog openstaat?"

### 2. Sam Veldhuis — Eindgebruiker

- Karakter: "Praat vanuit een gewone dag, niet vanuit theorie."
- Toon: **concreet**
- Kernpunt: "Op een drukke dag open ik echt geen app om een plek te zoeken — dan ben
  ik al over mijn grens heen. Wat mij helpt is vooraf weten waar ik terechtkan, niet
  ter plekke nog moeten zoeken. En klopt het één keer niet, dan gebruik ik hem nooit
  meer."
- Vraag: "Wat gebeurt er met mijn vertrouwen als de app er één keer naast zit?"
- Reserve: "Ik snap wat je met «{titel}» wil, maar ik zie mezelf het nog niet
  gebruiken op een dag dat het tegenzit. Beschrijf eens het precieze moment waarop
  ik dit zou pakken." · Vraag: "Wat doe ik nu, op dat moment, zonder jouw idee?"

### 3. Hakim Boulahrouz — Scepticus

- Karakter: "Gelooft niets tot het bewezen is en zoekt het gat in je verhaal."
- Toon: **kritisch**
- Kernpunt: "Je aanname is dat studenten hun rustplek willen delen. Waarschijnlijker
  is dat ze hun goede plek juist geheimhouden. En werkt de app wél, dan stromen de
  stille ruimtes vol en is het probleem terug — alleen sneller."
- Vraag: "Wat weerhoudt jouw oplossing ervan zichzelf kapot te maken?"
- Reserve: "«{titel}» rust op een aanname die je nog niet hebt getoetst. Schrijf op
  wat waar moet zijn wil dit werken, en zoek dan het bewijs dat het niet waar is." ·
  Vraag: "Welke aanname onder «{titel}» zou het hele plan onderuithalen als hij niet
  klopt?"

### 4. Ellen Bouma — Opdrachtgever

- Karakter: "Denkt in budget, planning en wat het uiteindelijk oplevert."
- Toon: **zakelijk**
- Kernpunt: "De campus heeft al roostersoftware en sensoren in de gebouwen. Een losse
  app betekent een tweede systeem met eigen beheer en eigen kosten. Ik zie dit eerder
  als functie binnen wat er al staat."
- Vraag: "Wie beheert dit over twee jaar, als jij allang bent afgestudeerd?"
- Reserve: "Voor «{titel}» wil ik weten wat het kost en wat het vervangt. Een goed
  idee dat niemand beheert, is over een jaar een stilgevallen project." · Vraag:
  "Wat kan er weg of stoppen zodra «{titel}» er is?"

### 5. Ruth Nakamura — Ethicus

- Karakter: "Vraagt wie er buiten de boot valt en wat er met gegevens gebeurt."
- Toon: **bedachtzaam**
- Kernpunt: "Je bouwt ongemerkt een kaart van waar mensen zich terugtrekken, en wie
  dat zijn. Prikkelgevoeligheid raakt aan gezondheid, dus dat is gevoelige
  informatie. Ook een goedbedoelde meldknop legt vast wie waar zat."
- Vraag: "Kun je iemand helpen zonder te weten wie diegene is?"
- Reserve: "Bij «{titel}» vraag ik me af voor wie het níét werkt, en welke gegevens
  je onderweg verzamelt zonder dat iemand daarom vroeg." · Vraag: "Wie draagt de
  last van «{titel}» zonder er zelf iets aan te hebben?"

### 6. Tygo Vermeer — Medestudent

- Karakter: "Enthousiast, denkt hardop mee en ziet vooral kansen."
- Toon: **enthousiast**
- Kernpunt: "Hier loop ik zelf tegenaan, ik zou dit morgen gebruiken. Je zou zelfs
  verder kunnen gaan: laat mensen ook aangeven hóé het er voelt, niet alleen of het
  vrij is. Maar begin klein, met één gebouw."
- Vraag: "Kun je dit volgende week testen met plakbriefjes in plaats van code?"
- Reserve: "«{titel}» klinkt goed, en ik zou het gewoon proberen. Zoek de kleinst
  mogelijke versie die je deze week al aan iemand kunt laten zien." · Vraag: "Wat is
  de simpelste versie van «{titel}» die je zonder bouwen kunt testen?"

**Let op:** in de reserve-teksten wordt `{titel}` vervangen door wat de gebruiker
heeft ingetypt. Voeg die tekst in met `textContent`, niet met `innerHTML`.

Is de ingevoerde titel gelijk aan die van het voorbeeldidee, dan toont de app de
uitgeschreven `reactie`; in alle andere gevallen de `reserve`.

---

## 9. Hoe we beoordelen of fase 1 werkt

Loop deze punten na en meld de uitkomst. Maak schermafbeeldingen van de drie
schermen.

1. **De demo loopt.** Voorbeeldidee → persona's → panel, in drie klikken, zonder
   hapering.
2. **Het contrast is zichtbaar.** Staan de zes reacties naast elkaar, dan verschillen
   toon, kernpunt en vraag duidelijk. Hier staat of valt de demo.
3. **Eigen tekst breekt niets.** Een zelf ingetypt idee levert nog steeds een
   volledig panel op, ook met rare tekens erin.
4. **Heen en weer klikken werkt.** Terug naar de persona-keuze houdt de selectie
   vast; wisselen ververst het panel meteen, zonder herladen.
5. **Er wordt niets opgeslagen.** Na verversen is de app leeg. Controleer dat er geen
   opslag wordt gebruikt en geen netwerkverzoeken uitgaan.
6. **Het werkt zonder server.** Het bestand rechtstreeks openen is genoeg.
7. **Leesbaar op telefoonformaat.** Geen horizontale schuifbalk, knoppen goed
   aanklikbaar.

---

## 10. Werkvolgorde

1. `index.html` bouwen: eerst de drie schermen en de navigatie, dan de demo-data,
   dan de vormgeving.
2. `README.md` bijwerken met een korte uitleg.
3. Testen volgens hoofdstuk 9, met schermafbeeldingen.
4. Opslaan en pushen naar de werkversie `claude/pensive-hamilton-329he0`.
5. Pull request met een Nederlandse titel, en de gebruiker stap voor stap door het
   samenvoegen begeleiden.
6. Ná samenvoegen: GitHub Pages aanzetten. Dat vraagt één klik van de gebruiker in de
   instellingen van de repository — geef de exacte link en knopnaam.
