/* de studio · boekingsmodule "Plan je shootdag"
   Er wordt niets verstuurd: na "Verstuur je aanvraag (vrijblijvend)" verschijnt het bedankscherm.
   Feiten en prijzen: TEKST.md §3 (25-9-2026). */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const mqDesktop = matchMedia('(min-width: 1024px)');
  const mqRust = matchMedia('(prefers-reduced-motion: reduce)');
  const rust = () => mqRust.matches;

  const form = $('[data-module]');
  if (!form) return;

  /* ------------------------------------------------------------
     Gegevens (excl. btw)
     Openingskorting (Nikolai 25-9): studio open vanaf 15 oktober 2026; 25% op de pakketprijs voor shootdagen t/m 31 januari 2027 (Nikolai 26-9): Dagdeel €446, Productiedag €821.
     ------------------------------------------------------------ */
  const PAKKET = {
    dagdeel: { naam: 'Dagdeel', intro: 446, standaard: 595, vol: false },
    productiedag: { naam: 'Productiedag', intro: 821, standaard: 1095, vol: true }
    // Merkdag vervallen (Nikolai 25-9): maatwerk voor grotere producties gaat op offerte
  };
  const INTRO_SHOOT_TOT = new Date(2027, 0, 31);   // laatste shootdag met openingskorting (25%)
  const OPENING = new Date(2026, 9, 15);          // eerste shootdag: de studio opent
  const periode = () => (st.d1 && st.d1 > INTRO_SHOOT_TOT ? 'standaard' : 'intro');
  const tarief = pk => PAKKET[pk][periode()];
  const VERVOLGDAG = 599;   // Productiedag en Merkdag: wat staat, blijft staan
  const ZUILEN = 299;       // grote extra set-up, opgebouwd tijdens je lunch (€299 per set-up, Nikolai 25-9)
  const KLAAR = 290;        // alles de middag of avond ervoor klaarzetten
  const TOESLAG = 200;      // alleen bij 9–15 personen; >15 op offerte; filmen kost niets extra (Nikolai 26-9)
  const MERK_VOORAF = 21;   // Merkdag: minstens drie weken vooraf
  const IN_PRIJS = 8, GROEP_MAX = 15, MAX_PERSONEN = 99, MAX_DAGEN = 5;   // >15 personen: op offerte (Nikolai 26-9)
  const SETS = {
    'creme-boog': { naam: 'Mediterrane omgeving', lidw: 'de mediterrane omgeving', beeld: 'media/treden-04-4x5.jpg', pos: '50% 50%' },
    terracotta: { naam: 'Terracotta achterwand', lidw: 'de terracotta achterwand', beeld: 'media/roze-stucwand-01-4x5.jpg', pos: '50% 50%' },
    olijfgroen: { naam: 'Olijfgroen', lidw: 'het olijfgroen', beeld: 'media/olijf-9904-2x3.jpg', pos: '50% 20%' },
    linnen: { naam: 'Zacht mediterraans', lidw: 'de set Zacht mediterraans', beeld: 'media/gordijnen-9389-2x3.jpg', pos: '50% 32%' }
  };
  const SET_ALIAS = { zuilengang: 'terracotta', 'terracotta-achterwand': 'terracotta', creme: 'creme-boog', 'linnen-gordijnen': 'linnen', olijf: 'olijfgroen' };
  const SOORT = { foto: 'Foto', film: 'Film', geluid: 'Film met geluid' };
  const LICHT = {
    daglicht: { naam: 'Daglicht', pil: 'Daglicht<small>5500–5600 K</small>', schema: 'daglicht, 5500–5600 K' },
    ochtendzon: { naam: 'Ochtendzon', pil: 'Ochtendzon', schema: 'ochtendzon' },
    avondlicht: { naam: 'Avondlicht', pil: 'Avondlicht', schema: 'avondlicht' },
    raamschaduw: { naam: 'Raamschaduw', pil: 'Raamschaduw<small>projector</small>', schema: 'raamschaduw met de projector' },
    onbekend: { naam: 'Weet ik nog niet', pil: 'Weet ik nog niet', schema: null }
  };
  const STAPNAAM = { 1: 'Je dag', 2: "Sets en extra's", 3: 'Datum en dagplan', 4: 'Gegevens' };
  const VERDER = { 1: "Verder: sets en extra's", 2: 'Verder: datum en dagplan', 3: 'Verder: je gegevens' };

  const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const DAGEN_KORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

  const st = {
    modus: 'volledig', stap: 1, verst: 1,
    pakket: 'productiedag', soort: ['foto'], personen: 6, dagen: 1,
    sets: [], licht: {}, zuilen: false, klaar: false, klaarmoment: 'middag',
    d1: null, d2: null, weg: null, slot: 1, begin: '08:00'
  };
  const vol = () => PAKKET[st.pakket].vol;          // Productiedag of Merkdag
  const zuilenAan = () => st.zuilen && vol() && st.modus === 'volledig';
  const klaarAan = () => st.klaar && vol() && st.modus === 'volledig';
  const klaarWanneer = () => st.klaarmoment === 'avond' ? 'de avond ervoor' : 'de middag ervoor';

  /* ------------------------------------------------------------
     Hulpjes
     ------------------------------------------------------------ */
  const eur = n => '€' + Math.round(n).toLocaleString('nl-NL');
  const hoofd = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const zelfde = (a, b) => !!(a && b && a.getTime() === b.getTime());
  const zelfdeMaand = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  const maandVan = d => new Date(d.getFullYear(), d.getMonth(), 1);
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  function vanIso(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }
  const lang = d => DAGEN[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()] + ' ' + d.getFullYear();
  const kort = d => DAGEN_KORT[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()] + (d.getFullYear() !== vandaag.getFullYear() ? ' ' + d.getFullYear() : '');
  function reeks(d, n) { const r = [d]; let c = d; while (r.length < n) { c = plus(c, 1); if (c.getDay() !== 0) r.push(c); } return r; }
  const lijstUit = (q, k) => q.getAll(k).join(',').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const vandaag = new Date(); vandaag.setHours(0, 0, 0, 0);
  const max = new Date(vandaag); max.setFullYear(max.getFullYear() + 1);
  // Vroegst kiesbare dag: morgen, of bij de Merkdag pas na drie weken
  const minDag = () => { const m = plus(vandaag, st.pakket === 'merkdag' ? MERK_VOORAF : 1); return m < OPENING ? new Date(OPENING) : m; };
  const kiesbaar = d => d >= minDag() && d <= max && d.getDay() !== 0;

  function zetRadio(naam, waarde) {
    $$('input[name="' + naam + '"]', form).forEach(i => { i.checked = i.value === waarde; });
  }
  // foto, film en film met geluid mogen samen (Nikolai 26-9)
  function zetSoort() {
    $$('input[name="soort"]', form).forEach(i => { i.checked = st.soort.indexOf(i.value) >= 0; });
    $('#geluid').checked = st.soort.indexOf('geluid') >= 0;
  }
  function soortTekst() {
    const s = ['foto', 'film', 'geluid'].filter(k => st.soort.indexOf(k) >= 0).map((k, i) => i ? SOORT[k].toLowerCase() : SOORT[k]);
    if (!s.length) return 'Foto of film nog kiezen';
    return s.length === 1 ? s[0] : s.slice(0, -1).join(', ') + ' en ' + s[s.length - 1];
  }

  /* ------------------------------------------------------------
     Kopbalk: weg bij omlaag scrollen, terug bij omhoog (zoals de homepage)
     ------------------------------------------------------------ */
  const kop = $('[data-kop]');
  let laatsteY = window.scrollY, kopTik = false;
  function kopBijwerken() {
    const y = window.scrollY;
    kop.classList.toggle('is-gescrold', y > 4);
    if (y > laatsteY + 6 && y > 140) kop.classList.add('is-weg');
    else if (y < laatsteY - 6 || y <= 140) kop.classList.remove('is-weg');
    laatsteY = y; kopTik = false;
  }
  window.addEventListener('scroll', () => { if (!kopTik) { kopTik = true; requestAnimationFrame(kopBijwerken); } }, { passive: true });
  kopBijwerken();
  const kopHoogte = () => kop.getBoundingClientRect().height;

  /* ------------------------------------------------------------
     Elementen
     ------------------------------------------------------------ */
  const stappen = $$('.stap', form);
  const snelSectie = $('[data-snel]', form);
  const voortgang = $('[data-voortgang]', form);
  const voortgangMobiel = $('[data-voortgang-mobiel]', form);
  const knopVerder = $('[data-volgende-stap]', form);
  const knopVorige = $('[data-vorige-stap]', form);
  const knopVerstuur = $('[data-verstuur]', form);
  const verstuurMicro = $('[data-verstuur-micro]', form);
  const jd = $('[data-jd]');
  const balk = $('[data-jdbalk]');

  /* ------------------------------------------------------------
     Kalendermaand om mee te beginnen
     ------------------------------------------------------------ */
  function beginMaand() {
    // Zijn er in de eerste maand nog maar een paar dagen te kiezen? Begin dan bij de volgende maand.
    const m = minDag();
    let n = 0, d = new Date(m);
    while (d.getMonth() === m.getMonth()) { if (d.getDay() !== 0) n++; d = plus(d, 1); }
    return n < 8 ? new Date(m.getFullYear(), m.getMonth() + 1, 1) : maandVan(m);
  }
  let toon = beginMaand();

  /* ------------------------------------------------------------
     Pakket wisselen
     ------------------------------------------------------------ */
  function zetPakket(p) {
    st.pakket = p;
    if (!vol()) { st.dagen = 1; st.zuilen = false; st.klaar = false; }
    // Een dag die niet meer kan (Merkdag binnen drie weken) valt weg, met uitleg in stap 3
    st.weg = null;
    if (st.d1 && !kiesbaar(st.d1)) { st.weg = st.d1; st.d1 = null; }
    if (st.d2 && !kiesbaar(st.d2)) st.d2 = null;
    const m = maandVan(minDag());
    if (toon < m) { toon = m; focusDag = null; }
  }

  /* ------------------------------------------------------------
     URL-parameters: ?pakket= ?extra=zuilen|klaarzetten ?set= ?datum=
     ------------------------------------------------------------ */
  let focusDag = null;
  (function leesUrl() {
    const q = new URLSearchParams(location.search);
    const p = (q.get('pakket') || '').toLowerCase();
    if (PAKKET[p]) { zetPakket(p); toon = beginMaand(); }
    if (vol()) {
      lijstUit(q, 'extra').forEach(e => {
        if (e === 'zuilen' || e === 'zuilen-setup' || e.indexOf('doektent') === 0) st.zuilen = true;
        if (e === 'klaarzetten' || e === 'klaar') st.klaar = true;
      });
    }
    lijstUit(q, 'set').forEach(k => {
      k = SET_ALIAS[k] || k;
      if (SETS[k] && st.sets.indexOf(k) < 0) st.sets.push(k);
    });
    const d = vanIso(q.get('datum'));
    if (d && kiesbaar(d)) { st.d1 = d; toon = maandVan(d); }
    else if (d && st.pakket === 'merkdag' && d > vandaag && d < minDag()) st.weg = d;
  })();

  function invoerGelijkzetten() {
    zetRadio('pakket', st.pakket);
    zetSoort();
    zetRadio('begin', st.begin);
    $$('input[name="set"]', form).forEach(i => { i.checked = st.sets.indexOf(i.value) >= 0; });
    $$('input[name^="licht-"]', form).forEach(i => { i.checked = st.licht[i.name.slice(6)] === i.value; });
    $('#zuilen').checked = st.zuilen;
    $('#klaar').checked = st.klaar;
    zetRadio('klaarmoment', st.klaarmoment);
    $('#personen').value = st.personen;
    $('#dagen').value = st.dagen;
  }

  /* ------------------------------------------------------------
     Invoer → toestand
     ------------------------------------------------------------ */
  const grenzen = naam => naam === 'personen' ? [1, MAX_PERSONEN] : [1, vol() ? MAX_DAGEN : 1];
  function zetTeller(naam, waarde, schrijf) {
    const [lo, hi] = grenzen(naam);
    let n = parseInt(waarde, 10);
    if (isNaN(n)) n = st[naam];
    n = Math.max(lo, Math.min(hi, n));
    st[naam] = n;
    if (schrijf) $('#' + naam).value = n;
  }

  form.addEventListener('change', e => {
    const t = e.target;
    if (t.name && t.name.indexOf('licht-') === 0) { st.licht[t.name.slice(6)] = t.value; teken(); return; }
    switch (t.name) {
      case 'pakket': zetPakket(t.value); invoerGelijkzetten(); break;
      case 'soort': case 'geluid': {
        const k = t.name === 'geluid' ? 'geluid' : t.value;
        st.soort = st.soort.filter(x => x !== k);
        if (t.checked) st.soort.push(k);
        zetSoort(); break;
      }
      case 'set':
        if (t.checked) { if (st.sets.indexOf(t.value) < 0) st.sets.push(t.value); }
        else st.sets = st.sets.filter(k => k !== t.value);
        break;
      case 'zuilen': st.zuilen = t.checked && vol(); break;
      case 'klaar': st.klaar = t.checked && vol(); break;
      case 'klaarmoment': st.klaarmoment = t.value; break;
      case 'begin': st.begin = t.value; break;
      case 'personen': case 'dagen': zetTeller(t.name, t.value, true); break;
      default: return;
    }
    teken();
  });

  form.addEventListener('input', e => {
    const t = e.target;
    if (t.name === 'personen' || t.name === 'dagen') {
      const n = parseInt(t.value, 10);
      const [lo, hi] = grenzen(t.name);
      if (!isNaN(n) && n >= lo && n <= hi) { st[t.name] = n; teken(); }
      return;
    }
    // Een fout verdwijnt zodra het veld klopt
    const p = $('[data-fout="' + t.id + '"]', form);
    if (p && !p.hidden) {
      const f = fouten(['gegevens']).filter(x => x[0] === t.id);
      if (!f.length) zetFout(t.id, null); else if (f[0][1] !== p.textContent) zetFout(t.id, f[0][1]);
    }
  });

  // Enter in een teller zet de waarde vast in plaats van het formulier te versturen
  $$('.teller__getal', form).forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); zetTeller(inp.name, inp.value, true); teken(); }
    });
  });

  form.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || !form.contains(b)) return;
    if (b.dataset.teller) {
      const naam = b.dataset.teller;
      zetTeller(naam, st[naam] + parseInt(b.dataset.stapWaarde, 10), true);
      teken();
    } else if (b.dataset.kiesPakket) {
      zetPakket(b.dataset.kiesPakket); invoerGelijkzetten(); teken();
      $('#zuilen').focus({ preventScroll: true });
    } else if (b.dataset.slot) {
      st.slot = +b.dataset.slot;
      const d = st.slot === 2 ? (st.d2 || st.d1) : st.d1;
      if (d) { toon = maandVan(d); focusDag = d; }
      teken();
    } else if (b.hasAttribute('data-wis-tweede-knop')) {
      st.d2 = null; st.slot = 1; teken();
    } else if (b.dataset.ga) {
      const n = +b.dataset.ga;
      if (n !== st.stap && n <= st.verst) naarStap(n);
    } else if (b.hasAttribute('data-volgende-stap')) {
      naarStap(st.stap + 1);
    } else if (b.hasAttribute('data-vorige-stap')) {
      naarStap(st.stap - 1);
    } else if (b.hasAttribute('data-naar-snel')) {
      zetModus('snel');
    } else if (b.hasAttribute('data-naar-volledig')) {
      zetModus('volledig');
    }
  });

  /* ------------------------------------------------------------
     Datumkiezer (zelfde look en toetsen als op de homepage)
     ------------------------------------------------------------ */
  const kal = $('[data-kalender]', form);
  const maandEl = $('[data-maand]', kal), dagenEl = $('[data-dagen]', kal);
  const vorigeMaand = $('[data-vorige]', kal), volgendeMaand = $('[data-volgende]', kal);

  function eersteKiesbaar(maand) {
    let d = new Date(maand.getFullYear(), maand.getMonth(), 1);
    while (d.getMonth() === maand.getMonth()) { if (kiesbaar(d)) return d; d = plus(d, 1); }
    return null;
  }
  function tekenKalender(focus) {
    maandEl.textContent = hoofd(MAANDEN[toon.getMonth()]) + ' ' + toon.getFullYear();
    const actief = st.slot === 2 ? (st.d2 || null) : st.d1;
    if (!focusDag || !zelfdeMaand(focusDag, toon) || !kiesbaar(focusDag)) {
      focusDag = (actief && zelfdeMaand(actief, toon)) ? actief : (st.d1 && zelfdeMaand(st.d1, toon) ? st.d1 : eersteKiesbaar(toon));
    }
    const extra = st.d1 && st.dagen > 1 ? reeks(st.d1, st.dagen).slice(1) : [];
    const merkGrens = st.pakket === 'merkdag' ? minDag() : null;
    const start = (toon.getDay() + 6) % 7; // maandag eerst
    const aantal = new Date(toon.getFullYear(), toon.getMonth() + 1, 0).getDate();
    let html = '<tr>', cel = 0;
    for (let i = 0; i < start; i++) { html += '<td></td>'; cel++; }
    for (let dag = 1; dag <= aantal; dag++) {
      const d = new Date(toon.getFullYear(), toon.getMonth(), dag);
      const ok = kiesbaar(d);
      const is1 = zelfde(d, st.d1), is2 = zelfde(d, st.d2), isR = extra.some(x => zelfde(x, d));
      const teVroeg = merkGrens && d > vandaag && d < merkGrens && d.getDay() !== 0;
      const label = lang(d) + (is1 ? ', eerste keuze' : '') + (is2 ? ', tweede keuze' : '') + (isR ? ', vervolgdag' : '') + (teVroeg ? ', te vroeg voor een Merkdag' : '');
      html += '<td role="gridcell"><button type="button" class="dagknop' + (is2 ? ' is-tweede' : '') + (isR ? ' is-reeks' : '') + (teVroeg ? ' is-te-vroeg' : '') + '" data-iso="' + iso(d) + '" aria-label="' + label + '" aria-pressed="' + (is1 ? 'true' : 'false') + '" tabindex="' + (zelfde(d, focusDag) ? '0' : '-1') + '"' + (ok ? '' : ' disabled') + '>' + dag + '</button></td>';
      cel++;
      if (cel % 7 === 0 && dag < aantal) html += '</tr><tr>';
    }
    while (cel % 7 !== 0) { html += '<td></td>'; cel++; }
    dagenEl.innerHTML = html + '</tr>';
    vorigeMaand.disabled = toon <= maandVan(minDag());
    volgendeMaand.disabled = toon >= maandVan(max);
    if (focus && focusDag) { const b = $('[data-iso="' + iso(focusDag) + '"]', dagenEl); if (b) b.focus(); }
  }
  function kiesDag(d) {
    if (st.slot === 2) {
      if (zelfde(d, st.d2)) st.d2 = null;
      else if (!zelfde(d, st.d1)) st.d2 = d;
    } else {
      st.d1 = d; st.weg = null;
      if (zelfde(st.d2, d)) st.d2 = null;
      zetFout('datum', null);
    }
    focusDag = d;
    teken();
    const b = $('[data-iso="' + iso(d) + '"]', dagenEl); if (b) b.focus();
  }
  function verplaats(d, stap) {
    let poging = new Date(d);
    for (let i = 0; i < 60; i++) {
      poging = plus(poging, stap);
      if ((poging < minDag() && stap < 0) || (poging > max && stap > 0)) return;
      if (kiesbaar(poging)) break;
    }
    if (!kiesbaar(poging)) return;
    focusDag = poging;
    if (!zelfdeMaand(poging, toon)) toon = maandVan(poging);
    tekenKalender(true);
  }
  function maandStap(n, focus) {
    const nieuw = new Date(toon.getFullYear(), toon.getMonth() + n, 1);
    if (nieuw < maandVan(minDag()) || nieuw > maandVan(max)) return;
    toon = nieuw; focusDag = null; tekenKalender(focus);
  }
  dagenEl.addEventListener('click', e => {
    const b = e.target.closest('.dagknop'); if (!b || b.disabled) return;
    kiesDag(vanIso(b.dataset.iso));
  });
  dagenEl.addEventListener('keydown', e => {
    const b = e.target.closest('.dagknop'); if (!b) return;
    const d = vanIso(b.dataset.iso), k = e.key;
    if (k === 'ArrowRight') verplaats(d, 1);
    else if (k === 'ArrowLeft') verplaats(d, -1);
    else if (k === 'ArrowDown') verplaats(d, 7);
    else if (k === 'ArrowUp') verplaats(d, -7);
    else if (k === 'Home') { const ma = plus(d, -((d.getDay() + 6) % 7)); verplaats(plus(ma, -1), 1); }
    else if (k === 'End') { const zo = plus(d, 6 - (d.getDay() + 6) % 7); verplaats(plus(zo, 1), -1); }
    else if (k === 'PageDown') maandStap(1, true);
    else if (k === 'PageUp') maandStap(-1, true);
    else return;
    e.preventDefault();
  });
  vorigeMaand.addEventListener('click', () => maandStap(-1, false));
  volgendeMaand.addEventListener('click', () => maandStap(1, false));

  /* ------------------------------------------------------------
     Dagschema: beweegt mee met pakket, begintijd, sets, licht en extra's
     Productiedag/Merkdag: 08:00 binnen, 08:15 eerste shot, 18:00 laatste shot, afbouwen tot 20:00.
     Dagdeel: zes uur vanaf de begintijd, daarna een uur afbouwen.
     ------------------------------------------------------------ */
  const beginTijd = () => (vol() ? '08:00' : st.begin);
  function tijd(off) {
    const p = beginTijd().split(':');
    const t = +p[0] * 60 + +p[1] + off;
    return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  }
  const eindOff = () => (vol() ? 600 : 360);
  const afbouwMin = () => (vol() ? 120 : 60);

  function lichtRegel(k) {
    const l = st.licht[k];
    if (!l) return null;
    return LICHT[l].schema ? 'Licht: ' + LICHT[l].schema + ', vooraf ingesteld.' : 'Licht: stem je af met je host.';
  }
  function schema() {
    const S = [];
    const zuilen = zuilenAan();
    const lijst = st.sets.slice(0, 4);
    const naam = k => SETS[k].naam;
    const lidw = k => SETS[k].lidw;
    // Momenten per set, in minuten na binnenkomst
    const OFF = !vol() ? [15, 105, 195, 285] : zuilen ? [15, 150, 420, 510] : [15, 150, 315, 450];

    if (klaarAan()) S.push({ off: -999, woord: st.klaarmoment === 'avond' ? 'Avond' : 'Middag', avond: true, html: '<strong>' + klaarWanneer().replace(/^d/, 'D') + ':</strong> je stalt je producten uit, zodat je om 08:00 meteen begint.', kort: 'Producten uitstallen' });
    S.push({ off: 0, html: '<strong>De start van je productiedag.</strong> Sets, licht en decors staan al voor je klaar. De studio is ready to go. Onze host verwelkomt jou en je team met koffie.', kort: 'Binnenkomst' });

    if (!lijst.length) {
      S.push({ off: 15, html: '<strong>Eerste shot.</strong> Welke set eerst, bespreek je met je host.', kort: 'Eerste shot' });
    }
    lijst.forEach((k, i) => {
      S.push({ off: OFF[i], licht: lichtRegel(k),
        html: i === 0 ? '<strong>Eerste shot</strong> op ' + lidw(k) + '.' : '<strong>Door naar ' + lidw(k) + '.</strong>' + (i === 1 ? ' Die staat al opgesteld; er is geen opbouw nodig.' : ''),
        kort: i === 0 ? 'Eerste shot, ' + naam(k).toLowerCase() : naam(k) });
    });

    if (vol()) {
      if (zuilen) {
        S.push({ off: 270, bouw: true, html: '<strong>Lunch.</strong> Wij bouwen je extra set-up.',
          label: 'wij bouwen je extra set-up <span>' + tijd(270) + '–' + tijd(315) + '</span>',
          kort: 'Lunch, wij bouwen je extra set-up' });
        S.push({ off: 315, html: '<strong>Verder op je extra set-up.</strong> Die staat klaar als je terugkomt.', kort: 'Extra set-up' });
      } else {
        S.push({ off: 270, html: '<strong>Lunch.</strong>', kort: 'Lunch' });
      }
    }

    const eind = eindOff(), af = afbouwMin();
    S.push({ off: eind, bouw: true,
      html: '<strong>Laatste shot.</strong> Daarna ' + (vol() ? 'twee uur' : 'een uur') + ' om af te bouwen en in te pakken, zonder overuren.',
      label: 'afbouwtijd, inbegrepen <span>' + tijd(eind) + '–' + tijd(eind + af) + '</span>',
      kort: 'Laatste shot, daarna afbouwen' });
    S.push({ off: eind + af, html: '<strong>Einde.</strong> Alles is ingepakt, je host sluit af.', kort: 'Einde afbouwtijd' });

    S.sort((a, b) => a.off - b.off);
    S.forEach(x => { x.tijd = x.woord || tijd(x.off); });
    return S;
  }
  function tekenSchema() {
    const S = schema();
    $('[data-schema]', form).innerHTML = S.map(x =>
      '<li class="sm' + (x.bouw ? ' sm--bouw' : '') + (x.avond ? ' sm--avond' : '') + '">' +
      '<span class="sm__tijd' + (x.woord ? ' sm__tijd--woord' : '') + '">' + x.tijd + '</span>' +
      '<div><p class="sm__tekst">' + x.html + '</p>' +
      (x.label ? '<p class="sm__label">' + x.label + '</p>' : '') +
      (x.licht ? '<span class="sm__licht">' + x.licht + '</span>' : '') +
      '</div></li>').join('');
    $('[data-jd-schema]').innerHTML = S.map(x =>
      '<li class="' + (x.bouw ? 'is-bouw' : '') + (x.woord ? ' is-woord' : '') + '"><span>' + x.tijd + '</span><span>' + x.kort + '</span></li>').join('');
  }

  /* ------------------------------------------------------------
     Lichtwens per gekozen set (alleen opnieuw opbouwen als de sets veranderen)
     ------------------------------------------------------------ */
  let lwSleutel = null;
  function tekenLichtwensen() {
    const sleutel = st.sets.join(',');
    if (sleutel === lwSleutel) return;
    lwSleutel = sleutel;
    const box = $('[data-lichtwensen]', form);
    if (!st.sets.length) {
      box.innerHTML = '<p class="lw__leeg">Kies hierboven een of meer sets. Dan kies je hier per set het licht.</p>';
      return;
    }
    box.innerHTML = st.sets.map(k =>
      '<div class="lw" role="radiogroup" aria-labelledby="lw-' + k + '">' +
      '<p class="lw__kop" id="lw-' + k + '"><img src="' + SETS[k].beeld + '" alt="" width="28" height="35" style="object-position:' + SETS[k].pos + '"><span>' + SETS[k].naam + '</span></p>' +
      '<div class="pillen pillen--licht">' + Object.keys(LICHT).map(l =>
        '<label class="pil"><input type="radio" name="licht-' + k + '" value="' + l + '"' + (st.licht[k] === l ? ' checked' : '') + '><span>' + LICHT[l].pil + '</span></label>').join('') +
      '</div></div>').join('');
  }

  /* ------------------------------------------------------------
     Prijsindicatie: pakket + vervolgdagen × €599 + extra's + toeslag
     ------------------------------------------------------------ */
  function prijs() {
    const regels = [];
    let totaal = tarief(st.pakket);
    regels.push([PAKKET[st.pakket].naam, eur(totaal)]);
    const n = st.dagen - 1;
    if (n > 0) {
      regels.push([n + (n === 1 ? ' vervolgdag' : ' vervolgdagen') + (n > 1 ? ', ' + n + ' × ' + eur(VERVOLGDAG) : ''), eur(VERVOLGDAG * n)]);
      totaal += VERVOLGDAG * n;
    }
    const ns = st.modus === 'volledig' ? st.sets.length : 0;
    regels.push([ns === 0 || ns === 4 ? 'Alle sets' : ns + (ns === 1 ? ' set' : ' sets'), 'inbegrepen', true]);
    if (zuilenAan()) { regels.push(['Grote extra set-up', eur(ZUILEN)]); totaal += ZUILEN; }
    if (klaarAan()) { regels.push(['Producten uitstallen ' + klaarWanneer(), eur(KLAAR)]); totaal += KLAAR; }
    const groot = st.personen > IN_PRIJS;
    if (st.personen > GROEP_MAX) {
      regels.push(['Groot team, ' + st.personen + ' personen', 'op offerte', true]);
    } else if (groot) {
      const reden = st.personen + ' personen';
      regels.push(['Toeslag ' + reden + (st.dagen > 1 ? ', ' + st.dagen + ' × ' + eur(TOESLAG) : ''), eur(TOESLAG * st.dagen)]);
      totaal += TOESLAG * st.dagen;
    }
    return { regels, totaal };
  }

  /* ------------------------------------------------------------
     Jouw dag
     ------------------------------------------------------------ */
  function tijdenTekst() {
    const eind = eindOff();
    return tijd(0) + '–' + tijd(eind) + ', afbouwen tot ' + tijd(eind + afbouwMin());
  }
  // paneel = compact (Jouw dag); anders één regel per onderwerp (bedankscherm)
  function rijen(paneel) {
    const R = [];
    const volledig = st.modus === 'volledig';
    const productie = soortTekst() + ' · ' + st.personen + (st.personen === 1 ? ' persoon' : ' personen') + ' · ' + st.dagen + (st.dagen === 1 ? ' dag' : ' dagen');
    const toonTijd = volledig && (st.stap >= 3 || !vol() || !paneel);
    if (paneel) R.push(['Pakket', PAKKET[st.pakket].naam + '<span class="jd__zacht">' + productie + '</span>']);
    else { R.push(['Pakket', PAKKET[st.pakket].naam]); R.push(['Productie', productie]); }
    if (volledig) {
      if (st.sets.length) {
        R.push(['Sets', '<span class="jd__duimen" aria-hidden="true">' + st.sets.map(k => '<img src="' + SETS[k].beeld + '" alt="" width="28" height="35" style="object-position:' + SETS[k].pos + '">').join('') + '</span>' +
          st.sets.map(k => '<span class="jd__set">' + SETS[k].naam + (st.licht[k] ? '<span class="jd__licht"> · ' + LICHT[st.licht[k]].naam.toLowerCase() + '</span>' : '') + '</span>').join('') +
          '<span class="jd__zacht">inbegrepen bij de prijs</span>']);
      }
      const ex = [];
      if (zuilenAan()) ex.push('Grote extra set-up<span class="jd__zacht">opgebouwd tijdens je lunch</span>');
      if (klaarAan()) ex.push('Producten uitstallen<span class="jd__zacht">' + klaarWanneer() + '</span>');
      if (ex.length) R.push(["Extra's", ex.join('')]);
      if (st.pakket === 'merkdag') R.push(['Merk', 'Wanden in je merkkleur<span class="jd__zacht">plus een custom set, af te stemmen</span>']);
    }
    if (st.d1) {
      const datum = hoofd(paneel ? kort(st.d1) : lang(st.d1)) + (st.dagen > 1 ? ', ' + st.dagen + ' dagen' : '');
      const tweede = st.d2 ? '<span class="jd__zacht">Tweede keuze: ' + (paneel ? kort(st.d2) : lang(st.d2)) + '</span>' : '';
      R.push(['Datum', datum + tweede + (paneel && toonTijd ? '<span class="jd__zacht">' + tijdenTekst() + '</span>' : '')]);
    }
    if (toonTijd && (!paneel || !st.d1)) R.push(['Tijden', tijdenTekst()]);
    return R;
  }
  const dl = R => R.map(r => '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>').join('');

  function tekenJouwDag() {
    $('[data-jd-lijst]').innerHTML = dl(rijen(true));
    const pr = prijs();
    $('[data-jd-regels]').innerHTML = pr.regels.map(r => '<li' + (r[2] ? ' class="jd__regel-zacht"' : '') + '><span>' + r[0] + '</span><span>' + r[1] + '</span></li>').join('');
    $('[data-jd-totaal]').textContent = eur(pr.totaal);
    let noot;
    if (periode() === 'intro') noot = 'Openingskorting: 25% op de pakketprijs voor shootdagen tot en met 31 januari 2027.';
    else noot = 'Je shootdag valt na januari 2027, dus je ziet de standaardprijs.';
    $('[data-jd-noot]').textContent = noot + ' Je ziet alles vooraf in onze bevestiging: wat we afspreken, is wat je betaalt.';
    // In stap 3 staat het dagschema al groot in beeld; in de korte variant is er nog geen schema
    $('[data-jd-schema-blok]').hidden = st.modus === 'snel' || st.stap === 3;
    $('.jd__subkop').textContent = st.dagen > 1 ? 'Voorlopig dagschema, dag 1' : 'Voorlopig dagschema';
    // mobiele balk
    $('[data-jdbalk-sub]').textContent = PAKKET[st.pakket].naam + (st.d1 ? ' · ' + kort(st.d1) : '') + (st.sets.length && st.modus === 'volledig' ? ' · ' + st.sets.length + (st.sets.length === 1 ? ' set' : ' sets') : '');
    $('[data-jdbalk-bedrag]').textContent = eur(pr.totaal);
  }

  /* ------------------------------------------------------------
     Alles bijwerken
     ------------------------------------------------------------ */
  function teken() {
    const volledig = st.modus === 'volledig';
    const dd = !vol();

    // stappen en voortgang
    stappen.forEach(s => { s.hidden = !volledig || +s.dataset.stap !== st.stap; });
    snelSectie.hidden = volledig;
    voortgang.hidden = !volledig;
    voortgangMobiel.hidden = !volledig;
    $$('[data-ga]', voortgang).forEach(b => {
      const n = +b.dataset.ga;
      b.classList.toggle('is-nu', n === st.stap);
      b.classList.toggle('is-klaar', n !== st.stap && n <= st.verst);
      b.disabled = n > st.verst;
      if (n === st.stap) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    voortgangMobiel.innerHTML = 'Stap ' + st.stap + ' van 4 · <span>' + STAPNAAM[st.stap] + '</span>';

    // navigatie
    const laatste = !volledig || st.stap === 4;
    knopVerder.hidden = laatste;
    if (!laatste) knopVerder.textContent = VERDER[st.stap];
    knopVerstuur.hidden = !laatste;
    verstuurMicro.hidden = !laatste;
    knopVorige.hidden = !volledig || st.stap === 1;

    // stap 1: pakketprijzen volgen de gekozen datum (openingskorting of standaard)
    $$('input[name="pakket"]', form).forEach(r => {
      const vlak = r.closest('.pk');
      $('.pk__bedrag', vlak).textContent = eur(tarief(r.value));
      const na = $('.pk__na', vlak);
      if (na) na.hidden = periode() !== 'intro';
    });
    const groot = st.personen > IN_PRIJS;
    let hs = 'Kies alles wat je die dag gaat doen. Filmen kost niets extra.';
    if (st.soort.indexOf('geluid') >= 0) hs += ' Met geluid bouwen we alles vooraf, dan klinkt er tijdens je takes geen hamer of boor.';
    $('[data-hint-soort]').textContent = hs;
    let hp = st.personen > GROEP_MAX ? 'Meer dan 15 mensen: in verband met verzekering en veiligheid spreken we dat af in een offerte op maat.' : groot ? 'Met 9 tot 15 mensen komt er €200 per dag bij.' : 'Tot 8 zit in je dagprijs.';
    $('[data-hint-personen]').textContent = hp;
    let hd;
    if (dd) hd = 'Een Dagdeel is één blok van zes uur. Vervolgdagen horen bij de Productiedag.';
    else if (st.dagen === 1) hd = 'Eén dag is tien uur productietijd, van 08:00 tot 18:00. Elke vervolgdag kost ' + eur(VERVOLGDAG) + '.';
    else hd = 'Elke vervolgdag kost ' + eur(VERVOLGDAG) + ': wat staat, blijft staan, dus je betaalt geen opbouw opnieuw.';
    if (!dd && st.dagen >= MAX_DAGEN) hd += ' Meer dagen? Zet het in je bericht.';
    $('[data-hint-dagen]').textContent = hd;
    $('[data-teller-dagen]').classList.toggle('is-vast', dd);
    $('#dagen').disabled = dd;
    $('[data-eenheid-personen]').textContent = st.personen === 1 ? 'persoon' : 'personen';
    $('[data-eenheid-dagen]').textContent = st.dagen === 1 ? 'dag' : 'dagen';
    $$('[data-teller]', form).forEach(b => {
      const [lo, hi] = grenzen(b.dataset.teller);
      const v = st[b.dataset.teller], stap = +b.dataset.stapWaarde;
      b.disabled = (stap < 0 && v <= lo) || (stap > 0 && v >= hi);
    });

    // stap 2: sets, licht, extra's
    $$('input[name="set"]', form).forEach(i => {
      const n = st.sets.indexOf(i.value);
      i.closest('.settegel').querySelector('.settegel__vink').textContent = n >= 0 ? String(n + 1) : '';
    });
    $('[data-advies-merk]').hidden = st.pakket !== 'merkdag';
    tekenLichtwensen();
    ['zuilen', 'klaar'].forEach(k => {
      const inp = $('#' + k);
      inp.disabled = dd;
      inp.checked = dd ? false : st[k];
      inp.closest('.ex').classList.toggle('is-uit', dd);
    });
    $('[data-hint-extras]').textContent = dd ? 'Bij de Productiedag.' : 'Bij de Productiedag. Vaste prijs, excl. btw.';
    $('[data-advies-dagdeel]').hidden = !dd;
    $('[data-klaarmoment]').hidden = dd || !st.klaar;

    // stap 3: datum
    const w1 = $('[data-slot-waarde="1"]'), w2 = $('[data-slot-waarde="2"]');
    $('[data-slot-label="1"]').textContent = st.dagen > 1 ? 'Eerste dag' : 'Eerste keuze';
    w1.textContent = st.d1 ? hoofd(kort(st.d1)) : 'Kies een dag';
    w1.classList.toggle('is-leeg', !st.d1);
    w2.textContent = st.d2 ? hoofd(kort(st.d2)) : 'Mag leeg';
    w2.classList.toggle('is-leeg', !st.d2);
    $$('[data-slot]', form).forEach(b => b.setAttribute('aria-pressed', +b.dataset.slot === st.slot ? 'true' : 'false'));
    let keuze = 'Nog geen dag gekozen.';
    if (st.d1) keuze = st.dagen > 1 ? 'Je kiest ' + st.dagen + ' dagen vanaf ' + lang(st.d1) + '.' : 'Je kiest ' + lang(st.d1) + '.';
    if (st.d2) keuze += ' Tweede keuze: ' + lang(st.d2) + '.';
    if (st.slot === 2 && !st.d2) keuze = 'Kies je tweede dag in de kalender.';
    $('[data-keuze]', form).textContent = keuze;
    $('[data-wis-tweede]', form).hidden = !st.d2;
    const merk = $('[data-advies-merkdag]', form);
    if (st.pakket === 'merkdag') {
      let t = 'Een Merkdag vraag je minstens drie weken vooraf aan. Dan staan je merkkleur en je custom set op tijd klaar. Je kunt kiezen vanaf ' + lang(minDag()) + '.';
      if (st.weg) t = hoofd(lang(st.weg)) + ' is binnen drie weken, te kort voor een Merkdag. ' + t;
      merk.textContent = t;
      merk.hidden = false;
    } else merk.hidden = true;

    // stap 3: tijden
    $('[data-tijden-kop]').textContent = dd ? 'Hoe laat begin je?' : 'Je tijden';
    $('[data-tijden-hint]').textContent = dd
      ? 'Je hebt zes uur productietijd vanaf je begintijd. Daarna een uur afbouwtijd, inbegrepen.'
      : 'Je komt om 08:00 binnen en maakt om 08:15 je eerste shot. Om 18:00 is je laatste shot. Tot 20:00 heb je afbouwtijd, inbegrepen.';
    $('[data-begin-pillen]').hidden = !dd;

    tekenKalender(false);
    tekenSchema();
    tekenJouwDag();
  }

  /* ------------------------------------------------------------
     Stappen
     ------------------------------------------------------------ */
  function binnenkomen(el) {
    if (rust()) return;
    el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in');
  }
  function naarBoven(doel) {
    const y = doel.getBoundingClientRect().top + window.scrollY - kopHoogte() - 24;
    if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y), behavior: rust() ? 'auto' : 'smooth' });
  }
  function naarStap(n) {
    if (n < 1 || n > 4) return;
    if (n > st.stap) {
      // Alleen stap 3 heeft een verplicht veld: de datum
      if (st.stap <= 3 && n > 3 && !st.d1) {
        if (st.stap !== 3) { st.stap = 3; st.verst = Math.max(st.verst, 3); teken(); binnenkomen(stappen[2]); }
        toonFouten(fouten(['datum']), ['datum']);
        return;
      }
    }
    st.stap = n;
    st.verst = Math.max(st.verst, n);
    teken();
    const sec = stappen[n - 1];
    binnenkomen(sec);
    $('h2', sec).focus({ preventScroll: true });
    naarBoven(voortgang);
  }

  /* ------------------------------------------------------------
     Korte variant: alleen je datum doorgeven
     De velden verhuizen, zodat alles wat je invult bewaard blijft.
     ------------------------------------------------------------ */
  const delen = ['datum', 'personen', 'soort', 'gegevens'].map(k => {
    const el = $('[data-deel="' + k + '"]', form);
    const anker = document.createComment(k);
    el.parentNode.insertBefore(anker, el);
    return { k, el, anker, plek: $('[data-plek="' + k + '"]', form) };
  });
  function zetModus(m) {
    if (m === st.modus) return;
    st.modus = m;
    const snel = m === 'snel';
    delen.forEach(d => { if (snel) d.plek.appendChild(d.el); else d.anker.parentNode.insertBefore(d.el, d.anker.nextSibling); });
    if (snel) st.slot = 1;
    $('[data-intro-sub]').hidden = snel;
    $('[data-intro-snel]').hidden = !snel;
    $('[data-naar-snel]').hidden = snel;
    $('[data-naar-volledig]').hidden = !snel;
    teken();
    const doel = snel ? snelSectie : stappen[st.stap - 1];
    binnenkomen(doel);
    (snel ? $('[data-naar-volledig]') : $('[data-naar-snel]')).focus({ preventScroll: true });
    naarBoven($('.bk-intro'));
  }

  /* ------------------------------------------------------------
     Controle: vriendelijk, per veld
     ------------------------------------------------------------ */
  const VELDEN = { datum: ['datum'], gegevens: ['naam', 'bedrijf', 'email', 'telefoon'] };
  function fouten(delenLijst) {
    const f = [];
    if (delenLijst.indexOf('datum') >= 0 && !st.d1) f.push(['datum', 'Kies nog even een dag, dan kijken wij of hij vrij is.']);
    if (delenLijst.indexOf('gegevens') >= 0) {
      const v = id => $('#' + id).value.trim();
      if (!v('naam')) f.push(['naam', 'Vul nog even je naam in.']);
      if (!v('bedrijf')) f.push(['bedrijf', 'Vul nog even je bedrijf in. We werken alleen voor bedrijven.']);
      const m = v('email');
      if (!m) f.push(['email', 'Vul nog even je e-mailadres in, dan kunnen we je antwoorden.']);
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) f.push(['email', 'Dit e-mailadres klopt nog niet. Kijk het even na.']);
      const t = v('telefoon');
      if (!t) f.push(['telefoon', 'Vul nog even je telefoonnummer in, dan kunnen we je bellen over de planning.']);
      else if (t.replace(/\D/g, '').length < 8) f.push(['telefoon', 'Dit telefoonnummer lijkt nog niet compleet.']);
    }
    return f;
  }
  function zetFout(k, tekst) {
    const p = $('[data-fout="' + k + '"]', form);
    if (!p) return;
    const inp = k === 'datum' ? null : $('#' + k);
    if (tekst) {
      p.textContent = tekst; p.hidden = false;
      if (inp) { inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', p.id); }
    } else {
      p.textContent = ''; p.hidden = true;
      if (inp) { inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); }
    }
  }
  function toonFouten(f, velden) {
    velden.forEach(k => zetFout(k, null));
    f.forEach(x => zetFout(x[0], x[1]));
    if (!f.length) return;
    const eerste = f[0][0];
    if (eerste === 'datum') {
      const b = $('.dagknop[tabindex="0"]', dagenEl) || $('[data-slot="1"]', form);
      naarBoven($('[data-deel="datum"]'));
      if (b) b.focus({ preventScroll: true });
    } else {
      const inp = $('#' + eerste);
      inp.focus({ preventScroll: true });
      const y = inp.getBoundingClientRect().top + window.scrollY - kopHoogte() - 120;
      window.scrollTo({ top: Math.max(0, y), behavior: rust() ? 'auto' : 'smooth' });
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (st.modus === 'volledig' && st.stap < 4) return;
    if (st.modus === 'volledig' && !st.d1) { naarStap(3); toonFouten(fouten(['datum']), ['datum']); return; }
    const scope = st.modus === 'snel' ? ['datum', 'gegevens'] : ['gegevens'];
    const f = fouten(scope);
    toonFouten(f, scope.reduce((a, s) => a.concat(VELDEN[s]), []));
    if (f.length) return;
    bedankt();
  });

  /* ------------------------------------------------------------
     Bedankscherm
     ------------------------------------------------------------ */
  function bedankt() {
    zetSheet(false);
    const pr = prijs();
    let zin = 'We kijken of ' + lang(st.d1) + ' vrij is. Is dat zo, dan houden we hem voor je vrij tot je op onze bevestiging hebt gereageerd.';
    if (st.d2) zin += ' Is hij al bezet, dan kijken we naar je tweede keuze, ' + lang(st.d2) + '.';
    zin += ' Binnen één werkdag bevestigen we je voorstel: wat erin zit en wat het kost. Er ligt nog niets vast en je betaalt niets, tot je akkoord geeft.';
    $('[data-bedankt-zin]').textContent = zin;
    const R = rijen(false);
    R.push(['Indicatie', eur(pr.totaal) + ' excl. btw' + '<span class="jd__zacht">' + pr.regels.filter(r => !r[2]).map(r => r[0] + ' ' + r[1]).join(' · ') + '</span>']);
    R.push(['We antwoorden op', esc($('#email').value.trim())]);
    $('[data-bedankt-lijst]').innerHTML = dl(R);
    form.hidden = true;
    balk.hidden = true;
    const b = $('[data-bedankt]');
    b.hidden = false;
    window.scrollTo(0, 0);
    binnenkomen(b);
    $('#bedankt-kop').focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------
     Mobiel: "Jouw dag" klapt open vanuit de balk onderaan
     ------------------------------------------------------------ */
  function zetSheet(open) {
    jd.classList.toggle('is-open', open);
    balk.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  balk.addEventListener('click', () => {
    const open = !jd.classList.contains('is-open');
    zetSheet(open);
    if (open) $('[data-jd-sluit]').focus({ preventScroll: true });
  });
  $('[data-jd-sluit]').addEventListener('click', () => { zetSheet(false); balk.focus(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && jd.classList.contains('is-open')) { zetSheet(false); balk.focus(); }
  });
  mqDesktop.addEventListener('change', () => zetSheet(false));

  /* ------------------------------------------------------------
     Start
     ------------------------------------------------------------ */
  tekenLichtwensen();
  invoerGelijkzetten();
  teken();
})();
