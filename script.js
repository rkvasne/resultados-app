const DATA = JSON.parse(document.getElementById('data').textContent);
const PRESIDENT_DATA = window.PRESIDENT_DATA;
const PRESIDENT_DATA_2T = window.PRESIDENT_DATA_2T;
const $ = id => document.getElementById(id);
const firstTurnNote = document.querySelector('.note').innerHTML;
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
const selectedSections = new Set();

const officeOrder = ['Presidente', 'Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual'];

function addTurnFilter() {
  const field = document.createElement('div');
  field.className = 'field turn-field';
  field.innerHTML = '<label for="turn">Turno</label><select id="turn" aria-label="Turno da eleição"><option value="1">1º turno · 04/10/2026</option><option value="2" selected>2º turno · 25/10/2026</option></select>';
  document.querySelector('.filters').prepend(field);
}

function activePresidentData() {
  return $('turn').value === '2' ? PRESIDENT_DATA_2T : PRESIDENT_DATA;
}

function activeSections() {
  if ($('turn').value === '2') return PRESIDENT_DATA_2T.sections;
  return $('office').value === 'Presidente' ? PRESIDENT_DATA.sections : DATA.sections;
}

function sectionKey(row) {
  return [$('turn').value, row.z, row.mun, row.sec].join('|');
}

