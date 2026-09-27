(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const article = $('#article');
  const nav = $('#contentsNav');
  const FIGURE_CAPTION = /^(?:\d{1,3}\s*[-–.]?\s*rasm\b|rasm\s*\d{1,3}\b)/i;
  const DATE_LINE = /^(?:ophthalmolog\s*)?[A-Z][a-z]+\s+\d{1,2},\s+\d{4}$/;
  const knownHeading = /^(?:Koʻzning|Ko'zning|Ko‘?zning|Koʻz refraksiyasi|Ko‘z refraksiyasi|Astigmatizm|Presbiopiya|Miopiya|Gipermetropiya|Anizometropiya|Akkomodasiya|Akkomodatsiya|Ranglarni|Rabkin jadvali|Ishixara jadvali|Esda saqlash|Klinik refraksiya|Optik|Refraksiya|Linzalar|Normada akkomodasiya|Trixromaziyaning|Koʻrish|Ko‘rish)/i;
  const numberedHeading = /^\d{1,2}\.\s+.{4,100}$/;
  const clean = s => s.trim().replace(/\s+/g, ' ');

  function looksLikeHeading(raw, index) {
    const t = clean(raw);
    if (!t || t.length > 110 || FIGURE_CAPTION.test(t) || DATE_LINE.test(t)) return false;
    if (numberedHeading.test(t)) return true;
    if (/[.!?;:]$/.test(t) || t.includes('\n')) return false;
    if (knownHeading.test(t)) return true;
    return t.length < 58 && !/[,;:]/.test(t) && index > 0 && /^[A-ZА-ЯЎҚҒҲ0-9]/.test(t);
  }

  function addImage(parent, file, caption = '') {
    const figure = document.createElement('figure');
    figure.className = 'article-figure';
    const img = document.createElement('img');
    img.src = `assets/images/${encodeURIComponent(file)}`;
    img.alt = caption || file;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.dataset.caption = caption;
    img.addEventListener('click', () => {
      const dialog = $('#lightbox');
      const figureCaption = img.dataset.caption || caption;
      $('#lightboxImage').src = img.currentSrc || img.src;
      $('#lightboxImage').alt = img.alt;
      $('#lightboxCaption').textContent = figureCaption;
      if (!dialog.open) dialog.showModal();
    });
    figure.append(img);
    parent.append(figure);
  }

  function addTable(rows, parent) {
    const wrap = document.createElement('div'); wrap.className = 'table-wrap';
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    rows.forEach((row, ri) => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement(ri === 0 ? 'th' : 'td');
        td.textContent = cell;
        tr.append(td);
      });
      tbody.append(tr);
    });
    table.append(tbody); wrap.append(table); parent.append(wrap);
  }

  function render(data) {
    article.replaceChildren(); nav.replaceChildren();
    const sections = [];
    let section = null;
    let paragraphIndex = 0;
    data.blocks.forEach((block, blockIndex) => {
      if (block.type === 'table') {
        if (!section) { section = createSection('Qo‘llanma mazmuni', sections.length); article.append(section.node); sections.push(section); }
        addTable(block.rows, section.node); return;
      }
      const raw = block.text || '';
      const text = clean(raw);
      const previousHasImage = Boolean(data.blocks[blockIndex - 1]?.images?.length);
      const captionLike = previousHasImage && text.length < 100 && !/[.!?]$/.test(text);
      const candidateIndex = paragraphIndex++;
      const heading = !block.listItem && !captionLike && looksLikeHeading(raw, candidateIndex);
      if (heading) {
        section = createSection(text, sections.length);
        article.append(section.node); sections.push(section);
      }
      if (!section) { section = createSection('Qo‘llanma mazmuni', 0); article.append(section.node); sections.push(section); }
      if (raw.length && !heading) {
        const previousFigure = section.node.lastElementChild?.matches('.article-figure') ? section.node.lastElementChild : null;
        const isCaption = !block.listItem && (FIGURE_CAPTION.test(text) || (previousFigure && text.length < 100 && !/[.!?]$/.test(text)));
        if (isCaption && previousFigure) {
          const caption = document.createElement('figcaption'); caption.textContent = raw;
          previousFigure.append(caption);
          const image = previousFigure.querySelector('img');
          if (image) { image.dataset.caption = raw; image.alt = raw; }
        } else {
          const p = document.createElement('p');
          p.textContent = raw;
          if (block.listItem) p.className = 'source-list-item';
          if (isCaption) p.className = 'figure-caption';
          else if (DATE_LINE.test(text)) p.className = 'date-line';
          section.node.append(p);
        }
      }
      block.images.forEach(file => addImage(section.node, file, FIGURE_CAPTION.test(text) ? text : ''));
    });
    sections.forEach((s, index) => {
      const a = document.createElement('a');
      a.href = `#${s.id}`;
      const num = document.createElement('span'); num.className = 'nav-index'; num.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span'); label.textContent = s.title;
      a.append(num, label); nav.append(a);
    });
    $('#topicCount').textContent = sections.length;
    $('#imageCount').textContent = data.inventory.uniqueImagesReferenced;
    $('#tableCount').textContent = data.inventory.tables;
    setupProgress(sections);
  }

  function createSection(title, index) {
    const node = document.createElement('section');
    node.className = 'article-section'; node.id = `section-${index + 1}`;
    const h = document.createElement('h2'); h.textContent = title;
    node.append(h);
    return { node, title, id: node.id };
  }

  function setupProgress(sections) {
    const key = 'ophthalmology-read-sections';
    let read = new Set();
    try { read = new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch {}
    const update = () => {
      const percent = sections.length ? Math.round(read.size / sections.length * 100) : 0;
      $('#progressText').textContent = `${percent}%`;
      $('#progressBar').style.width = `${percent}%`;
      $('.progress-track').setAttribute('aria-valuenow', percent);
      $('#progressMeta').textContent = `${read.size} bo‘limdan ${sections.length} tasi`;
    };
    update();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= .22) {
            read.add(entry.target.id);
            try { localStorage.setItem(key, JSON.stringify([...read])); } catch {}
            update();
          }
        });
      }, { threshold: [.22, .5] });
      sections.forEach(s => observer.observe(s.node));
    }
    const bookmark = $('#bookmarkButton');
    const bookmarkKey = 'ophthalmology-bookmark';
    const savedId = localStorage.getItem(bookmarkKey);
    const saved = sections.find(s => s.id === savedId);
    bookmark.setAttribute('aria-pressed', saved ? 'true' : 'false');
    bookmark.querySelector('span').textContent = saved ? '★' : '☆';
    bookmark.lastChild.textContent = saved ? ' Saqlangan bo‘lim' : ' Saqlab qo‘yish';
    bookmark.addEventListener('click', () => {
      const current = sections.find(s => {
        const r = s.node.getBoundingClientRect(); return r.top < innerHeight * .55 && r.bottom > 80;
      }) || sections[0];
      const isSaved = bookmark.getAttribute('aria-pressed') === 'true';
      if (isSaved) { localStorage.removeItem(bookmarkKey); bookmark.setAttribute('aria-pressed', 'false'); bookmark.querySelector('span').textContent = '☆'; bookmark.lastChild.textContent = ' Saqlab qo‘yish'; }
      else { localStorage.setItem(bookmarkKey, current.id); bookmark.setAttribute('aria-pressed', 'true'); bookmark.querySelector('span').textContent = '★'; bookmark.lastChild.textContent = ' Saqlangan bo‘lim'; }
    });
  }

  fetch('content.json').then(r => { if (!r.ok) throw new Error('content.json yuklanmadi'); return r.json(); }).then(render).catch(() => {
    article.innerHTML = '<p class="loading-state">Qo‘llanma mazmunini yuklab bo‘lmadi. Loyihani lokal HTTP server orqali oching yoki GitHub Pages’da ishga tushiring.</p>';
  });

  const theme = localStorage.getItem('ophthalmology-theme');
  if (theme === 'dark') document.body.dataset.theme = 'dark';
  $('#themeToggle').addEventListener('click', () => {
    const dark = document.body.dataset.theme !== 'dark';
    document.body.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('ophthalmology-theme', dark ? 'dark' : 'light');
  });
  $('#lightboxClose').addEventListener('click', () => $('#lightbox').close());
  $('#lightbox').addEventListener('click', e => { if (e.target === $('#lightbox')) e.currentTarget.close(); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
  }
})();
