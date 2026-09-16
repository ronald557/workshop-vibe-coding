# Backend: echte AI-reacties

`worker.js` is de code die live, AI-gegenereerde reacties maakt voor Het
Limburgse Panel. Deze code draait niet mee met de app zelf (die blijft één
bestand, `index.html`) — hij draait apart, bij Cloudflare, en de app roept
hem aan via internet.

Zonder deze stappen blijft de app gewoon werken met de vaste
voorbeeldreacties, zoals nu. Deze stappen zijn dus optioneel.

## Wat je nodig hebt

1. Een **Anthropic-account** met een API-sleutel (console.anthropic.com).
   Gebruik hiervan kost een klein bedrag per aanroep (met het gekozen model,
   Claude Haiku 4.5, meestal een fractie van een cent per reactie).
2. Een **Cloudflare-account** (gratis) om de backend te hosten
   (dash.cloudflare.com).

## Stap voor stap

### 1. Een Anthropic API-sleutel aanmaken

1. Ga naar https://console.anthropic.com en log in of maak een account.
2. Ga naar **Settings → API Keys** en maak een nieuwe sleutel aan.
3. Kopieer de sleutel meteen (je ziet hem daarna niet meer terug) en bewaar
   hem tijdelijk ergens veilig — je hebt hem zo nodig.
4. Zorg dat er een betaalmethode gekoppeld is (Settings → Billing), anders
   werkt de sleutel niet.

### 2. Een Cloudflare Worker aanmaken

Let op: Cloudflare verandert de indeling van het dashboard af en toe. Klopt
een naam hieronder niet meer met wat je ziet? Zoek naar het woord "Workers"
in het linkermenu of de zoekbalk bovenin (Ctrl/Cmd+K).

1. Ga naar https://dash.cloudflare.com en log in of maak een gratis account.
2. Klik in het linkermenu op **Compute** (onder het kopje "Build").
3. Klik in het submenu op **Workers**, en daarna op **Create** (soms
   **Create Worker** genoemd).
4. Geef de Worker een naam (bijvoorbeeld `limburgs-panel-backend`) en klik
   op **Deploy** (dit zet eerst een lege voorbeeld-Worker live).
5. Klik daarna op **Edit code** (soms "Quick edit" genoemd).
6. Verwijder de voorbeeldcode die er staat, en plak in plaats daarvan de
   volledige inhoud van `worker.js` uit deze map.
7. Klik op **Save and deploy** (of **Deploy**).

### 3. De AI-sleutel veilig toevoegen

Zet je Anthropic-sleutel nooit in de code zelf. Voeg hem toe als geheime
instelling ("secret"):

1. Ga in je Worker naar **Settings → Variables and Secrets**.
2. Voeg een nieuwe secret toe met de naam `ANTHROPIC_API_KEY` en plak je
   sleutel als waarde.
3. Sla op en herstart/deploy de Worker opnieuw als daarom gevraagd wordt.

### 4. De Worker-link overnemen in de app

1. Kopieer de URL van je Worker — die staat bovenaan de Worker-pagina en
   ziet er ongeveer zo uit: `https://limburgs-panel-backend.jouw-account.workers.dev`.
2. Open `index.html` en zoek de regel met `BACKEND_URL`.
3. Vervang de placeholder-tekst door jouw eigen Worker-URL.
4. Sla op, commit en push (of laat mij dat doen).

Zodra dat staat, gebruikt de app automatisch echte AI-reacties in plaats
van de vaste voorbeeldteksten. Lukt het ophalen een keer niet (bijvoorbeeld
geen internet, of de Worker is niet bereikbaar), dan valt de app terug op
de vaste voorbeeldreactie, zodat de demo nooit vastloopt.

## Kosten en veiligheid — dingen om te weten

- **Kosten:** je betaalt Anthropic per aanroep (klein bedrag per reactie
  met Haiku 4.5) en niets aan Cloudflare voor normaal, licht gebruik (ruim
  binnen de gratis laag). Stel in je Anthropic-account eventueel een
  maandelijkse uitgavenlimiet in als extra zekerheid.
- **Open endpoint:** deze Worker controleert niet wie hem aanroept. Voor een
  demo in de klas is dat prima, maar als de link breed rondgaat, kan
  iedereen ermee jouw AI-budget gebruiken. Wil je dat afschermen, dan kan
  dat later met een eenvoudige toegangscontrole — dat is geen onderdeel van
  deze stap.
