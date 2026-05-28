(function (root) {

  const SOURCES = {
    orgaos: () => ORGAOS,
    funcoes: () => FUNCOES,
    subfuncoes: () => SUBFUNCOES,
    programas: () => PROGRAMAS,
    acoes: () => ACOES,
    naturezas: () => NATUREZAS,
    fontes: () => FONTES
  };

  function describe(val) {
    return typeof val === 'object' ? `${val.d} (${val.t})` : val;
  }

  function filter(tableKey, query) {
    const data = SOURCES[tableKey] && SOURCES[tableKey]();
    if (!data) return [];

    const q = (query || '').trim().toLowerCase();
    const items = [];

    for (const [code, val] of Object.entries(data)) {
      const desc = describe(val);
      if (!q || code.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
        items.push({ code, desc });
      }
    }
    items.sort((a, b) => a.code.localeCompare(b.code));
    return items;
  }

  function render(tableKey, query) {
    const esc = Translator.esc;
    const items = filter(tableKey, query);
    if (!items.length) return `<div class="lookup-empty">nada por aqui.</div>`;
    return items
      .map(i => `<div class="lookup-row"><span class="c">${esc(i.code)}</span><span class="d">${esc(i.desc)}</span></div>`)
      .join('');
  }

  root.Lookup = { render, filter };

})(window);
