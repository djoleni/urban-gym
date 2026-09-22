/* Urban Gym Niš — interakcije (bez zavisnosti) */
(() => {
  'use strict';

  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname + window.location.search);
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: providna na vrhu, puna posle skrola ---------- */
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobilni meni ---------- */
  const menuBtn = $('[data-menu-btn]');
  const nav = $('[data-nav]');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('no-scroll', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Hero: "Gym mode" prekidač ---------- */
  const hero = $('[data-hero]');
  const sw = $('[data-switch]');
  const heroImg = $('.hero__media img', hero);

  const lightsOn = () => {
    hero.classList.remove('is-off');
    sw.setAttribute('aria-checked', 'true');
    if (!reduceMotion) {
      hero.classList.remove('is-flicker');
      void hero.offsetWidth; // restart animacije
      hero.classList.add('is-flicker');
    }
  };
  const lightsOff = () => {
    hero.classList.remove('is-flicker');
    hero.classList.add('is-off');
    sw.setAttribute('aria-checked', 'false');
  };
  hero.addEventListener('animationend', (e) => {
    if (e.animationName === 'lights') hero.classList.remove('is-flicker');
  });
  sw.addEventListener('click', () => {
    sw.getAttribute('aria-checked') === 'true' ? lightsOff() : lightsOn();
  });

  // Pri učitavanju: sačekaj sliku, pa "uključi" svetla
  let booted = false;
  const boot = () => {
    if (booted) return;
    booted = true;
    reduceMotion ? lightsOn() : window.setTimeout(lightsOn, 600);
  };
  if (heroImg.complete && heroImg.naturalWidth) boot();
  else {
    heroImg.addEventListener('load', boot, { once: true });
    heroImg.addEventListener('error', boot, { once: true });
    window.setTimeout(boot, 2200);
  }

  /* ---------- Radno vreme: "Otvoreno / Zatvoreno" po beogradskom vremenu ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const hoursFor = (day) => (day === 0 || day === 6) ? { open: 10, close: 20 } : { open: 8, close: 22 };
  const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const belgradeNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Belgrade', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    return { day: DAYS[get('weekday')], minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
  };

  const renderStatus = () => {
    let now;
    try { now = belgradeNow(); } catch (_) { return; }
    const h = hoursFor(now.day);
    const openAt = h.open * 60;
    const closeAt = h.close * 60;
    let text;
    let isOpen = false;

    if (now.minutes >= openAt && now.minutes < closeAt) {
      isOpen = true;
      text = `Otvoreno`;
    } else if (now.minutes < openAt) {
      text = `Zatvoreno, otvara se u ${pad(h.open)}:00`;
    } else {
      text = `Zatvoreno, otvara se sutra u ${pad(hoursFor((now.day + 1) % 7).open)}:00`;
    }

    $$('[data-status]').forEach((el) => { el.textContent = text; el.classList.toggle('is-open', isOpen); });
    $$('[data-today-hours]').forEach((el) => { el.textContent = `${pad(h.open)}:00–${pad(h.close)}:00`; });
    $$('[data-days]').forEach((row) => {
      row.classList.toggle('is-today', row.dataset.days.split(',').map(Number).includes(now.day));
    });
  };
  renderStatus();
  window.setInterval(renderStatus, 60 * 1000);

  /* ---------- Oprema: harmonika + promena slike ---------- */
  const gearItems = $$('[data-gear]'); const gearImgs = $$('[data-gear-img]');

  const openGear = (index) => {
    gearItems.forEach((item, i) => {
      const on = i === index;
      item.classList.toggle('is-open', on);
      $('button', item).setAttribute('aria-expanded', String(on));

      const panelInner = $('.gear-item__panel > div', item);
      let mobileImgWrap = $('.gear-item__mobile-img', panelInner);

      if (on) {
        // Dinamički kreiramo sliku unutar otvorenog panela ako već ne postoji
        if (!mobileImgWrap) {
          mobileImgWrap = document.createElement('div');
          mobileImgWrap.className = 'gear-item__mobile-img';
          mobileImgWrap.innerHTML = `<img src="${gearImgs[i].src}" alt="${gearImgs[i].alt}" loading="eager">`;
          panelInner.appendChild(mobileImgWrap);
        }
      }
    });

    // Glavna slika za desktop prikaz
    gearImgs.forEach((img, i) => img.classList.toggle('is-active', i === index));
  };

  // Dodavanje Event Listener-a na klik
  gearItems.forEach((item, i) => $('button', item).addEventListener('click', () => openGear(i)));

  openGear(0);
  
  /* ---------- Cenovnik: muškarci / žene ---------- */
  const priceRoot = $('[data-prices]');
  const genderBtns = $$('[data-gender]', priceRoot);
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const setGender = (g) => {
    genderBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.gender === g)));
    $$('[data-m]', priceRoot).forEach((el) => {
      const value = Number(g === 'm' ? el.dataset.m : el.dataset.f);
      const priceEl = $('[data-price]', el);
      const monthEl = $('[data-permonth]', el);
      const prev = priceEl.textContent;
      priceEl.textContent = fmt(value);
      if (monthEl) monthEl.textContent = fmt(value / Number(el.dataset.months));
      if (!reduceMotion && prev !== priceEl.textContent) {
        [priceEl, monthEl].filter(Boolean).forEach((n) => {
          n.classList.remove('tick');
          void n.offsetWidth;
          n.classList.add('tick');
        });
      }
    });
  };
  genderBtns.forEach((b) => b.addEventListener('click', () => setGender(b.dataset.gender)));

  /* ---------- Galerija: lightbox ---------- */
  const dlg = $('[data-lightbox]');
  const shots = $$('[data-shot]');
  if (dlg && typeof dlg.showModal === 'function' && shots.length) {
    const lbImg = $('[data-lb-img]', dlg);
    const lbCap = $('[data-lb-cap]', dlg);
    const lbCount = $('[data-lb-count]', dlg);
    let current = 0;

    const show = (i) => {
      current = (i + shots.length) % shots.length;
      const img = $('img', shots[current]);
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = $('.shot__cap', shots[current]).textContent;
      lbCount.textContent = `${current + 1} / ${shots.length}`;
    };

    shots.forEach((s, i) => s.addEventListener('click', () => { show(i); dlg.showModal(); }));
    $('[data-lb-prev]', dlg).addEventListener('click', () => show(current - 1));
    $('[data-lb-next]', dlg).addEventListener('click', () => show(current + 1));
    $('[data-lb-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (!e.target.closest('img, button, .lb-cap')) dlg.close(); });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
  }

  /* ---------- Footer: godina ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
