// Backend voor Het Limburgse Panel: geeft persona's echte AI-reacties.
//
// Draait als Cloudflare Worker. Gebruikt bewust fetch() in plaats van de
// officiële Anthropic-SDK: de Cloudflare-dashboardeditor ("Quick Edit") kan
// geen npm-pakketten bundelen, dus dit bestand moet zonder build-stap
// werken - je plakt het rechtstreeks in het dashboard.
//
// De AI-sleutel (ANTHROPIC_API_KEY) staat NOOIT in dit bestand. Je zet hem
// apart als "secret" in het Cloudflare-dashboard (zie backend/README.md).

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function haalJsonUitTekst(tekst) {
  const schoon = tekst.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  return JSON.parse(schoon);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Alleen POST-verzoeken worden ondersteund.' }, 405);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: 'Serverfout: ANTHROPIC_API_KEY ontbreekt.' }, 500);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return jsonResponse({ error: 'Ongeldige JSON in het verzoek.' }, 400);
    }

    const idee = payload && payload.idee;
    const persona = payload && payload.persona;

    if (!idee || !idee.titel || !persona || !persona.naam || !persona.rol || !persona.karakter) {
      return jsonResponse({ error: 'Idee (titel) en persona (naam, rol, karakter) zijn verplicht.' }, 400);
    }

    if (String(idee.titel).length > 300 || String(idee.omschrijving || '').length > 2000) {
      return jsonResponse({ error: 'Titel of omschrijving is te lang.' }, 400);
    }

    const systeemPrompt =
      'Je bent ' + persona.naam + ', ' + persona.rol + '. ' + persona.karakter + '\n' +
      'Je reageert in het Nederlands, in het karakter van deze persoon, op een idee dat ' +
      'iemand aan een panel voorlegt. Blijf dicht bij je karakterbeschrijving en wees ' +
      'concreet, geen algemeenheden.\n' +
      'Antwoord ALLEEN met geldige JSON in exact dit formaat, zonder uitleg, aanhef of ' +
      'markdown-opmaak eromheen:\n' +
      '{"toon": "één woord dat je toon samenvat", "kernpunt": "twee tot drie zinnen met ' +
      'je inhoudelijke reactie", "vraag": "één scherpe, korte vraag aan de indiener"}';

    const gebruikerPrompt =
      'Idee: ' + idee.titel + '\n' +
      'Omschrijving: ' + (idee.omschrijving || '(geen omschrijving)') + '\n' +
      'Context: ' + (idee.tag || '(geen tag)');

    let aiResponse;
    try {
      aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 500,
          system: systeemPrompt,
          messages: [{ role: 'user', content: gebruikerPrompt }],
        }),
      });
    } catch (err) {
      return jsonResponse({ error: 'Kon de AI-dienst niet bereiken.', details: String(err) }, 502);
    }

    if (!aiResponse.ok) {
      const foutTekst = await aiResponse.text();
      return jsonResponse({ error: 'AI-aanvraag mislukt.', details: foutTekst }, 502);
    }

    const data = await aiResponse.json();
    const tekst = data.content && data.content[0] && data.content[0].text;

    if (!tekst) {
      return jsonResponse({ error: 'AI gaf geen bruikbaar antwoord.' }, 502);
    }

    let reactie;
    try {
      reactie = haalJsonUitTekst(tekst);
    } catch (err) {
      return jsonResponse({ error: 'Kon AI-antwoord niet lezen als JSON.', ruw: tekst }, 502);
    }

    if (!reactie.toon || !reactie.kernpunt || !reactie.vraag) {
      return jsonResponse({ error: 'AI-antwoord mist verplichte velden.', ruw: reactie }, 502);
    }

    return jsonResponse(reactie);
  },
};
