(() => {
  const input = document.getElementById('searchInput');
  const status = document.getElementById('searchStatus');
  const article = document.getElementById('article');
  if (!input || !article) return;
  let timer;
  function clearMarks() {
    article.querySelectorAll('mark.search-hit').forEach(mark => mark.replaceWith(document.createTextNode(mark.textContent)));
    article.normalize();
  }
  function runSearch() {
    clearMarks();
    const query = input.value.trim();
    if (!query) { status.textContent = ''; return; }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'ig');
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim() || node.parentElement.closest('script,style,mark,figcaption')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let count = 0, first = null;
    nodes.forEach(node => {
      const value = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(value)) return;
      re.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let cursor = 0, match;
      while ((match = re.exec(value))) {
        fragment.append(document.createTextNode(value.slice(cursor, match.index)));
        const mark = document.createElement('mark'); mark.className = 'search-hit'; mark.textContent = match[0];
        fragment.append(mark); count++; first ||= mark;
        cursor = match.index + match[0].length;
        if (!match[0].length) re.lastIndex++;
      }
      fragment.append(document.createTextNode(value.slice(cursor)));
      node.replaceWith(fragment);
    });
    status.textContent = `${count} ta moslik topildi`;
    if (first) {
      const section = first.closest('.article-section');
      document.querySelectorAll('#contentsNav a').forEach(a => a.classList.toggle('active', a.hash === `#${section?.id}`));
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(runSearch, 300); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(timer); runSearch(); } });
})();
