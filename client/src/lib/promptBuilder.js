export function buildPrompt(category, answers, projectName) {
  const name = projectName || 'skapelse';

  switch (category) {
    case 'spel':
      return `Svara BARA med ett JSON-objekt, inget annat. Inga förklaringar.

Baserat på dessa val, skapa ett roligt spelnamn på svenska (max 3 ord):
- Speltyp: ${answers.speltyp}
- Karaktär: ${answers.karaktar}
- Värld: ${answers.varld}

Svara exakt så här (byt ut värdet för title):
{"title": "Ninja i Rymden"}`;

    case 'musik':
      return `Du är Kompisen! Skapa en komplett interaktiv musikspelare i HTML och spara som /workspace/${name}.html

Musiken ska vara:
- Genre: ${answers.genre}
- Stämning: ${answers.stamning}
- Instrument: ${Array.isArray(answers.instrument) ? answers.instrument.join(' och ') : answers.instrument}
- Tempo: ${answers.tempo}/10 (1=mycket långsamt, 10=mycket snabbt)

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Använd Web Audio API för att generera musik (INGA externa ljudfiler)
- Skapa ett beat/melodimönster som matchar genre och stämning
- Stor PLAY/PAUSE-knapp i mitten
- Visuell beatvisualizer (animerade staplar eller cirklar som dansar med musiken)
- BPM-räknare och genre-ikon
- Välj bland minst 4 olika melodivariationer att spela
- Snyggt färgglatt gränssnitt som matchar genre (pop=rosa, hiphop=guld, rock=röd, etc.)
- Kul och rolig att lyssna på

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'ritprogram':
      return `Du är Kompisen! Skapa ett komplett ritprogram i HTML och spara som /workspace/${name}.html

Ritprogrammet ska vara förkonfigurerat för:
- Motiv: ${answers.motiv}
- Stil: ${answers.stil}
- Färgpalett: ${answers.palett}

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Canvas-baserat ritprogram med HTML5 Canvas
- Verktyg: penna, suddgummi, fyllning (bucket fill), geometriska former
- Förvalda färger baserat på vald palett (visa 8-12 färgknappar)
- Penseltjocklek-slider
- Ångra/Gör om (undo/redo, minst 20 steg)
- Spara/Ladda ned bild-knapp (as PNG)
- En inspirationsbild eller startritning som matchar motivet (ritad med canvas, inte bild)
- Stort canvas-område, alla knappar längs sidorna, touch-vänligt

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'filmstudio':
      return `Du är Kompisen! Skapa en komplett interaktiv serietidning/film i HTML och spara som /workspace/${name}.html

Berättelsen ska vara:
- Genre: ${answers.genre}
- Hjälte: ${answers.halte} (rita som gullig figur)
- Skurk/problem: ${answers.skurk}
- Miljö: ${answers.miljo}
- Slut: ${answers.slut}

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Minst 6 serierutor som berättar en komplett historia
- Klicka/tryck för att bläddra till nästa ruta
- Varje ruta: bakgrund + karaktärer ritade med Canvas 2D + pratbubbla med text
- Animationer när man bläddrar (slide eller fade)
- Rolig bakgrundsmusik via Web Audio API
- Sista rutan: stort "SLUT!" med genre-passande avslutning
- Snyggt serietidnings-tema med ramar och popiga färger

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'kortspel':
      if (answers.speltyp === 'memory') {
        return `Svara BARA med ett JSON-objekt, inget annat. Inga förklaringar.

Baserat på dessa val, skapa ett roligt spelnamn på svenska (max 3 ord):
- Tema: ${answers.tema}
- Speltyp: Memory

Svara exakt så här (byt ut värdet för title):
{"title": "Djurminnet"}`;
      }
      return `Du är Kompisen! Skapa ett komplett kortspel i HTML och spara som /workspace/${name}.html

Spelet ska vara:
- Speltyp: ${answers.speltyp} (snap=slå ner matchande kort, toptrumps=jämför värden, gofish=fråga efter par)
- Tema: ${answers.tema} (alla kort har ikoner/emojis med detta tema)
- Svårighet: ${answers.svarighet} (lätt=8 par/få kort, lagom=12 par, svårt=16 par/fler kort)

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Vackra animerade kort (flip-animation när de vänds)
- Tydlig poängtavla och timer
- Game over-skärm med rekord och "Spela igen"-knapp
- Ljud för match, fel, vinst (Web Audio API)
- Touch-vänlig (stora klickbara kort)
- AI-motståndare om speltypen kräver det

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'bradspel':
      return `Du är Kompisen! Skapa ett komplett brädspel i HTML och spara som /workspace/${name}.html

Spelet ska vara:
- Speltyp: ${answers.speltyp}
- Tema: ${answers.tema} (bakgrund, brickor och spelpjäser matchar temat)
- Antal spelare: ${answers.spelare === '2 spelare\uD83D\uDC65' ? 2 : answers.spelare === '3 spelare\uD83D\uDC65\uD83D\uDC64' ? 3 : 4}
- Svårighet: ${answers.svarighet}

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Komplett spelbart brädspel med tur-baserat spel
- Animerade tärningar (klicka för att kasta)
- Spelpjäser som rör sig längs banan/brädet med animationer
- Tydliga spel-regler visade i ett popup-fönster
- Vinnar-animation och "Spela igen"-knapp
- Ljud för tärning, flytt, special-rutor (Web Audio API)
- Stor touch-vänlig layout

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'larospel':
      return `Du är Kompisen! Skapa ett komplett lärspel i HTML och spara som /workspace/${name}.html

Spelet ska lära ut:
- Ämne: ${answers.amne}
- Format: ${answers.format}
- Svårighet: ${answers.svarighet}

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- 10-15 frågor/uppgifter som verkligen lär ut något om ämnet
- Tydlig feedback: grön ✓ för rätt, röd ✗ för fel med rätt svar visat
- Poängsystem med stjärnor (1-3 stjärnor baserat på resultat)
- Animerade belöningar (konfetti, stjärnregn) när man klarar det
- Progress-bar som visar hur långt man kommit
- Avslutande resultatskärm med uppmuntrande text
- Stora tydliga knappar, roliga emojis, touch-vänligt

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'rostlab':
      return `Du är Kompisen! Skapa ett komplett röststudio-program i HTML och spara som /workspace/${name}.html

Röststudion ska ha:
- Förvald effekt: ${answers.effekt}
- Loopläge: ${answers.loop === 'Ja loopa\uD83D\uDD01' ? 'ja' : 'nej'}
- Antal lager: ${answers.lager === '1 röst\uD83C\uDFA4' ? 1 : answers.lager === '2 röster\uD83C\uDFA4\uD83C\uDFA4' ? 2 : 4}

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Använd MediaRecorder API + Web Audio API för inspelning och effekter
- Stor röd SPELA IN-knapp i mitten, STOPP och SPELA UPP
- Effektknappar: Robot (pitchshift ner + bitcrush), Chipmunk (pitchshift upp), Monster (pitchshift ner), Echo (delay), Reverb (convolver), Pitch Upp
- Realtidsvågform visas under inspelning (animerad linje)
- Om loopläge: fyll 4 takter, loopa sömlöst
- Om flera lager: spela in lager-för-lager, mixa tillsammans
- Ladda ned-knapp för att spara inspelningen som WAV
- Snyggt mörkt tema med neonfärger

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'animation':
      return `Du är Kompisen! Skapa en komplett animering i HTML och spara som /workspace/${name}.html

Animeringen ska visa:
- Karaktär: ${answers.karaktar}
- Bakgrund: ${answers.bakgrund}
- Rörelse: ${answers.rorelse}
- Effekter: ${answers.effekter}

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Animerad Canvas 2D-scen med karaktären som utför vald rörelse
- Bakgrunden matchar vald värld (rymden, djungeln, etc.)
- Effekterna spelar runt karaktären (konfetti regnar, stjärnor twinklar, etc.)
- Karaktären kan styras/interageras med (klick/touch triggar extra effekt)
- Spela/Pausa-knapp
- Ladda ned som GIF-knapp (enkel implementering med canvas-frames)
- Loopas sömlöst

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    case 'hemsida':
      return `Du är Kompisen! Skapa en komplett personlig hemsida i HTML och spara som /workspace/${name}.html

Hemsidan ska ha stilen:
- Stil: ${answers.stil}
- Avatar: ${answers.avatar} (rita som gullig figur med Canvas eller CSS)
- Favoriter: ${Array.isArray(answers.favoriter) ? answers.favoriter.join(', ') : answers.favoriter}
- Färgtema: ${answers.tema}

Tekniska krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Snygg personlig hemsida med: rubrik, om-mig-sektion, favoriter-sektion
- Stil matchar vald stil (cool=mörk/neon, söt=pastell/rundad, spooky=mörk/gotisk, etc.)
- Avataren ritad som en söt figur (SVG inline eller Canvas)
- Favoriterna visade som animerade kort med emojis
- Interaktivt: hovra/klicka på saker ger roliga animationer
- Mobilanpassad design (fungerar på telefon och surfplatta)
- Glad bakgrundsmusik (Web Audio, enkel melodi som kan stängas av)

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;

    default:
      return `Du är Kompisen! Skapa något coolt i HTML och spara som /workspace/${name}.html

Kategori: ${category}
Val: ${JSON.stringify(answers)}

Krav:
- EN komplett HTML-fil med all CSS och JavaScript inline
- Snyggt, interaktivt och kul för barn 9-12 år
- Inga externa resurser

Spara filen till /workspace/${name}.html — skriv inget annat, bara skapa filen!`;
  }
}