function addReportDialog() {
  const dialog = document.createElement('dialog');
  dialog.id = 'report-dialog';
  dialog.setAttribute('aria-labelledby', 'report-title');
  dialog.innerHTML = '<div class="report-dialog-actions"><button class="btn" type="button" id="close-report">Voltar ao painel</button><button class="btn report-print" type="button" id="print-report">Imprimir / salvar PDF</button></div><article id="report-preview" class="report-preview"></article>';
  document.body.append(dialog);
  $('close-report').addEventListener('click', () => dialog.close());
  $('print-report').addEventListener('click', () => window.print());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

function reportRows() {
  const selectedKeys = selectedSections;
  return activeSections()
    .filter(row => selectedKeys.has(sectionKey(row)))
    .sort((a, b) => a.z - b.z || a.mun.localeCompare(b.mun, 'pt-BR') || a.sec - b.sec);
}

function reportSources() {
  const turn = $('turn').value;
  const president = turn === '2' || $('office').value === 'Presidente';
  const data = turn === '2' ? PRESIDENT_DATA_2T : president ? PRESIDENT_DATA : null;
  if (data) {
    const attendance = data.sourceFiles?.attendance || 'docs/detalhe_votacao_secao_2026_2t/detalhe_votacao_secao_2026_BR.csv';
    const votes = data.sourceFiles?.votes || (turn === '2' ? 'docs/votacao_secao_2026_BR_2t/votacao_secao_2026_BR.csv' : 'docs/votacao_secao_2026_BR/votacao_secao_2026_BR.csv');
    const stamp = (date, time) => [date, time].filter(Boolean).join(' ');
    return [
      { label: 'Comparecimento e abstenção', file: attendance, generated: stamp(data.detailGeneratedAt, data.detailGeneratedTime) },
      { label: 'Votação presidencial por seção', file: votes, generated: stamp(data.sourceGeneratedAt, data.sourceGeneratedTime) }
    ];
  }
  return [{
    label: 'Comparecimento e abstenção por seção',
    file: 'docs/detalhe_votacao_secao_2026/detalhe_votacao_secao_2026_RO.csv',
    generated: ''
  }];
}

function showReport() {
  const rows = reportRows();
  if (!rows.length) return;
  const summary = totals(rows);
  const weightedRate = pct(summary.abs, summary.apt);
  const averageRate = rows.reduce((total, row) => total + pct(row.abs, row.apt), 0) / rows.length;
  const date = $('turn').value === '2' ? '25/10/2026' : '04/10/2026';
  const cargo = $('turn').value === '2' ? 'Presidente' : $('office').value;
  const isPresident = $('turn').value === '2' || cargo === 'Presidente';
  const sources = reportSources();
  const zones = [...new Set(rows.map(row => row.z))].sort((a, b) => a - b);
  const sourceItems = sources.map(source => `<li><strong>${escapeHtml(source.label)}:</strong> <code>${escapeHtml(source.file)}</code>${source.generated ? ` · geração informada no CSV: ${escapeHtml(source.generated)}` : ' · data de geração não registrada no recorte da página'}</li>`).join('');
  const electionCode = $('turn').value === '2' ? '6258' : isPresident ? '6257' : '6259';
  const sectionNumbers = rows.map(row => `${row.z}ª ZE/${row.sec}`).join(', ');
  const sourceNote = `TSE, Dados Abertos — Resultados 2026. Eleição ${electionCode}; turno ${$('turn').value}; data ${date}; UF RO; ZE ${zones.join(', ')}; cargo ${isPresident ? '1 (Presidente)' : 'estadual'}; seção(ões): ${sectionNumbers}.`;
  const generatedAt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  const metrics = [
    ['Seções selecionadas', fmt(rows.length)],
    ['Eleitores aptos', fmt(summary.apt)],
    ['Comparecimento', `${fmt(summary.comp)} (${pf(pct(summary.comp, summary.apt))})`],
    ['Abstenções', fmt(summary.abs)],
    ['Taxa ponderada', pf(weightedRate)]
  ];
  const body = rows.map(row => `<tr><td class="num">${row.z}</td><td>${escapeHtml(row.mun)}</td><td class="num">${fmt(row.sec)}</td><td class="num">${row.local ? fmt(row.local) : '—'}</td><td>${escapeHtml(row.nome)}</td><td class="num">${fmt(row.apt)}</td><td class="num">${fmt(row.comp)}</td><td class="num">${pf(pct(row.comp, row.apt))}</td><td class="num">${fmt(row.abs)}</td><td class="num">${pf(pct(row.abs, row.apt))}</td></tr>`).join('');
  const selectedLabel = rows.length === 1 ? '1 seção selecionada' : `${rows.length} seções selecionadas`;
  $('report-preview').innerHTML = `<header class="report-heading"><p>Eleições Gerais 2026 · ${date}</p><h1 id="report-title">Consulta de Comparecimento e Abstenção</h1><p>${$('turn').value}º turno · Cargo para resultados: ${escapeHtml(cargo)} · ${selectedLabel}</p></header><section class="report-metrics" aria-label="Resumo das seções selecionadas">${metrics.map(([name, value]) => `<div class="report-metric"><span>${name}</span><strong>${value}</strong></div>`).join('')}</section><p class="report-method">Taxa ponderada = total de abstenções ÷ total de eleitores aptos. A média simples das taxas por seção neste recorte é ${pf(averageRate)}; ela não substitui a taxa ponderada.</p><div class="report-table-wrap"><table class="report-table"><thead><tr><th class="num">ZE</th><th>Município</th><th class="num">Seção</th><th class="num">Local nº</th><th>Local de votação</th><th class="num">Aptos</th><th class="num">Comparecimento</th><th class="num">Comparecimento %</th><th class="num">Abstenções</th><th class="num">Abstenção %</th></tr></thead><tbody>${body}</tbody></table></div><section class="report-provenance" aria-label="Fonte e critérios dos dados"><h2>Fonte e critérios dos dados</h2><p>${escapeHtml(sourceNote)} Cruzamento dos registros por zona eleitoral, município e seção.</p><ul>${sourceItems}</ul><p>Catálogo: <a href="https://dadosabertos.tse.jus.br/dataset/resultados-2026">TSE — Dados Abertos, Resultados 2026</a>. Os percentuais e totais do relatório são calculados pelo painel a partir dos totais por seção.</p></section><footer class="report-footer">Relatório independente gerado em ${generatedAt}.</footer>`;
  $('report-dialog').showModal();
}

function updateSelectionControls() {
  const count = selectedSections.size;
  const countLabel = document.querySelector('#selection-count');
  if (countLabel) countLabel.textContent = `${fmt(count)} ${count === 1 ? 'seção selecionada' : 'seções selecionadas'}`;
  const reportButton = document.querySelector('#preview-report');
  if (reportButton) reportButton.disabled = count === 0;
  const clearButton = document.querySelector('#clear-selection');
  if (clearButton) clearButton.disabled = count === 0;
  const pageRows = rowsCurrent.slice(page * 50, (page + 1) * 50);
  const pageButton = document.querySelector('#toggle-page-selection');
  if (pageButton) {
    pageButton.disabled = pageRows.length === 0;
    pageButton.textContent = pageRows.length && pageRows.every(row => selectedSections.has(sectionKey(row))) ? 'Desmarcar página' : 'Selecionar página';
  }
}

function orderOfficeOptions() {
  const select = $('office');
  const options = [...select.options];
  options.sort((first, second) => officeOrder.indexOf(first.value || first.textContent) - officeOrder.indexOf(second.value || second.textContent));
  select.replaceChildren(...options);
}

function scope(row) {
  return (!$('zone').value || String(row.z) === $('zone').value) && (!$('city').value || row.mun === $('city').value);
}

function scoped() {
  return activeSections().filter(row => scope(row) && (!$('place').value || [row.z, row.mun, row.local].join('|') === $('place').value));
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
  for (const row of activeSections().filter(scope)) {
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
  const secondTurn = $('turn').value === '2';
  help.id = 'office-help';
  $('office').setAttribute('aria-describedby', help.id);
  $('office').disabled = secondTurn;
  help.textContent = secondTurn
    ? 'No 2º turno, o painel apresenta apenas Presidente e a abstenção da apuração de 25/10/2026.'
    : isPresident
    ? 'Indicadores e votos usam a apuração presidencial do TSE. A visão por partido não está disponível.'
    : 'Indicadores e votos usam a apuração estadual do TSE.';
}

function dataForTab() {
  const sections = scoped();
  const office = $('office').value;
  const presidentData = activePresidentData();
  if (tab === 'sections') {
    const voteRows = office === 'Presidente' ? presidentData.sections : DATA.votes;
    const votes = new Map(voteRows.filter(row => row.cargo === office).map(row => [[row.z, row.mun, row.sec].join('|'), row]));
    const mismatchKeys = new Set(presidentData.comparisonMismatches.map(row => [row.z, row.mun, row.sec].join('|')));
    return {
      columns: [['z', 'ZE'], ['mun', 'Município'], ['sec', 'Seção'], ['local', 'Local nº'], ['nome', 'Local de votação'], ['apt', 'Aptos'], ['comp', 'Comparecimento'], ['abs', 'Abstenções'], ['rate', 'Abstenção %'], ['br', 'Brancos'], ['nu', 'Nulos'], ['nom', 'Nominais'], ['leg', 'Legenda'], ['bu', 'Recebimento do BU']],
      rows: sections.map(row => ({ ...row, ...(votes.get([row.z, row.mun, row.sec].join('|')) || {}), rate: pct(row.abs, row.apt) })),
      description: office === 'Presidente'
        ? `Aptos, comparecimento, abstenções e votos presidenciais vêm da apuração do ${$('turn').value}º turno. Soma dos votos igual ao comparecimento em ${sections.filter(section => !mismatchKeys.has([section.z, section.mun, section.sec].join('|'))).length}/${sections.length} seções.`
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
    const matches = presidentData.municipalities.filter(scopeMunicipality);
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
      description: `Votos, aptos, comparecimento e abstenções presidenciais do ${$('turn').value}º turno, consolidados pelas seções disponíveis.`
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
  if (tab === 'candidates' && office === 'Presidente') return { columns: [['z', 'ZE'], ['mun', 'Município'], ['num', 'Número'], ['nome', 'Candidato'], ['votos', 'Votos nominais']], rows: presidentData.candidates.filter(scopeMunicipality), description: `Votos presidenciais nominais do ${$('turn').value}º turno agregados por município/zona. O filtro de local não desagrega esses votos.` };
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
  const pageRows = rows.slice(page * 50, (page + 1) * 50);
  const selectable = tab === 'sections';
  const body = pageRows.map(row => '<tr>' + (selectable ? `<td class="selection-cell"><input type="checkbox" class="section-select" data-section-key="${escapeHtml(sectionKey(row))}" aria-label="Selecionar seção ${escapeHtml(row.sec)}, zona ${row.z}, ${escapeHtml(row.mun)}" ${selectedSections.has(sectionKey(row)) ? 'checked' : ''}></td>` : '') + data.columns.map(([key]) => {
    let value = row[key];
    if (key === 'rate') value = `<span class="pill">${pf(value)}</span><span class="bar"><span class="fill" style="display:block;width:${Math.min(100, value)}%"></span></span>`;
    else if (typeof value === 'number') value = fmt(value);
    else value = escapeHtml(value);
    return `<td class="${typeof row[key] === 'number' ? 'num' : ''}">${value ?? ''}</td>`;
  }).join('') + '</tr>').join('');
  const titles = { sections: 'Abstenção e votos por seção', places: 'Consolidado por local de votação', comparison: 'Comparativo eleitoral', candidates: 'Votação nominal por candidato', parties: 'Votação por partido' };
  $('tabcontent').innerHTML = `<section class="panel"><h2>${titles[tab]}</h2><p class="hint">${data.description}</p>${selectable ? `<div class="selection-toolbar"><div><strong id="selection-count"></strong><span> A seleção é mantida ao alterar os filtros.</span></div><div class="tools"><button class="btn" id="toggle-page-selection">Selecionar página</button><button class="btn" id="preview-report" ${selectedSections.size ? '' : 'disabled'}>Prévia do relatório</button><button class="btn" id="clear-selection" ${selectedSections.size ? '' : 'disabled'}>Limpar seleção</button></div></div>` : ''}<div class="toolbar"><div><b>${fmt(rows.length)}</b> registros encontrados</div><div class="tools"><input class="search" id="q" value="${escapeHtml(search)}" placeholder="Buscar nome, seção, município..." aria-label="Buscar na tabela"><button class="btn" id="download">Exportar CSV filtrado</button><button class="btn" id="reset">Limpar busca</button></div></div><div class="table-wrap"><table><thead><tr>${selectable ? '<th class="selection-cell">Selecionar</th>' : ''}${data.columns.map(([key, label]) => {
    const isSorted = sortKey === key;
    const direction = sortDir === 1 ? 'ascending' : 'descending';
    const indicator = isSorted ? (sortDir === 1 ? '↑' : '↓') : '';
    return `<th data-key="${key}" class="${typeof rows[0]?.[key] === 'number' ? 'num' : ''}" aria-sort="${isSorted ? direction : 'none'}"><button class="sort-button" type="button" aria-label="Ordenar por ${label}">${label}<span aria-hidden="true">${indicator}</span></button></th>`;
  }).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${data.columns.length + (selectable ? 1 : 0)}">Nenhum resultado corresponde aos filtros.</td></tr>`}</tbody></table></div><div class="page-controls"><span>Página ${page + 1} de ${totalPages} · Até 50 registros por página</span><div class="tools"><button class="btn" id="prev" ${page === 0 ? 'disabled' : ''}>Anterior</button><button class="btn" id="next" ${page >= totalPages - 1 ? 'disabled' : ''}>Próxima</button></div></div></section>`;
  updateSelectionControls();
  if (selectable) {
    $('toggle-page-selection').onclick = () => {
      const allSelected = pageRows.length > 0 && pageRows.every(row => selectedSections.has(sectionKey(row)));
      for (const row of pageRows) {
        if (allSelected) selectedSections.delete(sectionKey(row));
        else selectedSections.add(sectionKey(row));
      }
      show();
    };
    $('preview-report').onclick = showReport;
    $('clear-selection').onclick = () => { selectedSections.clear(); show(); };
  }
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

function updateTurn() {
  const secondTurn = $('turn').value === '2';
  const presidentSelected = $('office').value === 'Presidente';
  if (secondTurn) $('office').value = 'Presidente';
  updatePlaces();
  updateOfficeGuidance();
  document.querySelector('header p').textContent = `Painel independente · Dados públicos do TSE · Rondônia · ${$('turn').value}º turno (${secondTurn ? '25/10/2026' : '04/10/2026'}).`;
  document.querySelector('.note').innerHTML = secondTurn
    ? '<b>Como interpretar:</b> No 2º turno, os indicadores de aptos, comparecimento e abstenção vêm do detalhe presidencial por seção de 25/10/2026. Os votos presidenciais vêm do arquivo de votação por seção do mesmo turno. A taxa geral é ponderada pelos eleitores aptos.'
    : presidentSelected
      ? '<b>Como interpretar:</b> No 1º turno, ao selecionar Presidente, aptos, comparecimento, abstenções e votos usam a apuração presidencial do TSE. Em quatro seções, aptos e comparecimento diferem da apuração estadual; as abstenções coincidem. A taxa geral é ponderada pelos eleitores aptos.'
      : firstTurnNote;
}

function download() {
  const encode = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const output = [colCurrent.map(column => encode(column[1])).join(';'), ...rowsCurrent.map(row => colCurrent.map(([key]) => encode(key === 'rate' ? pf(row[key]) : row[key])).join(';'))].join('\r\n');
  const blob = new Blob(['\ufeff' + output], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `painel_tse_2026_turno${$('turn').value}_${tab}_ZE_${$('zone').value || '3_30'}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

for (const id of ['zone', 'city']) $(id).onchange = () => { updatePlaces(); page = 0; show(); };
for (const id of ['place', 'office']) $(id).onchange = () => { page = 0; if (id === 'office') updateTurn(); show(); };
document.addEventListener('change', event => {
  if (event.target.matches('.section-select')) {
    const key = event.target.dataset.sectionKey;
    if (event.target.checked) selectedSections.add(key);
    else selectedSections.delete(key);
    updateSelectionControls();
    return;
  }
  if (event.target.id !== 'turn') return;
  page = 0;
  search = '';
  sortKey = '';
  sortDir = -1;
  selectedSections.clear();
  updateTurn();
  show();
});
document.querySelectorAll('.tab').forEach(element => element.onclick = () => {
  tab = element.dataset.tab;
  document.querySelectorAll('.tab').forEach(button => button.classList.toggle('active', button === element));
  sortKey = '';
  sortDir = -1;
  page = 0;
  search = '';
  show();
});
addTurnFilter();
addReportDialog();
orderOfficeOptions();
updatePlaces();
document.querySelector('label[for="office"]').textContent = 'Votos exibidos';
updateTurn();
updateOfficeGuidance();
show();
