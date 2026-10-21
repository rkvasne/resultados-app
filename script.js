const DATA = JSON.parse(document.getElementById('data').textContent);
const PRESIDENT_DATA = window.PRESIDENT_DATA;
const $ = id => document.getElementById(id);
const fmt = n => new Intl.NumberFormat('pt-BR').format(n || 0);
const pct = (a, b) => b ? 100 * a / b : 0;
const pf = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
let tab = 'sections';
let page = 0;
let sortKey = '';
let sortDir = -1;
let search = '';
let rowsCurrent = [];
let colCurrent = [];

function scope(row) {
  return (!$('zone').value || String(row.z) === $('zone').value) && (!$('city').value || row.mun === $('city').value);
}

function scoped() {
  return DATA.sections.filter(row => scope(row) && (!$('place').value || [row.z, row.mun, row.local].join('|') === $('place').value));
}

function scopeMunicipality(row) {
  return scope(row) && (!$('place').value || scoped().some(section => section.z === row.z && section.mun === row.mun));
}

function totals(rows) {
  return rows.reduce((value, row) => (value.apt += row.apt, value.comp += row.comp, value.abs += row.abs, value), { apt: 0, comp: 0, abs: 0 });
}

function updatePlaces() {
  const current = $('place').value;
  const items = new Map();
  for (const row of DATA.sections.filter(scope)) {
    const key = [row.z, row.mun, row.local].join('|');
    items.set(key, `ZE ${row.z} · ${row.mun} · ${row.local} — ${row.nome}`);
  }
  $('place').innerHTML = '<option value="">Todos os locais</option>' + [...items].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR')).map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
  if (items.has(current)) $('place').value = current;
}

function renderMetrics() {
  const sections = scoped();
  const result = totals(sections);
  const places = new Set(sections.map(row => [row.z, row.mun, row.local].join('|')));
  const metrics = [
    ['Eleitores aptos', fmt(result.apt), 'Base filtrada'],
    ['Comparecimento', fmt(result.comp), pf(pct(result.comp, result.apt)) + ' dos aptos'],
    ['Abstenções', fmt(result.abs), 'Eleitores que não compareceram'],
    ['Taxa de abstenção', pf(pct(result.abs, result.apt)), 'Ponderada pelos eleitores aptos'],
    ['Seções / locais', fmt(sections.length) + ' / ' + fmt(places.size), 'Seções apuradas / locais distintos']
  ];
  $('metrics').innerHTML = metrics.map((metric, index) => `<article class="metric ${index === 3 ? 'danger' : ''}"><div class="name">${metric[0]}</div><div class="value">${metric[1]}</div><div class="sub">${metric[2]}</div></article>`).join('');
}

function updateOfficeGuidance() {
  const help = document.querySelector('.office-field small');
  const isPresident = $('office').value === 'Presidente';
  help.id = 'office-help';
  $('office').setAttribute('aria-describedby', help.id);
  help.textContent = isPresident
    ? 'A abstenção permanece igual. Para Presidente, não há visão por partido.'
    : 'O cargo muda apenas os votos exibidos; a abstenção permanece igual.';
}

