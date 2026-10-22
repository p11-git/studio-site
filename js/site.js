/* de studio · site v3 · gedeeld script voor alle pagina's
   Elk onderdeel start alleen als zijn HTML op de pagina staat. */
(function () {
  'use strict';

  var doc = document.documentElement;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var mqMobiel = matchMedia('(max-width: 699px)');
  var mqDesktop = matchMedia('(min-width: 1024px)');
  var mqRust = matchMedia('(prefers-reduced-motion: reduce)');
  function rust() { return mqRust.matches; }
  function wacht(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
  function scrollNaar(el) { if (el) el.scrollIntoView({ behavior: rust() ? 'auto' : 'smooth', block: 'start' }); }
  function luister(mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }
  function gewoneKlik(e) { return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey; }

  var RUIMTES = ['hal', 'visagie', 'productie', 'ingang'];

  /* De plattegrond als tekening voor het menu De locatie (ook op pagina's zonder plattegrond-component) */
  var PLAN_MINI = '<svg class="plan" viewBox="0 80 1080 605" aria-hidden="true" focusable="false">' +
    '<g class="plan__zone" data-zone="ingang"><rect class="plan__vlak" x="22" y="100" width="100" height="500"/></g>' +
    '<g class="plan__zone" data-zone="hal"><polygon class="plan__vlak" points="130,100 970,100 970,612 890,612 890,480 820,480 820,420 500,420 500,480 130,480"/></g>' +
    '<g class="plan__zone" data-zone="visagie"><rect class="plan__vlak" x="260" y="480" width="240" height="120"/></g>' +
    '<g class="plan__zone" data-zone="productie"><rect class="plan__vlak" x="500" y="420" width="320" height="180"/></g>' +
    '<g class="plan__lijnen">' +
      '<path d="M130,100 H970 V500 M970,560 V612 H890 V480 H820 V470 M820,432 V420 H812 M508,420 H500 V480 H482 M278,480 H130 V470 M130,340 V100"/>' +
      '<path d="M260,480 V600 H278 M482,600 H518 M802,600 H820 V480 M500,480 V600"/>' +
      '<path d="M130,480 V600 H260"/><path d="M820,600 H890"/><path d="M970,480 H1066 V600 H970 V612"/><path d="M870,612 H990 V672 H870 Z"/>' +
      '<path class="plan__glas" d="M508,416.5 H812 M508,423.5 H812 M278,476.5 H482 M278,483.5 H482 M278,596.5 H482 M278,603.5 H482 M518,596.5 H802 M518,603.5 H802"/>' +
      '<path class="plan__loods" d="M22,100 H122 V600 H22 Z"/>' +
      '<path class="plan__pijl" d="M58,405 H150 M140,397 L150,405 L140,413"/>' +
    '</g>' +
    '<g class="plan__sets"><circle cx="190" cy="240" r="9"/><circle cx="560" cy="240" r="9"/><circle cx="910" cy="240" r="9"/><circle cx="315" cy="452" r="9"/></g>' +
    '<g class="plan__labels">' +
      '<g class="plan__nr" data-nr="hal"><circle cx="498" cy="335" r="17"/><text x="498" y="343">1</text></g>' +
      '<text class="plan__label" x="528" y="343">Fotostudio</text>' +
      '<text class="plan__klein" x="528" y="373">alle sets</text>' +
      '<g class="plan__nr" data-nr="visagie"><circle cx="300" cy="540" r="17"/><text x="300" y="548">2</text></g>' +
      '<text class="plan__label plan__breed" x="328" y="548">Visagieruimte</text><text class="plan__label plan__smal" x="328" y="530"><tspan x="328">Visagie-</tspan><tspan x="328" dy="38">ruimte</tspan></text>' +
      '<g class="plan__nr" data-nr="productie"><circle cx="596" cy="510" r="17"/><text x="596" y="518">3</text></g>' +
      '<text class="plan__label plan__breed" x="624" y="518">Productieruimte</text><text class="plan__label plan__smal" x="624" y="500"><tspan x="624">Productie-</tspan><tspan x="624" dy="38">ruimte</tspan></text>' +
      '<text class="plan__label plan__label--bij plan__breed" x="195" y="547" text-anchor="middle">Kleedkamer</text><text class="plan__label plan__label--bij plan__smal" x="195" y="532" text-anchor="middle"><tspan x="195">Kleed-</tspan><tspan x="195" dy="34">kamer</tspan></text><text class="plan__label plan__label--bij" x="855" y="547" text-anchor="middle">WC</text><text class="plan__label plan__label--stil" x="1018" y="548" text-anchor="middle">Keuken</text><text class="plan__label plan__label--bij" x="930" y="650" text-anchor="middle">WC’s</text>' +
      '<g class="plan__nr" data-nr="ingang"><circle cx="72" cy="470" r="17"/><text x="72" y="478">4</text></g>' +
      '<text class="plan__label plan__label--rot" x="80" y="300" transform="rotate(-90 80 300)" text-anchor="middle">Ingang</text>' +
    '</g></svg>';

  /* ------------------------------------------------------------
     Kopbalk: weg bij omlaag scrollen, terug bij omhoog
     ------------------------------------------------------------ */
  var kop = $('[data-kop]');
  if (kop) (function () {
    var laatsteY = window.scrollY, tik = false;
    function bijwerken() {
      var y = window.scrollY;
      kop.classList.toggle('is-gescrold', y > 4);
      // niet verbergen zolang er een menu open is of de toetsenbordfocus in de kopbalk staat
      if (!kop.classList.contains('heeft-mega') && !kop.contains(document.activeElement)) {
        if (y > laatsteY + 6 && y > 140) kop.classList.add('is-weg');
        else if (y < laatsteY - 6 || y <= 140) kop.classList.remove('is-weg');
      }
      laatsteY = y; tik = false;
    }
    window.addEventListener('scroll', function () { if (!tik) { tik = true; requestAnimationFrame(bijwerken); } }, { passive: true });
    kop.addEventListener('focusin', function () { kop.classList.remove('is-weg'); });
    bijwerken();
  })();

  /* ------------------------------------------------------------
     Mega-menu's: hover (120 ms), klik, Enter; Esc of wegbewegen sluit
     ------------------------------------------------------------ */
  var groepen = $$('.nav__groep');
  var open = null;          // naam van het open paneel
  var openVia = null;       // 'hover' of 'klik'
  var openTimer = null, sluitTimer = null, scrollBijOpen = 0;

  function groep(naam) { return groepen.filter(function (g) { return g.dataset.groep === naam; })[0]; }
  // Menubeelden laden pas als iemand het menu gaat gebruiken (scheelt ±0,6 MB bij het landen)
  var menuBeeldenGeladen = false;
  function laadMenuBeelden() {
    if (menuBeeldenGeladen) return;
    menuBeeldenGeladen = true;
    $$('.mega img[data-src]').forEach(function (i) { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  }
  var nav = $('.nav');
  if (nav) {
    nav.addEventListener('pointerenter', laadMenuBeelden);
    nav.addEventListener('focusin', laadMenuBeelden);
  }
  function openMega(naam, via) {
    clearTimeout(sluitTimer); clearTimeout(openTimer);
    laadMenuBeelden();
    if (open === naam) { if (via === 'klik') openVia = 'klik'; return; }
    if (open) sluitMega(false);
    var g = groep(naam); if (!g) return;
    g.querySelector('.mega').classList.add('is-open');
    g.querySelector('.nav__item').setAttribute('aria-expanded', 'true');
    if (kop) { kop.classList.add('heeft-mega'); kop.classList.remove('is-weg'); }
    open = naam; openVia = via; scrollBijOpen = window.scrollY;
  }
  function sluitMega(focusTerug) {
    if (!open) return;
    var g = groep(open);
    g.querySelector('.mega').classList.remove('is-open');
    var knop = g.querySelector('.nav__item');
    knop.setAttribute('aria-expanded', 'false');
    if (kop) kop.classList.remove('heeft-mega');
    if (focusTerug) knop.focus();
    open = null; openVia = null;
    zetMiniplan(null);
  }
  // Hover-logica: nooit direct wisselen. Wie schuin van een knop naar de links in het paneel beweegt,
  // gaat even over een andere knop; die opent pas na 200 ms en wordt afgebroken zodra de muis verder gaat.
  // Een paneel dat via hover openging, sluit 200 ms nadat de muis zijn groep verlaat (tenzij hij terugkomt).
  groepen.forEach(function (g) {
    var naam = g.dataset.groep;
    var knop = g.querySelector('.nav__item');
    var paneel = g.querySelector('.mega');
    if (!knop || !paneel) return;
    g.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !mqDesktop.matches) return;
      clearTimeout(sluitTimer); clearTimeout(openTimer);
      if (open === naam) return;
      openTimer = setTimeout(function () { openMega(naam, 'hover'); }, open ? 200 : 120);
    });
    g.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(openTimer);
      if (open && openVia === 'hover') {
        clearTimeout(sluitTimer);
        sluitTimer = setTimeout(function () { sluitMega(false); }, 200);
      }
    });
    // Sets, Zo werkt het en De locatie zijn links naar hun eigen pagina: klikken gaat naar die pagina,
    // het paneel opent met de muis (hover) of met het toetsenbord (pijl omlaag, daarna Tab door de links)
    if (knop.tagName === 'A') {
      knop.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown') return;
        e.preventDefault();
        openMega(naam, 'klik');
        var eerste = paneel.querySelector('a');
        if (eerste) eerste.focus();
      });
    } else {
      knop.addEventListener('click', function () {
        clearTimeout(openTimer);
        if (open === naam) {
          if (openVia === 'hover') { openVia = 'klik'; return; }
          sluitMega(false);
        } else openMega(naam, 'klik');
      });
    }
    g.addEventListener('focusout', function (e) {
      if (open === naam && e.relatedTarget && !g.contains(e.relatedTarget)) sluitMega(false);
    });
    paneel.addEventListener('click', function (e) {
      if (e.target.closest('a')) sluitMega(false);
    });
  });
  // Gewone links in de kopbalk (Prijzen, Voor producers) hebben geen paneel: blijft de muis daar,
  // dan sluit het open paneel via de wachttijd hierboven
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (open) { var g = groep(open); sluitMega(g.contains(document.activeElement)); }
      if (mmenuOpen()) sluitMmenu();
    }
  });
  document.addEventListener('pointerdown', function (e) {
    if (open && !e.target.closest('.nav__groep')) sluitMega(false);
  });
  window.addEventListener('scroll', function () {
    if (!open) return;
    var d = Math.abs(window.scrollY - scrollBijOpen);
    if ((openVia === 'hover' && d > 80) || d > 480) sluitMega(false);
  }, { passive: true });
  luister(mqDesktop, function () { sluitMega(false); });

  /* ------------------------------------------------------------
     Mobiel menu
     ------------------------------------------------------------ */
  var mmenu = $('[data-mmenu]');
  var menuknop = $('[data-menuknop]');
  function mmenuOpen() { return !!mmenu && !mmenu.hidden; }
  function openMmenu(groepId) {
    if (!mmenu) return;
    mmenu.hidden = false;
    doc.classList.add('menu-open');
    if (menuknop) menuknop.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { mmenu.classList.add('is-open'); });
    if (groepId) zetMmGroep(groepId);
    var sluit = $('[data-mmenu-dicht]', mmenu); if (sluit) sluit.focus();
    balkBijwerken();
  }
  function sluitMmenu(geenFocus) {
    if (!mmenu) return;
    mmenu.classList.remove('is-open');
    doc.classList.remove('menu-open');
    if (menuknop) menuknop.setAttribute('aria-expanded', 'false');
    setTimeout(function () { mmenu.hidden = true; }, rust() ? 0 : 300);
    if (!geenFocus && menuknop) menuknop.focus();
    balkBijwerken();
  }
  function zetMmGroep(id) {
    $$('.mm-groep', mmenu).forEach(function (g) {
      var k = $('button.mm-kop', g); if (!k) return;
      var aan = k.getAttribute('aria-controls') === id;
      g.classList.toggle('is-open', aan);
      k.setAttribute('aria-expanded', aan ? 'true' : 'false');
    });
  }
  if (mmenu && menuknop) {
    menuknop.addEventListener('click', function () { mmenuOpen() ? sluitMmenu() : openMmenu(); });
    mmenu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled])', mmenu).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var eerste = f[0], laatste = f[f.length - 1];
      if (e.shiftKey && document.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
      else if (!e.shiftKey && document.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
    });
    var dicht = $('[data-mmenu-dicht]', mmenu);
    if (dicht) dicht.addEventListener('click', function () { sluitMmenu(); });
    $$('button.mm-kop', mmenu).forEach(function (k) {
      k.addEventListener('click', function () {
        var id = k.getAttribute('aria-controls');
        zetMmGroep(k.getAttribute('aria-expanded') === 'true' ? null : id);
      });
    });
    $$('[data-mmenu-sluit]', mmenu).forEach(function (a) {
      a.addEventListener('click', function () { sluitMmenu(true); });
    });
    luister(mqDesktop, function (e) { if (e.matches && mmenuOpen()) sluitMmenu(true); });
  }

  /* ------------------------------------------------------------
     Hero-film (homepage)
     ------------------------------------------------------------ */
  var film = $('[data-hero-film]');
  var pauze = $('[data-pauze]');
  if (film && pauze) (function () {
    var doorGebruikerGepauzeerd = false;
    var heroInBeeld = true;
    function bron() {
      if (mqMobiel.matches) return film.dataset.srcMobiel;
      return window.innerWidth >= 1400 ? film.dataset.srcGroot : film.dataset.srcMiddel;
    }
    function zetKnop(gepauzeerd) {
      pauze.classList.toggle('is-gepauzeerd', gepauzeerd);
      pauze.setAttribute('aria-label', gepauzeerd ? 'Speel de film af' : 'Pauzeer de film');
    }
    function laad() {
      var b = bron();
      if (rust()) { film.autoplay = false; film.removeAttribute('autoplay'); }
      if (film.getAttribute('src') !== b) {
        film.classList.remove('is-klaar');
        film.setAttribute('src', b);
      }
      pauze.hidden = false;
      if (rust() && !film.dataset.gestart) { zetKnop(true); return; }
      speel();
    }
    function speel() {
      if (doorGebruikerGepauzeerd || !heroInBeeld) return;
      if (rust() && !film.dataset.gestart) return;
      var p = film.play();
      if (p && p.catch) p.catch(function () { zetKnop(true); });
    }
    film.addEventListener('playing', function () { film.classList.add('is-klaar'); zetKnop(false); });
    film.addEventListener('pause', function () { if (doorGebruikerGepauzeerd || rust()) zetKnop(true); });
    pauze.addEventListener('click', function () {
      if (film.paused) {
        doorGebruikerGepauzeerd = false; film.dataset.gestart = '1';
        var p = film.play(); if (p && p.catch) p.catch(function () {});
      } else {
        doorGebruikerGepauzeerd = true; film.pause(); zetKnop(true);
      }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          heroInBeeld = e.isIntersecting;
          if (heroInBeeld) speel(); else film.pause();
        });
      }, { threshold: 0.05 }).observe(film.parentNode);
    }
    laad();
    window.addEventListener('resize', wacht(laad, 300));
  })();

  /* ------------------------------------------------------------
     Films in de secties (22-10): video[data-film] laadt pas als hij in beeld komt.
     data-src-groot (vanaf 1400 px) / data-src-middel / data-src-mobiel (+ data-poster-mobiel, onder 700 px).
     Bij "liever geen beweging" blijft alleen het stilstaande beeld staan.
     ------------------------------------------------------------ */
  var films = $$('video[data-film]');
  if (films.length) (function () {
    function bronVan(v) {
      if (mqMobiel.matches && v.dataset.srcMobiel) return v.dataset.srcMobiel;
      if (window.innerWidth < 1400 && v.dataset.srcMiddel) return v.dataset.srcMiddel;
      return v.dataset.srcGroot;
    }
    function laadFilm(v) {
      var b = bronVan(v);
      if (!b) return;
      if (v.getAttribute('src') !== b) {
        if (mqMobiel.matches && v.dataset.posterMobiel) v.poster = v.dataset.posterMobiel;
        v.setAttribute('src', b); v.load();
      }
      if (rust()) return;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
    if ('IntersectionObserver' in window) {
      var filmIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) laadFilm(e.target); else e.target.pause(); });
      }, { rootMargin: '200px 0px' });
      films.forEach(function (v) { filmIO.observe(v); });
    } else films.forEach(laadFilm);
    // Ander formaat (tablet draaien, venster verbreden): een spelende film wisselt naar het passende bestand, zoals de hero.
    window.addEventListener('resize', wacht(function () { films.forEach(function (v) { if (!v.paused) laadFilm(v); }); }, 300));
  })();

  /* ------------------------------------------------------------
     Rustig binnenkomen van beelden en koppen
     ------------------------------------------------------------ */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !rust()) {
    var revealIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('is-in'); });

  /* ------------------------------------------------------------
     Plattegrond-component (homepage #klaar, locatie.html)
     Markup: [data-klaar] met daarin svg[data-plan] (.plan__zone[data-zone]) en
     .voordeel[data-ruimte] met .voordeel__knop. Optioneel data-standaard="hal" op [data-klaar]
     (anders staat de visagie open). Elke component op de pagina werkt zelfstandig.
     ------------------------------------------------------------ */
  var PAUZE_SVG = '<svg class="pauze__ico pauze__ico--pauze" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="2.4" height="10" rx=".6"/><rect x="9.6" y="3" width="2.4" height="10" rx=".6"/></svg><svg class="pauze__ico pauze__ico--speel" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .4.4.6.7.4l7.3-4.8c.3-.2.3-.6 0-.8L5.7 2.8c-.3-.2-.7 0-.7.4z"/></svg>';

  function maakPlattegrond(klaar) {
    var plan = $('[data-plan]', klaar);
    var voordelen = $$('.voordeel', klaar);
    if (!plan && !voordelen.length) return null;
    var inBeeld = false;
    var actief = null;

    function kleinKnop(v, gepauzeerd) {
      var b = v.parentNode.querySelector('.pauze'); if (!b) return;
      b.classList.toggle('is-gepauzeerd', gepauzeerd);
      b.setAttribute('aria-label', gepauzeerd ? 'Speel de film af' : 'Pauzeer de film');
    }
    function kleinSpeel(v) {
      if (!v.getAttribute('src') && v.dataset.src) v.setAttribute('src', v.dataset.src);
      if ((rust() && !v.dataset.gestart) || !inBeeld || v.dataset.gepauzeerd) { kleinKnop(v, true); return; }
      var p = v.play(); if (p && p.catch) p.catch(function () { kleinKnop(v, true); });
      kleinKnop(v, false);
    }
    $$('.voordeel__beeld video', klaar).forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pauze'; b.innerHTML = PAUZE_SVG;
      b.setAttribute('aria-label', 'Pauzeer de film');
      v.parentNode.appendChild(b);
      b.addEventListener('click', function () {
        if (v.paused) { delete v.dataset.gepauzeerd; v.dataset.gestart = '1'; kleinSpeel(v); }
        else { v.dataset.gepauzeerd = '1'; v.pause(); kleinKnop(v, true); }
      });
    });
    function activeer(ruimte) {
      actief = ruimte;
      voordelen.forEach(function (li) {
        var aan = li.dataset.ruimte === ruimte;
        li.classList.toggle('is-open', aan);
        var k = li.querySelector('.voordeel__knop'); if (k) k.setAttribute('aria-expanded', aan ? 'true' : 'false');
        var v = li.querySelector('video');
        if (v) { if (aan) kleinSpeel(v); else v.pause(); }
      });
      if (plan) {
        $$('.plan__zone', plan).forEach(function (z) {
          var aan = z.dataset.zone === ruimte;
          z.classList.toggle('is-actief', aan);
          z.setAttribute('aria-pressed', aan ? 'true' : 'false');
        });
        $$('.plan__nr', plan).forEach(function (n) { n.classList.toggle('is-actief', n.dataset.nr === ruimte); });
      }
    }
    // Telefoon en tablet: na het openklappen naar het geopende voordeel scrollen,
    // anders valt het onder de vouw of achter de vaste balk. Desktop: de plattegrond staat ernaast.
    function toonVoordeel(ruimte) {
      var li = $('.voordeel[data-ruimte="' + ruimte + '"]', klaar);
      if (!li) return;
      setTimeout(function () {
        li.scrollIntoView({ behavior: rust() ? 'auto' : 'smooth', block: 'nearest' });
      }, rust() ? 0 : 450);
    }
    function toon(ruimte) {
      if (mqDesktop.matches || !ruimte) scrollNaar(klaar);
      else toonVoordeel(ruimte);
    }
    voordelen.forEach(function (li) {
      var k = li.querySelector('.voordeel__knop'); if (!k) return;
      k.addEventListener('click', function () {
        activeer(actief === li.dataset.ruimte ? null : li.dataset.ruimte);
      });
    });
    if (plan) $$('.plan__zone', plan).forEach(function (z) {
      function kies() {
        activeer(z.dataset.zone);
        if (!mqDesktop.matches) toonVoordeel(z.dataset.zone);
      }
      z.addEventListener('click', kies);
      z.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kies(); }
      });
    });
    // Posters van de kleine video's pas laden als de component in de buurt komt
    function zetPosters() {
      $$('video[data-poster]', klaar).forEach(function (v) { v.setAttribute('poster', v.dataset.poster); v.removeAttribute('data-poster'); });
    }
    if ('IntersectionObserver' in window) {
      var posterIO = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { zetPosters(); posterIO.disconnect(); }
      }, { rootMargin: '800px 0px' });
      posterIO.observe(klaar);
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          inBeeld = e.isIntersecting;
          voordelen.forEach(function (li) {
            var v = li.querySelector('video'); if (!v) return;
            if (inBeeld && li.classList.contains('is-open')) kleinSpeel(v); else v.pause();
          });
        });
      }, { threshold: 0.1 }).observe(klaar);
    } else { inBeeld = true; zetPosters(); }
    // standaardruimte open, zonder uitklap-animatie (de pagina verspringt dan niet na het laden)
    klaar.classList.add('geen-anim');
    activeer(klaar.dataset.standaard || 'visagie');
    requestAnimationFrame(function () { requestAnimationFrame(function () { klaar.classList.remove('geen-anim'); }); });

    return { el: klaar, activeer: activeer, toon: toon };
  }
  var plattegronden = $$('[data-klaar]').map(maakPlattegrond).filter(Boolean);

  // Open een ruimte: staat er een plattegrond op deze pagina, dan hier; anders naar locatie.html
  function naarRuimte(ruimte) {
    if (!plattegronden.length) { location.href = 'locatie.html#' + ruimte; return; }
    plattegronden.forEach(function (p) { p.activeer(ruimte); });
    if (history.replaceState) history.replaceState(null, '', '#' + ruimte);
    plattegronden[0].toon(ruimte);
  }

  // Mini-plattegrond in het menu De locatie
  var miniHouder = $('[data-miniplan]');
  var miniplan = null;
  if (miniHouder) {
    miniHouder.innerHTML = PLAN_MINI;
    miniplan = $('svg', miniHouder);
    $$('.plan__zone', miniplan).forEach(function (z) {
      z.addEventListener('click', function () { sluitMega(false); naarRuimte(z.dataset.zone); });
      z.addEventListener('pointerenter', function () { zetMiniplan(z.dataset.zone); });
    });
  }
  function zetMiniplan(ruimte) {
    if (!miniplan) return;
    $$('.plan__zone', miniplan).forEach(function (z) { z.classList.toggle('is-licht', z.dataset.zone === ruimte); });
    $$('.plan__nr', miniplan).forEach(function (n) { n.classList.toggle('is-actief', n.dataset.nr === ruimte); });
  }
  $$('.mega [data-ruimte-link]').forEach(function (a) {
    a.addEventListener('pointerenter', function () { zetMiniplan(a.dataset.ruimteLink); });
    a.addEventListener('focus', function () { zetMiniplan(a.dataset.ruimteLink); });
    a.addEventListener('pointerleave', function () { zetMiniplan(null); });
  });

  // Links met data-ruimte-link (menu's): met een plattegrond op de pagina ter plekke openen, anders de href volgen
  document.addEventListener('click', function (e) {
    if (!gewoneKlik(e)) return;
    var a = e.target.closest('a');
    if (!a) return;
    var ruimte = a.getAttribute('data-ruimte-link');
    if (!ruimte) {
      var m = (a.getAttribute('href') || '').match(/^#klaar\?ruimte=([a-z]+)/);   // oude vorm
      if (m) ruimte = m[1];
    }
    if (ruimte && plattegronden.length) {
      e.preventDefault();
      sluitMega(false);
      if (mmenuOpen()) sluitMmenu(true);
      naarRuimte(ruimte);
      return;
    }
    var href = a.getAttribute('href') || '';
    if (/^#vraag-/.test(href)) openVraag(href.slice(1));
  });

  // Bij het laden en bij een hashwissel: #hal, #visagie, #productie, #ingang (of #klaar?ruimte=…) opent die ruimte
  function leesHash() {
    var h = '';
    try { h = decodeURIComponent((location.hash || '').slice(1)); } catch (e) { h = ''; }
    var m = h.match(/^klaar(?:\?ruimte=([a-z]+))?$/);
    var ruimte = m ? m[1] : (RUIMTES.indexOf(h) >= 0 ? h : null);
    if (plattegronden.length && (m || ruimte)) {
      if (ruimte) plattegronden.forEach(function (p) { p.activeer(ruimte); });
      // heeft de ruimte een eigen sectie (locatie.html), dan springt de browser daar zelf heen
      if (m || !document.getElementById(h)) setTimeout(function () { plattegronden[0].toon(ruimte); }, 60);
      return;
    }
    if (/^vraag-/.test(h)) openVraag(h);
  }
  window.addEventListener('hashchange', leesHash);

  /* ------------------------------------------------------------
     Accordeons ([data-accordeon] met .vraag > h3 > button)
     ------------------------------------------------------------ */
  function zetVraag(v, aan) {
    v.classList.toggle('is-open', aan);
    var b = v.querySelector('button'); if (b) b.setAttribute('aria-expanded', aan ? 'true' : 'false');
  }
  $$('[data-accordeon] .vraag').forEach(function (v) {
    var b = v.querySelector('button'); if (!b) return;
    b.addEventListener('click', function () { zetVraag(v, !v.classList.contains('is-open')); });
  });
  function openVraag(id) {
    var v = document.getElementById(id);
    if (v && v.classList.contains('vraag')) zetVraag(v, true);
  }

  leesHash();

  /* ------------------------------------------------------------
     Eigen datumkiezer
     ------------------------------------------------------------ */
  var kal = $('[data-kalender]');
  if (kal) (function () {
    var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    var maandEl = $('[data-maand]', kal), body = $('[data-dagen]', kal);
    var vorige = $('[data-vorige]', kal), volgende = $('[data-volgende]', kal);
    var keuzeEl = $('[data-keuze]', kal), knop = $('[data-datum-knop]');
    if (!maandEl || !body || !vorige || !volgende) return;
    var vandaag = new Date(); vandaag.setHours(0, 0, 0, 0);
    var min = new Date(vandaag); min.setDate(min.getDate() + 1);
    var max = new Date(vandaag); max.setFullYear(max.getFullYear() + 1);
    var toon = new Date(min.getFullYear(), min.getMonth(), 1);
    var gekozen = null, focusDag = null;
    // Zijn er deze maand nog maar een paar dagen te kiezen? Begin dan bij de volgende maand.
    (function () {
      var n = 0, d = new Date(min);
      while (d.getMonth() === min.getMonth()) { if (d.getDay() !== 0) n++; d.setDate(d.getDate() + 1); }
      if (n < 8) toon = new Date(min.getFullYear(), min.getMonth() + 1, 1);
    })();

    function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function zelfde(a, b) { return a && b && a.getTime() === b.getTime(); }
    function kiesbaar(d) { return d >= min && d <= max && d.getDay() !== 0; }
    function lang(d) { return DAGEN[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()] + ' ' + d.getFullYear(); }
    function eersteKiesbaar(maand) {
      var d = new Date(maand.getFullYear(), maand.getMonth(), 1);
      while (d.getMonth() === maand.getMonth()) { if (kiesbaar(d)) return d; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); }
      return null;
    }
    function teken(focus) {
      maandEl.textContent = MAANDEN[toon.getMonth()].charAt(0).toUpperCase() + MAANDEN[toon.getMonth()].slice(1) + ' ' + toon.getFullYear();
      if (!focusDag || focusDag.getMonth() !== toon.getMonth() || focusDag.getFullYear() !== toon.getFullYear()) {
        focusDag = (gekozen && gekozen.getMonth() === toon.getMonth() && gekozen.getFullYear() === toon.getFullYear()) ? gekozen : eersteKiesbaar(toon);
      }
      var start = (toon.getDay() + 6) % 7; // maandag eerst
      var aantal = new Date(toon.getFullYear(), toon.getMonth() + 1, 0).getDate();
      var html = '<tr>', cel = 0;
      for (var i = 0; i < start; i++) { html += '<td></td>'; cel++; }
      for (var dag = 1; dag <= aantal; dag++) {
        var d = new Date(toon.getFullYear(), toon.getMonth(), dag);
        var ok = kiesbaar(d);
        html += '<td role="gridcell"><button type="button" class="dagknop" data-iso="' + iso(d) + '" aria-label="' + lang(d) + '" aria-pressed="' + (zelfde(d, gekozen) ? 'true' : 'false') + '" tabindex="' + (zelfde(d, focusDag) ? '0' : '-1') + '"' + (ok ? '' : ' disabled') + '>' + dag + '</button></td>';
        cel++;
        if (cel % 7 === 0 && dag < aantal) html += '</tr><tr>';
      }
      while (cel % 7 !== 0) { html += '<td></td>'; cel++; }
      html += '</tr>';
      body.innerHTML = html;
      var maandMin = new Date(min.getFullYear(), min.getMonth(), 1), maandMax = new Date(max.getFullYear(), max.getMonth(), 1);
      vorige.disabled = toon <= maandMin;
      volgende.disabled = toon >= maandMax;
      if (focus && focusDag) { var b = $('[data-iso="' + iso(focusDag) + '"]', body); if (b) b.focus(); }
    }
    function kies(d) {
      gekozen = d; focusDag = d;
      // één tabstop in het raster: de gekozen dag
      $$('.dagknop', body).forEach(function (b) {
        var aan = b.dataset.iso === iso(d);
        b.setAttribute('aria-pressed', aan ? 'true' : 'false');
        b.tabIndex = aan ? 0 : -1;
      });
      if (keuzeEl) keuzeEl.textContent = 'Je kiest ' + lang(d) + '.';
      if (knop) knop.setAttribute('href', 'boeken.html?datum=' + iso(d));
    }
    function verplaats(d, stap) {
      var poging = new Date(d);
      for (var i = 0; i < 60; i++) {
        poging = new Date(poging.getFullYear(), poging.getMonth(), poging.getDate() + stap);
        if ((poging < min && stap < 0) || (poging > max && stap > 0)) return;
        if (kiesbaar(poging)) break;
      }
      if (!kiesbaar(poging)) return;
      focusDag = poging;
      if (poging.getMonth() !== toon.getMonth() || poging.getFullYear() !== toon.getFullYear()) toon = new Date(poging.getFullYear(), poging.getMonth(), 1);
      teken(true);
    }
    body.addEventListener('click', function (e) {
      var b = e.target.closest('.dagknop'); if (!b || b.disabled) return;
      var p = b.dataset.iso.split('-');
      kies(new Date(+p[0], +p[1] - 1, +p[2]));
    });
    body.addEventListener('keydown', function (e) {
      var b = e.target.closest('.dagknop'); if (!b) return;
      var p = b.dataset.iso.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]);
      var k = e.key;
      if (k === 'ArrowRight') verplaats(d, 1);
      else if (k === 'ArrowLeft') verplaats(d, -1);
      else if (k === 'ArrowDown') verplaats(d, 7);
      else if (k === 'ArrowUp') verplaats(d, -7);
      else if (k === 'Home') { var ma = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7); verplaats(new Date(ma.getFullYear(), ma.getMonth(), ma.getDate() - 1), 1); }
      else if (k === 'End') { var zo = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6 - (d.getDay() + 6) % 7); verplaats(new Date(zo.getFullYear(), zo.getMonth(), zo.getDate() + 1), -1); }
      else if (k === 'PageDown') { maandStap(1, true); }
      else if (k === 'PageUp') { maandStap(-1, true); }
      else return;
      e.preventDefault();
    });
    // dichtstbijzijnde kiesbare dag binnen dezelfde maand (eerst later, dan eerder)
    function dichtstbij(d) {
      for (var i = 0; i < 31; i++) {
        var na = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
        if (na.getMonth() === d.getMonth() && kiesbaar(na)) return na;
        var voor = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
        if (voor.getMonth() === d.getMonth() && kiesbaar(voor)) return voor;
      }
      return null;
    }
    function maandStap(n, focus) {
      var nieuw = new Date(toon.getFullYear(), toon.getMonth() + n, 1);
      var maandMin = new Date(min.getFullYear(), min.getMonth(), 1), maandMax = new Date(max.getFullYear(), max.getMonth(), 1);
      if (nieuw < maandMin || nieuw > maandMax) return;
      // PageDown/PageUp: dezelfde dag van de maand (afgetopt op de laatste dag), daarna de dichtstbijzijnde kiesbare dag
      var basis = focusDag || gekozen;
      var dagNr = basis ? basis.getDate() : 1;
      var laatste = new Date(nieuw.getFullYear(), nieuw.getMonth() + 1, 0).getDate();
      toon = nieuw;
      focusDag = dichtstbij(new Date(nieuw.getFullYear(), nieuw.getMonth(), Math.min(dagNr, laatste)));
      // bladeren met de knoppen: staat de gekozen dag in deze maand, dan blijft die de tabstop
      if (!focus && gekozen && gekozen.getMonth() === nieuw.getMonth() && gekozen.getFullYear() === nieuw.getFullYear()) focusDag = gekozen;
      teken(focus);
    }
    vorige.addEventListener('click', function () { maandStap(-1, false); });
    volgende.addEventListener('click', function () { maandStap(1, false); });
    teken(false);
  })();

  /* ------------------------------------------------------------
     Mobiele vaste balk
     Met hero: zichtbaar na de hero. Zonder hero: na ±600px scrollen.
     Weg bij het slotblok ([data-datum-sectie] of .slotactie, en alles daaronder) en in het open menu.
     ------------------------------------------------------------ */
  var balk = $('[data-mbalk]');
  var balkHero = $('.hero');
  var balkEinde = $$('[data-datum-sectie], .slotactie');
  var balkTik = false;
  function balkBijwerken() {
    if (!balk) return;
    var voorbij = balkHero ? balkHero.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
    var bijEinde = balkEinde.some(function (el) { return el.getBoundingClientRect().top <= window.innerHeight - 40; });
    var zichtbaar = !mqDesktop.matches && voorbij && !bijEinde && !mmenuOpen();
    balk.classList.toggle('is-zichtbaar', zichtbaar);
    balk.setAttribute('tabindex', zichtbaar ? '0' : '-1');
    balk.setAttribute('aria-hidden', zichtbaar ? 'false' : 'true');
    balkTik = false;
  }
  if (balk) {
    window.addEventListener('scroll', function () { if (!balkTik) { balkTik = true; requestAnimationFrame(balkBijwerken); } }, { passive: true });
    window.addEventListener('resize', wacht(balkBijwerken, 150));
    balkBijwerken();
  }

  /* ------------------------------------------------------------
     Licht (homepage): kop en alinea op de lichte wand, rechts van de amfoor
     Veilige wand (bron 1920×1080): x 1030–1480, y 36–405 (ruim boven het hoofd, dat op ±450 begint).
     ------------------------------------------------------------ */
  var zon = $('[data-zon]');
  var zonFoto = $('[data-zon-foto]');
  var wand = $('[data-zon-wand]');
  var alinea = $('[data-zon-alinea]');
  var onder = $('[data-zon-onder]');
  if (zon && zonFoto && wand && alinea && onder) (function () {
    function passen() {
      zon.classList.remove('zon--onder', 'zon--kop-alleen');
      if (alinea.parentNode !== wand) wand.appendChild(alinea);
      wand.style.removeProperty('--zx'); wand.style.removeProperty('--zy'); wand.style.removeProperty('--zw');
      if (!mqDesktop.matches) return; // tablet en mobiel: tekst onder het beeld (CSS)
      var W = zonFoto.clientWidth, H = zonFoto.clientHeight;
      var s = Math.max(W / 1920, H / 1080);
      var ox = (W - 1920 * s) * 0.5, oy = 0; // object-position 50% 0%
      var x1 = ox + 1030 * s, x2 = ox + 1480 * s, y1 = oy + 36 * s, y2 = oy + 405 * s;
      wand.style.setProperty('--zx', x1.toFixed(1) + 'px');
      wand.style.setProperty('--zy', y1.toFixed(1) + 'px');
      wand.style.setProperty('--zw', (x2 - x1).toFixed(1) + 'px');
      function past() { return wand.offsetHeight <= (y2 - y1); }
      if (past()) return;
      zon.classList.add('zon--kop-alleen');
      onder.appendChild(alinea);
      if (past()) return;
      zon.classList.remove('zon--kop-alleen');
      wand.appendChild(alinea);
      zon.classList.add('zon--onder');
    }
    passen();
    window.addEventListener('resize', wacht(passen, 120));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(passen);
    window.addEventListener('load', passen);
  })();

  /* ------------------------------------------------------------
     Sets op telefoon en tablet: beide beelden per set, veeg opzij.
     Twee stipjes laten zien welk beeld in beeld staat (CSS toont ze alleen bij hover: none).
     ------------------------------------------------------------ */
  $$('.set__beeld').forEach(function (b) {
    var n = $$('img', b).length; if (n < 2) return;
    var st = document.createElement('div');
    st.className = 'set__stippen'; st.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) st.appendChild(document.createElement('span'));
    st.firstChild.classList.add('is-aan');
    b.parentNode.insertBefore(st, b.nextSibling);
    b.addEventListener('scroll', wacht(function () {
      var k = Math.round(b.scrollLeft / Math.max(1, b.clientWidth));
      $$('span', st).forEach(function (s, j) { s.classList.toggle('is-aan', j === k); });
    }, 60), { passive: true });
  });

  /* ------------------------------------------------------------
     Directe links met een #anker (gedeeld of van buiten): na het laden van fonts en beelden
     nog één keer precies op het doel zetten; pas daarna vloeiend scrollen aanzetten.
     ------------------------------------------------------------ */
  function naLaden() {
    var h = location.hash;
    if (h && !/^#klaar/.test(h)) {
      var doel = null;
      try { doel = document.getElementById(decodeURIComponent(h.slice(1))); } catch (e) { doel = null; }
      if (doel) doel.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    doc.classList.add('is-geladen');
  }
  var geladen = new Promise(function (r) { if (document.readyState === 'complete') r(); else window.addEventListener('load', r); });
  Promise.all([geladen, document.fonts && document.fonts.ready ? document.fonts.ready : null]).then(function () {
    requestAnimationFrame(naLaden);
  });
})();
