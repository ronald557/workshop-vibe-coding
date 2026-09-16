// Backend voor Het Limburgse Panel: geeft persona's echte AI-reacties, laat
// ze op elkaar reageren, en vat het gesprek samen tot verbeterpunten.
//
// Draait als Cloudflare Worker. Gebruikt bewust fetch() in plaats van de
// officiële Anthropic-SDK: de Cloudflare-dashboardeditor ("Quick Edit") kan
// geen npm-pakketten bundelen, dus dit bestand moet zonder build-stap
// werken - je plakt het rechtstreeks in het dashboard.
//
// De AI-sleutel (ANTHROPIC_API_KEY) staat NOOIT in dit bestand. Je zet hem
// apart als "secret" in het Cloudflare-dashboard (zie backend/README.md).
//
// Drie "modi" in het verzoek (payload.modus):
//   'reactie'      (of geen modus) - eerste, losse reactie op het idee.
//   'vervolg'      - persona reageert op de eerste reacties van de anderen.
//   'samenvatting' - neutrale samenvatting van het hele gesprek.

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

function ideeRegel(idee) {
  return (
    'Idee: ' + idee.titel + '\n' +
    'Omschrijving: ' + (idee.omschrijving || '(geen omschrijving)') + '\n' +
    'Context: ' + (idee.tag || '(geen tag)')
  );
}

async function vraagClaude(env, systeemPrompt, gebruikerPrompt) {
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
    throw { status: 502, error: 'Kon de AI-dienst niet bereiken.', details: String(err) };
  }

  if (!aiResponse.ok) {
    const foutTekst = await aiResponse.text();
    throw { status: 502, error: 'AI-aanvraag mislukt.', details: foutTekst };
  }

  const data = await aiResponse.json();
  const tekst = data.content && data.content[0] && data.content[0].text;
  if (!tekst) {
    throw { status: 502, error: 'AI gaf geen bruikbaar antwoord.' };
  }

  try {
    return haalJsonUitTekst(tekst);
  } catch (err) {
    throw { status: 502, error: 'Kon AI-antwoord niet lezen als JSON.', ruw: tekst };
  }
}

async function afhandelenReactie(env, payload) {
  const idee = payload.idee;
  const persona = payload.persona;

  if (!idee || !idee.titel || !persona || !persona.naam || !persona.rol || !persona.karakter) {
    throw { status: 400, error: 'Idee (titel) en persona (naam, rol, karakter) zijn verplicht.' };
  }
  if (String(idee.titel).length > 300 || String(idee.omschrijving || '').length > 2000) {
    throw { status: 400, error: 'Titel of omschrijving is te lang.' };
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

  const reactie = await vraagClaude(env, systeemPrompt, ideeRegel(idee));

  if (!reactie.toon || !reactie.kernpunt || !reactie.vraag) {
    throw { status: 502, error: 'AI-antwoord mist verplichte velden.', ruw: reactie };
  }
  return reactie;
}

async function afhandelenVervolg(env, payload) {
  const idee = payload.idee;
  const persona = payload.persona;
  const paneel = payload.paneel;

  if (!idee || !idee.titel || !persona || !persona.naam || !Array.isArray(paneel)) {
    throw { status: 400, error: 'Idee, persona en paneel (array) zijn verplicht voor een vervolgronde.' };
  }

  const anderenTekst = paneel.map(function (p) {
    return '- ' + p.naam + ' (' + p.rol + '): "' + p.kernpunt + '" Vraag: "' + p.vraag + '"';
  }).join('\n');

  const systeemPrompt =
    'Je bent ' + persona.naam + ', ' + persona.rol + '. ' + persona.karakter + '\n' +
    'Je hebt al gereageerd op een idee dat aan een panel is voorgelegd. Hieronder staan de ' +
    'eerste reacties van de andere panelleden. Reageer in het Nederlands, kort en in ' +
    'karakter, op wat zij inbrengen - ben je het ermee eens, of zie je een spanning met ' +
    'jouw eigen punt? Doe daarna één concrete suggestie om het idee te verbeteren, gebaseerd ' +
    'op het hele gesprek tot nu toe.\n' +
    'Antwoord ALLEEN met geldige JSON in exact dit formaat, zonder uitleg of opmaak eromheen:\n' +
    '{"reactieOpPanel": "één tot twee zinnen die reageren op de andere panelleden", ' +
    '"suggestie": "één concrete, korte verbetersuggestie voor het idee"}';

  const gebruikerPrompt = ideeRegel(idee) + '\n\nDe andere panelleden zeiden:\n' + anderenTekst;

  const reactie = await vraagClaude(env, systeemPrompt, gebruikerPrompt);

  if (!reactie.reactieOpPanel || !reactie.suggestie) {
    throw { status: 502, error: 'AI-antwoord mist verplichte velden.', ruw: reactie };
  }
  return reactie;
}

async function afhandelenSamenvatting(env, payload) {
  const idee = payload.idee;
  const paneel = payload.paneel;

  if (!idee || !idee.titel || !Array.isArray(paneel) || paneel.length === 0) {
    throw { status: 400, error: 'Idee en paneel (array) zijn verplicht voor een samenvatting.' };
  }

  const gesprekTekst = paneel.map(function (p) {
    return '- ' + p.naam + ' (' + p.rol + '): eerste reactie "' + p.kernpunt + '"; na het ' +
      'gesprek: "' + p.reactieOpPanel + '"; suggestie: "' + p.suggestie + '"';
  }).join('\n');

  const systeemPrompt =
    'Je bent een neutrale notulist bij een paneldiscussie over een idee. Je hebt het hele ' +
    'gesprek gelezen en vat het samen tot concrete, bruikbare verbeterpunten voor de ' +
    'indiener. Wees kort en concreet, geen algemeenheden, in het Nederlands.\n' +
    'Antwoord ALLEEN met geldige JSON in exact dit formaat, zonder uitleg of opmaak eromheen:\n' +
    '{"verbeterpunten": ["eerste verbeterpunt", "tweede verbeterpunt", "derde verbeterpunt"]}\n' +
    'Geef drie tot vijf verbeterpunten, elk één zin.';

  const gebruikerPrompt = ideeRegel(idee) + '\n\nHet paneelgesprek:\n' + gesprekTekst;

  const reactie = await vraagClaude(env, systeemPrompt, gebruikerPrompt);

  if (!Array.isArray(reactie.verbeterpunten) || reactie.verbeterpunten.length === 0) {
    throw { status: 502, error: 'AI-antwoord mist verplichte velden.', ruw: reactie };
  }
  return reactie;
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
    payload = payload || {};

    try {
      let resultaat;
      if (payload.modus === 'vervolg') {
        resultaat = await afhandelenVervolg(env, payload);
      } else if (payload.modus === 'samenvatting') {
        resultaat = await afhandelenSamenvatting(env, payload);
      } else {
        resultaat = await afhandelenReactie(env, payload);
      }
      return jsonResponse(resultaat);
    } catch (err) {
      if (err && err.status) {
        return jsonResponse({ error: err.error, ruw: err.ruw, details: err.details }, err.status);
      }
      return jsonResponse({ error: 'Onverwachte fout.', details: String(err) }, 500);
    }
  },
};