function dataForTab() {
  const sections = scoped();
  const office = $('office').value;
  if (tab === 'sections') {
    const voteRows = office === 'Presidente' ? PRESIDENT_DATA.sections : DATA.votes;
    const votes = new Map(voteRows.filter(row => row.cargo === office).map(row => [[row.z, row.mun, row.sec].join('|'), row]));
    return {
      columns: [['z', 'ZE'], ['mun', 'Município'], ['sec', 'Seção'], ['local', 'Local nº'], ['nome', 'Local de votação'], ['apt', 'Aptos'], ['comp', 'Comparecimento'], ['abs', 'Abstenções'], ['rate', 'Abstenção %'], ['br', 'Brancos'], ['nu', 'Nulos'], ['nom', 'Nominais'], ['leg', 'Legenda'], ['bu', 'Recebimento do BU']],
      rows: sections.map(row => ({ ...row, ...(votes.get([row.z, row.mun, row.sec].join('|')) || {}), rate: pct(row.abs, row.apt) })),
      description: office === 'Presidente'
        ? `Abstenção da seção, independente do cargo. Votos de Presidente na mesma seção. A soma dos votos diverge do comparecimento em ${PRESIDENT_DATA.comparisonMismatches.length} seções; os totais de cada fonte foram preservados.`
        : `Abstenção da seção, independente do cargo. Votos de ${office} na mesma seção. Clique nos títulos das colunas para ordenar.`
    };
  }
  if (tab === 'places') {
    const byPlace = new Map();
    for (const row of sections) {
      const key = [row.z, row.mun, row.local].join('|');
      let place = byPlace.get(key);
      if (!place) {
        place = { z: row.z, mun: row.mun, local: row.local, nome: row.nome, end: row.end, sec: 0, apt: 0, comp: 0, abs: 0 };
        byPlace.set(key, place);
      }
      place.sec++;
      place.apt += row.apt;
      place.comp += row.comp;
      place.abs += row.abs;
    }
    return { columns: [['z', 'ZE'], ['mun', 'Município'], ['local', 'Local nº'], ['nome', 'Nome do local'], ['sec', 'Seções'], ['apt', 'Aptos'], ['comp', 'Comparecimento'], ['abs', 'Abstenções'], ['rate', 'Abstenção %'], ['end', 'Endereço']], rows: [...byPlace.values()].map(row => ({ ...row, rate: pct(row.abs, row.apt) })), description: 'Consolidação das seções por local. Percentuais ponderados pelo número de eleitores aptos.' };
  }
  if (tab === 'comparison' && office === 'Presidente') {
    const matches = PRESIDENT_DATA.municipalities.filter(scopeMunicipality);
    const groups = matches.map(row => ({ ...row, validos: row.nom, rate: pct(row.abs, row.apt) }));
    const byZone = new Map();
    for (const row of matches) {
      let zone = byZone.get(row.z);
      if (!zone) {
        zone = { z: row.z, mun: 'TOTAL DA ZONA', apt: 0, comp: 0, abs: 0, nom: 0, br: 0, nu: 0, validos: 0 };
        byZone.set(row.z, zone);
      }
      for (const key of ['apt', 'comp', 'abs', 'nom', 'br', 'nu']) zone[key] += row[key];
      zone.validos += row.nom;
    }
    if (!$('place').value) groups.push(...[...byZone.values()].map(row => ({ ...row, rate: pct(row.abs, row.apt) })));
    return {
      columns: [['z', 'ZE'], ['mun', 'Abrangência'], ['apt', 'Aptos'], ['comp', 'Comparecimento'], ['abs', 'Abstenções'], ['rate', 'Abstenção %'], ['validos', 'Votos válidos'], ['br', 'Brancos'], ['nu', 'Nulos']],
      rows: groups,
      description: 'Votos presidenciais consolidados pelas seções disponíveis. Aptos, comparecimento e abstenções usam a base única do painel.'
    };
  }
  if (tab === 'comparison') {
    const matches = DATA.municipal.filter(row => row.cargo === office && scopeMunicipality(row));
    const groups = matches.map(row => ({ ...row, rate: pct(row.abs, row.apt), turn: 'Município / ZE' }));
    const byZone = new Map();
    for (const row of matches) {
      let zone = byZone.get(row.z);
      if (!zone) {
        zone = { z: row.z, mun: 'TOTAL DA ZONA', cargo: row.cargo, apt: 0, comp: 0, abs: 0, principais: 0, agregadas: 0, validos: 0, br: 0, nu: 0, anulados: 0, turn: 'Zona inteira' };
        byZone.set(row.z, zone);
      }
      for (const key of ['apt', 'comp', 'abs', 'principais', 'agregadas', 'validos', 'br', 'nu', 'anulados']) zone[key] += row[key];
    }
    if (!$('place').value) groups.push(...[...byZone.values()].map(row => ({ ...row, rate: pct(row.abs, row.apt) })));
    return { columns: [['z', 'ZE'], ['mun', 'Abrangência'], ['apt', 'Aptos'], ['comp', 'Comparecimento'], ['abs', 'Abstenções'], ['rate', 'Abstenção %'], ['principais', 'Seções principais'], ['agregadas', 'Seções agregadas'], ['validos', 'Votos válidos'], ['br', 'Brancos'], ['nu', 'Nulos'], ['anulados', 'Anulados']], rows: groups, description: `Consolidados oficiais por município/zona. Votos válidos, brancos e nulos correspondem a ${office}.` };
  }
  if (tab === 'candidates' && office === 'Presidente') return { columns: [['z', 'ZE'], ['mun', 'Município'], ['num', 'Número'], ['nome', 'Candidato'], ['votos', 'Votos nominais']], rows: PRESIDENT_DATA.candidates.filter(scopeMunicipality), description: 'Votos presidenciais nominais agregados por município/zona. O filtro de local não desagrega esses votos.' };
  if (tab === 'candidates') return { columns: [['z', 'ZE'], ['mun', 'Município'], ['num', 'Número'], ['nome', 'Candidato'], ['partido', 'Partido'], ['votos', 'Votos totais'], ['validos', 'Votos válidos'], ['dest', 'Destinação'], ['sit', 'Situação']], rows: DATA.candidates.filter(row => row.cargo === office && scopeMunicipality(row)), description: `Votação de candidatos a ${office}, agregada por município/zona. O filtro de local não desagrega esses votos.` };
  return { columns: [['z', 'ZE'], ['mun', 'Município'], ['num', 'Número'], ['partido', 'Partido'], ['leg', 'Votos de legenda válidos'], ['nom', 'Nominais válidos'], ['total', 'Total válido']], rows: DATA.parties.filter(row => row.cargo === office && scopeMunicipality(row)).map(row => ({ ...row, total: row.leg + row.nom })), description: `Votação por partido para ${office}, agregada por município/zona.` };
}

function sortRows(rows) {
  if (!sortKey) return rows;
  return [...rows].sort((a, b) => {
    const left = a[sortKey];
    const right = b[sortKey];
    const order = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), 'pt-BR', { numeric: true });
    return order * sortDir;
  });
}

