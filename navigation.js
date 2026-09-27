(() => {
  const toggle = document.getElementById('menuToggle');
  const close = document.getElementById('closeMenu');
  const scrim = document.getElementById('sidebarScrim');
  const setOpen = open => {
    document.body.classList.toggle('menu-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
  };
  toggle?.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
  close?.addEventListener('click', () => setOpen(false));
  scrim?.addEventListener('click', () => setOpen(false));
  document.getElementById('contentsNav')?.addEventListener('click', e => {
    if (e.target.closest('a')) setOpen(false);
  });
  const top = document.getElementById('backToTop');
  window.addEventListener('scroll', () => top?.classList.toggle('visible', window.scrollY > 500), { passive: true });
  top?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); document.getElementById('searchInput')?.focus();
    }
    if (e.key === 'Escape') setOpen(false);
  });
  const links = () => [...document.querySelectorAll('#contentsNav a')];
  const sections = () => [...document.querySelectorAll('.article-section')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        links().forEach(a => a.classList.toggle('active', a.hash === `#${entry.target.id}`));
      }
    }), { rootMargin: '-18% 0px -72% 0px' });
    const watch = () => sections().forEach(s => observer.observe(s));
    document.addEventListener('content-ready', watch, { once: true });
    const timer = setInterval(() => { if (sections().length) { watch(); clearInterval(timer); } }, 150);
  }
})();