function show() {
  const presidentSelected = $('office').value === 'Presidente';
  const partiesTab = document.querySelector('[data-tab="parties"]');
  partiesTab.classList.toggle('hidden', presidentSelected);
  if (presidentSelected && tab === 'parties') tab = 'sections';
  document.querySelectorAll('.tab').forEach(element => element.classList.toggle('active', element.dataset.tab === tab));
  renderMetrics();
  const data = dataForTab();
  let rows = data.rows.filter(row => !search || Object.values(row).some(value => String(value).toLocaleLowerCase('pt-BR').includes(search)));
  rows = sortRows(rows);
  rowsCurrent = rows;
  colCurrent = data.columns;
  const totalPages = Math.max(1, Math.ceil(rows.length / 50));
  page = Math.min(page, totalPages - 1);
  const body = rows.slice(page * 50, (page + 1) * 50).map(row => '<tr>' + data.columns.map(([key]) => {
    let value = row[key];
    if (key === 'rate') value = `<span class="pill">${pf(value)}</span><span class="bar"><span class="fill" style="display:block;width:${Math.min(100, value)}%"></span></span>`;
    else if (typeof value === 'number') value = fmt(value);
    else value = escapeHtml(value);
    return `<td class="${typeof row[key] === 'number' ? 'num' : ''}">${value ?? ''}</td>`;
  }).join('') + '</tr>').join('');
  const titles = { sections: 'Abstenção e votos por seção', places: 'Consolidado por local de votação', comparison: 'Comparativo eleitoral', candidates: 'Votação nominal por candidato', parties: 'Votação por partido' };
  $('tabcontent').innerHTML = `<section class="panel"><h2>${titles[tab]}</h2><p class="hint">${data.description}</p><div class="toolbar"><div><b>${fmt(rows.length)}</b> registros encontrados</div><div class="tools"><input class="search" id="q" value="${escapeHtml(search)}" placeholder="Buscar nome, seção, município..." aria-label="Buscar na tabela"><button class="btn" id="download">Exportar CSV filtrado</button><button class="btn" id="reset">Limpar busca</button></div></div><div class="table-wrap"><table><thead><tr>${data.columns.map(([key, label]) => {
    const isSorted = sortKey === key;
    const direction = sortDir === 1 ? 'ascending' : 'descending';
    const indicator = isSorted ? (sortDir === 1 ? '↑' : '↓') : '';
    return `<th data-key="${key}" class="${typeof rows[0]?.[key] === 'number' ? 'num' : ''}" aria-sort="${isSorted ? direction : 'none'}"><button class="sort-button" type="button" aria-label="Ordenar por ${label}">${label}<span aria-hidden="true">${indicator}</span></button></th>`;
  }).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${data.columns.length}">Nenhum resultado corresponde aos filtros.</td></tr>`}</tbody></table></div><div class="page-controls"><span>Página ${page + 1} de ${totalPages} · Até 50 registros por página</span><div class="tools"><button class="btn" id="prev" ${page === 0 ? 'disabled' : ''}>Anterior</button><button class="btn" id="next" ${page >= totalPages - 1 ? 'disabled' : ''}>Próxima</button></div></div></section>`;
  $('q').addEventListener('input', event => {
    search = event.target.value;
    page = 0;
    const position = event.target.selectionStart;
    show();
    const input = $('q');
    input.focus();
    input.setSelectionRange(position, position);
  });
  $('download').onclick = download;
  $('reset').onclick = () => { search = ''; page = 0; show(); };
  $('prev').onclick = () => { page--; show(); };
  $('next').onclick = () => { page++; show(); };
  document.querySelectorAll('th[data-key]').forEach(element => element.onclick = () => {
    if (sortKey === element.dataset.key) sortDir *= -1;
    else { sortKey = element.dataset.key; sortDir = -1; }
    page = 0;
    show();
  });
}

function download() {
  const encode = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const output = [colCurrent.map(column => encode(column[1])).join(';'), ...rowsCurrent.map(row => colCurrent.map(([key]) => encode(key === 'rate' ? pf(row[key]) : row[key])).join(';'))].join('\r\n');
  const blob = new Blob(['\ufeff' + output], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `painel_tse_2026_${tab}_ZE_${$('zone').value || '3_30'}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

for (const id of ['zone', 'city']) $(id).onchange = () => { updatePlaces(); page = 0; show(); };
for (const id of ['place', 'office']) $(id).onchange = () => { page = 0; if (id === 'office') updateOfficeGuidance(); show(); };
document.querySelectorAll('.tab').forEach(element => element.onclick = () => {
  tab = element.dataset.tab;
  document.querySelectorAll('.tab').forEach(button => button.classList.toggle('active', button === element));
  sortKey = '';
  sortDir = -1;
  page = 0;
  search = '';
  show();
});
updatePlaces();
document.querySelector('label[for="office"]').textContent = 'Votos exibidos';
updateOfficeGuidance();
show();
