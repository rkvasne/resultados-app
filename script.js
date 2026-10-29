const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function showErrorBanner(message, details) {
  const container = document.querySelector('main.wrap') || document.body;
  const banner = document.createElement('div');
  banner.className = 'error-boundary-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <div class="error-banner-content">
      <h2>Não foi possível carregar os dados do painel</h2>
      <p>${escapeHtml(message)}</p>
      ${details ? `<pre class="error-banner-details">${escapeHtml(details)}</pre>` : ''}
      <p class="error-banner-help">Certifique-se de que os arquivos <code>index.html</code>, <code>styles.css</code>, <code>presidente_2026.js</code> e <code>presidente_2026_2t.js</code> estão na mesma pasta e recarregue a página.</p>
    </div>
  `;
  container.prepend(banner);
}

let DATA = null;
let PRESIDENT_DATA = null;
let PRESIDENT_DATA_2T = null;

try {
  const dataEl = document.getElementById('data');
  if (!dataEl) throw new Error('Elemento de dados incorporados (#data) não encontrado no HTML.');
  DATA = JSON.parse(dataEl.textContent);
  PRESIDENT_DATA = window.PRESIDENT_DATA;
  PRESIDENT_DATA_2T = window.PRESIDENT_DATA_2T;
  if (!PRESIDENT_DATA || !PRESIDENT_DATA_2T) {
    throw new Error('Arquivos de dados presidenciais (presidente_2026.js ou presidente_2026_2t.js) não foram carregados.');
  }
} catch (err) {
  console.error('Erro de inicialização do painel:', err);
  showErrorBanner(err.message);
}

const firstTurnNote = document.querySelector('.note')?.innerHTML || '';
const fmt = n => new Intl.NumberFormat('pt-BR').format(n || 0);
const pct = (a, b) => b ? 100 * a / b : 0;
const pf = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
let tab = 'sections';
let page = 0;
let sortKey = '';
let sortDir = -1;
let search = '';
let searchDebounceTimer;
let rowsCurrent = [];
let colCurrent = [];
const selectedSections = new Set();

function hapticFeedback() {
  try {
    if (navigator.vibrate) navigator.vibrate(12);
  } catch (_) {}
}

let toastTimer;
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2800);
}

function storageKeyForTurn() {
  const turn = document.getElementById('turn')?.value || '2';
  return `resultados_app_selected_t${turn}`;
}

function loadPersistedSelections() {
  try {
    const raw = localStorage.getItem(storageKeyForTurn());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        selectedSections.clear();
        for (const k of parsed) selectedSections.add(k);
      }
    }
  } catch (_) {}
}

function persistSelections() {
  try {
    localStorage.setItem(storageKeyForTurn(), JSON.stringify([...selectedSections]));
  } catch (_) {}
}

function clearPersistedSelections() {
  try {
    localStorage.removeItem(storageKeyForTurn());
  } catch (_) {}
}

function formatSummaryText(rows) {
  if (!rows || !rows.length) return '';
  const summary = totals(rows);
  const weightedRate = pct(summary.abs, summary.apt);
  const turn = $('turn')?.value || '2';
  const date = turn === '2' ? '25/10/2026' : '04/10/2026';
  const cargo = turn === '2' ? 'Presidente' : ($('office')?.value || 'Presidente');
  const sectionNumbers = rows.map(r => `${r.z}ª ZE/${r.sec}`).join(', ');
  return [
    `Resultados — Eleições 2026 (${date})`,
    `${turn}º turno · Cargo: ${cargo}`,
    `Seções (${rows.length}): ${sectionNumbers}`,
    `• Eleitores aptos: ${fmt(summary.apt)}`,
    `• Comparecimento: ${fmt(summary.comp)} (${pf(pct(summary.comp, summary.apt))})`,
    `• Abstenções: ${fmt(summary.abs)}`,
    `• Taxa de abstenção (ponderada): ${pf(weightedRate)}`,
    `Fonte: Dados Abertos TSE · Rondônia (ZEs 3 e 30)`
  ].join('\n');
}

async function copySummaryToClipboard(rows) {
  if (!rows || !rows.length) return;
  const text = formatSummaryText(rows);
  let success = false;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch (_) {
      success = false;
    }
  }
  if (!success) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      success = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (_) {
      success = false;
    }
  }
  hapticFeedback();
  showToast(success ? 'Resumo copiado para a área de transferência!' : 'Não foi possível copiar o resumo.');
}

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
  dialog.innerHTML = '<div class="report-dialog-actions"><button class="btn" type="button" id="close-report"><svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Voltar ao painel</button><button class="btn" type="button" id="copy-report-summary"><svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar resumo</button><button class="btn report-print" type="button" id="print-report"><svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Imprimir / Salvar PDF</button><button class="dialog-close-btn" type="button" id="dialog-close-x" aria-label="Fechar janela"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div><article id="report-preview" class="report-preview"></article>';
  document.body.append(dialog);
  $('close-report').addEventListener('click', () => dialog.close());
  const closeX = $('dialog-close-x');
  if (closeX) closeX.addEventListener('click', () => dialog.close());
  $('copy-report-summary').addEventListener('click', () => copySummaryToClipboard(reportRows()));
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
    const attendance = data.sourceUrls?.attendance || 'https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip';
    const stamp = (date, time) => [date, time].filter(Boolean).join(' ');
    return [{ label: 'Comparecimento e abstenção', url: attendance, generated: stamp(data.detailGeneratedAt, data.detailGeneratedTime) }];
  }
  return [{
    label: 'Comparecimento e abstenção por seção',
    url: 'https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip',
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
  const sourceItems = sources.map(source => {
    const fileName = new URL(source.url).pathname.split('/').pop();
    return `<li><strong>${escapeHtml(source.label)}:</strong> <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(fileName)}</a>${source.generated ? ` · geração informada no CSV: ${escapeHtml(source.generated)}` : ' · data de geração não registrada no recorte da página'}</li>`;
  }).join('');
  const electionCode = $('turn').value === '2' ? '6258' : isPresident ? '6257' : '6259';
  const sectionNumbers = rows.map(row => `${row.z}ª ZE/${row.sec}`).join(', ');
  const sourceNote = `TSE, Dados Abertos — Resultados 2026. Eleição ${electionCode}; turno ${$('turn').value}; data ${date}; UF RO; ZE ${zones.join(', ')}; ${rows.length} seção(ões): ${sectionNumbers}. Os indicadores abaixo usam o detalhe por seção e não dependem dos votos do cargo.`;
  const generatedAt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  const metrics = [
    ['Seções selecionadas', fmt(rows.length)],
    ['Eleitores aptos', fmt(summary.apt)],
    ['Comparecimento', `${fmt(summary.comp)} (${pf(pct(summary.comp, summary.apt))})`],
    ['Abstenções', fmt(summary.abs)],
    ['Taxa ponderada', pf(weightedRate)]
  ];
  const body = rows.map(row => `<tr><td class="num">${row.z}</td><td>${escapeHtml(row.mun)}</td><td class="num">${fmt(row.sec)}</td><td class="num">${row.local ? fmt(row.local) : '—'}</td><td class="col-local-cell" title="${escapeHtml(row.nome)}"><span class="col-local-text">${escapeHtml(row.nome)}</span></td><td class="num">${fmt(row.apt)}</td><td class="num">${fmt(row.comp)}</td><td class="num">${pf(pct(row.comp, row.apt))}</td><td class="num">${fmt(row.abs)}</td><td class="num">${pf(pct(row.abs, row.apt))}</td></tr>`).join('');
  const selectedLabel = rows.length === 1 ? '1 seção selecionada' : `${rows.length} seções selecionadas`;
  $('report-preview').innerHTML = `<header class="report-heading"><p>Eleições Gerais 2026 · ${date}</p><h1 id="report-title">Consulta de Comparecimento e Abstenção</h1><p>${$('turn').value}º turno · Cargo para resultados: ${escapeHtml(cargo)} · ${selectedLabel}</p></header><section class="report-metrics" aria-label="Resumo das seções selecionadas">${metrics.map(([name, value]) => `<div class="report-metric"><span>${name}</span><strong>${value}</strong></div>`).join('')}</section><p class="report-method">Taxa ponderada = total de abstenções ÷ total de eleitores aptos. A média simples das taxas por seção neste recorte é ${pf(averageRate)}; ela não substitui a taxa ponderada.</p><div class="report-table-wrap"><table class="report-table"><thead><tr><th class="num">ZE</th><th>Município</th><th class="num">Seção</th><th class="num">Local nº</th><th class="col-local-th">Local de votação</th><th class="num">Aptos</th><th class="num">Comparecimento</th><th class="num">Comparecimento %</th><th class="num">Abstenções</th><th class="num">Abstenção %</th></tr></thead><tbody>${body}</tbody></table></div><section class="report-provenance" aria-label="Fonte e critérios dos dados"><h2>Fonte e critérios dos dados</h2><p>${escapeHtml(sourceNote)} Cruzamento dos registros por zona eleitoral, município e seção.</p><ul>${sourceItems}</ul><p>Portal: <a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noopener noreferrer">Dados Abertos do TSE</a>. Conjunto: <a href="https://dadosabertos.tse.jus.br/dataset/resultados-2026" target="_blank" rel="noopener noreferrer">Resultados 2026</a>. Os percentuais e totais do relatório são calculados pelo painel a partir dos totais por seção.</p></section><footer class="report-footer">Gerado em ${generatedAt}.</footer>`;
  $('report-dialog').showModal();
}

function updateSelectionControls() {
  const count = selectedSections.size;
  const countLabel = document.querySelector('#selection-count');
  if (countLabel) countLabel.textContent = `${fmt(count)} ${count === 1 ? 'seção selecionada' : 'seções selecionadas'}`;
  const reportButton = document.querySelector('#preview-report');
  if (reportButton) reportButton.disabled = count === 0;
  const copyButton = document.querySelector('#copy-selection-summary');
  if (copyButton) copyButton.disabled = count === 0;
  const clearButton = document.querySelector('#clear-selection');
  if (clearButton) clearButton.disabled = count === 0;
  const pageRows = rowsCurrent.slice(page * 50, (page + 1) * 50);
  const pageButton = document.querySelector('#toggle-page-selection');
  if (pageButton) {
    pageButton.disabled = pageRows.length === 0;
    const isAll = pageRows.length > 0 && pageRows.every(row => selectedSections.has(sectionKey(row)));
    const checkSvg = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>';
    pageButton.innerHTML = `${checkSvg} <span>${isAll ? 'Desmarcar página' : 'Selecionar página'}</span>`;
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
  if (!help) return;
  const isPresident = $('office').value === 'Presidente';
  const secondTurn = $('turn').value === '2';
  help.id = 'office-help';
  $('office').setAttribute('aria-describedby', help.id);
  $('office').disabled = secondTurn;
  if (secondTurn) {
    help.textContent = '';
    help.style.display = 'none';
  } else {
    help.style.display = 'block';
    help.textContent = isPresident
      ? 'Apuração presidencial oficial do TSE.'
      : 'Apuração estadual oficial do TSE.';
  }
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

function mobileCardHeading(row) {
  if (tab === 'sections') return {
    title: `Seção ${fmt(row.sec)}`,
    subtitle: `${row.z}ª ZE · ${row.mun}`,
    detail: row.nome
  };
  if (tab === 'places') return {
    title: row.nome,
    subtitle: `${row.z}ª ZE · ${row.mun} · Local ${fmt(row.local)}`,
    detail: row.end
  };
  if (tab === 'comparison') return {
    title: row.mun,
    subtitle: `${row.z}ª ZE${row.cargo ? ` · ${row.cargo}` : ''}${row.turn ? ` · ${row.turn}` : ''}`,
    detail: ''
  };
  if (tab === 'candidates') return {
    title: row.nome,
    subtitle: `${row.num}${row.partido ? ` · ${row.partido}` : ''} · ${row.z}ª ZE · ${row.mun}`,
    detail: ''
  };
  return {
    title: row.partido,
    subtitle: `${row.num} · ${row.z}ª ZE · ${row.mun}`,
    detail: ''
  };
}

function mobileCardFields(row, columns, keys) {
  return keys.map(key => {
    const column = columns.find(([columnKey]) => columnKey === key);
    if (!column || row[key] === undefined || row[key] === null || row[key] === '') return '';
    const value = key === 'rate' ? pf(row[key]) : typeof row[key] === 'number' ? fmt(row[key]) : escapeHtml(row[key]);
    return `<div class="data-card-field"><dt>${escapeHtml(column[1])}</dt><dd>${value}</dd></div>`;
  }).filter(Boolean).join('');
}

function renderMobileCard(row, data, selectable) {
  const heading = mobileCardHeading(row);
  const headingKeys = {
    sections: ['z', 'mun', 'sec', 'nome'],
    places: ['z', 'mun', 'local', 'nome', 'end'],
    comparison: ['z', 'mun', 'cargo', 'turn'],
    candidates: ['z', 'mun', 'num', 'nome', 'partido'],
    parties: ['z', 'mun', 'num', 'partido']
  }[tab];
  const primaryKeys = {
    sections: ['apt', 'comp', 'abs', 'rate'],
    places: ['sec', 'apt', 'comp', 'abs', 'rate'],
    comparison: ['apt', 'comp', 'abs', 'rate', 'validos', 'br', 'nu'],
    candidates: ['votos', 'validos'],
    parties: ['leg', 'nom', 'total']
  }[tab];
  const extraKeys = data.columns.map(([key]) => key).filter(key => !headingKeys.includes(key) && !primaryKeys.includes(key) && row[key] !== undefined && row[key] !== null && row[key] !== '');
  const checkbox = selectable
    ? `<label class="data-card-select"><input type="checkbox" class="section-select" data-section-key="${escapeHtml(sectionKey(row))}" aria-label="Selecionar seção ${escapeHtml(row.sec)}, zona ${row.z}, ${escapeHtml(row.mun)}" ${selectedSections.has(sectionKey(row)) ? 'checked' : ''}><span>Selecionar</span></label>`
    : '';
  return `<article class="data-card" role="listitem"><div class="data-card-heading">${checkbox}<div class="data-card-title"><strong>${escapeHtml(heading.title)}</strong><span>${escapeHtml(heading.subtitle)}</span>${heading.detail ? `<p>${escapeHtml(heading.detail)}</p>` : ''}</div></div><dl class="data-card-metrics">${mobileCardFields(row, data.columns, primaryKeys)}</dl>${extraKeys.length ? `<details class="data-card-more"><summary>Ver outros dados</summary><dl class="data-card-details">${mobileCardFields(row, data.columns, extraKeys)}</dl></details>` : ''}</article>`;
}

function show() {
  const presidentSelected = $('office').value === 'Presidente';
  const partiesTab = document.querySelector('[data-tab="parties"]');
  partiesTab.classList.toggle('hidden', presidentSelected);
  partiesTab.setAttribute('aria-hidden', String(presidentSelected));
  if (presidentSelected && tab === 'parties') tab = 'sections';
  document.querySelectorAll('.tab').forEach(element => {
    const selected = element.dataset.tab === tab;
    element.classList.toggle('active', selected);
    element.setAttribute('aria-selected', String(selected));
    element.setAttribute('tabindex', selected ? '0' : '-1');
  });
  const tabContent = $('tabcontent');
  if (tabContent) {
    tabContent.setAttribute('aria-labelledby', `tab-${tab}`);
  }
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
  const body = pageRows.map(row => '<tr>' + (selectable ? `<td class="selection-cell"><input type="checkbox" class="section-select" data-section-key="${escapeHtml(sectionKey(row))}" aria-label="Selecionar seção ${escapeHtml(row.sec)}, zona ${row.z}, ${escapeHtml(row.mun)}" ${selectedSections.has(sectionKey(row)) ? 'checked' : ''}></td>` : '') + data.columns.map(([key, label]) => {
    let value = row[key];
    if (key === 'rate') value = `<span class="rate-cell"><span class="pill">${pf(value)}</span><span class="bar"><span class="fill" style="display:block;width:${Math.min(100, value)}%"></span></span></span>`;
    else if (typeof value === 'number') value = fmt(value);
    else value = escapeHtml(value);
    const isNum = typeof row[key] === 'number';
    const isNome = key === 'nome';
    if (isNome) {
      value = `<span class="col-local-text">${value ?? ''}</span>`;
    }
    const cellClass = [isNum ? 'num' : '', isNome ? 'col-local-cell' : '', `col-${key}`].filter(Boolean).join(' ');
    const cellTitle = isNome && row[key] ? ` title="${escapeHtml(row[key])}"` : '';
    return `<td class="${cellClass}" data-label="${escapeHtml(label)}"${cellTitle}>${value ?? ''}</td>`;
  }).join('') + '</tr>').join('');
  const titles = { sections: 'Abstenção e votos por seção', places: 'Consolidado por local de votação', comparison: 'Comparativo eleitoral', candidates: 'Votação nominal por candidato', parties: 'Votação por partido' };
  const emptyMessage = '<div class="empty-state"><p class="empty-text">Nenhum resultado corresponde aos filtros ou à busca.</p><button class="btn btn-empty-reset" type="button"><svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg> Limpar busca e filtros</button></div>';
  const mobileCards = pageRows.map(row => renderMobileCard(row, data, selectable)).join('');
  const iconCheck = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>';
  const iconDoc = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
  const iconCopy = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  const iconClear = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  const iconDownload = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
  const iconPrev = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
  const iconNext = '<svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

  $('tabcontent').innerHTML = `<section class="panel"><h2>${titles[tab]}</h2><p class="hint">${data.description}</p>${selectable ? `<div class="selection-toolbar"><div class="selection-status"><span class="badge badge-selection"><span class="badge-dot badge-dot-active"></span><strong id="selection-count"></strong></span><span class="selection-hint">Seleção preservada ao alternar filtros</span></div><div class="tools"><button class="btn" id="toggle-page-selection">${iconCheck} <span>Selecionar página</span></button><button class="btn" id="preview-report" ${selectedSections.size ? '' : 'disabled'}>${iconDoc} Ver Relatório</button><button class="btn" id="copy-selection-summary" ${selectedSections.size ? '' : 'disabled'}>${iconCopy} Copiar Resumo</button><button class="btn" id="clear-selection" ${selectedSections.size ? '' : 'disabled'}>${iconClear} Limpar</button></div></div>` : ''}<div class="toolbar"><div class="result-count"><span class="badge badge-subtle"><b>${fmt(rows.length)}</b> registros</span></div><div class="tools"><input class="search" id="q" value="${escapeHtml(search)}" placeholder="Buscar por seção, local, município..." aria-label="Buscar na tabela"><button class="btn" id="download" ${rows.length ? '' : 'disabled'}>${iconDownload} Exportar CSV</button><button class="btn" id="reset" ${search ? '' : 'disabled'}>${iconClear} Limpar</button></div></div><div class="mobile-sort"><label for="mobile-sort">Ordenar por</label><select id="mobile-sort">${data.columns.map(([key, label]) => `<option value="${escapeHtml(key)}" ${sortKey === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}</select><button class="btn" type="button" id="mobile-sort-direction" aria-label="Alternar para ordem ${sortDir === 1 ? 'decrescente' : 'crescente'}">${sortDir === 1 ? 'Crescente ↑' : 'Decrescente ↓'}</button></div><div class="mobile-results" role="list" aria-label="Resultados da consulta">${mobileCards || `<div class="mobile-empty">${emptyMessage}</div>`}</div><div class="table-wrap"><table><thead><tr>${selectable ? '<th class="selection-cell">Selecionar</th>' : ''}${data.columns.map(([key, label]) => {
    const isSorted = sortKey === key;
    const direction = sortDir === 1 ? 'ascending' : 'descending';
    const indicator = isSorted ? (sortDir === 1 ? '↑' : '↓') : '';
    const isNum = typeof rows[0]?.[key] === 'number';
    const isNome = key === 'nome';
    const thClass = [isNum ? 'num' : '', isNome ? 'col-local-th' : '', `col-${key}`].filter(Boolean).join(' ');
    const indicatorHtml = indicator ? `<span class="sort-indicator" aria-hidden="true">${indicator}</span>` : '';
    return `<th data-key="${key}" class="${thClass}" aria-sort="${isSorted ? direction : 'none'}"><button class="sort-button" type="button" aria-label="Ordenar por ${label}"><span class="sort-label">${label}</span>${indicatorHtml}</button></th>`;
  }).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${data.columns.length + (selectable ? 1 : 0)}" class="empty-cell">${emptyMessage}</td></tr>`}</tbody></table></div><div class="page-controls"><span>Página ${page + 1} de ${totalPages} · Até 50 registros por página</span><div class="tools"><button class="btn" id="prev" ${page === 0 ? 'disabled' : ''}>${iconPrev} Anterior</button><button class="btn" id="next" ${page >= totalPages - 1 ? 'disabled' : ''}>Próxima ${iconNext}</button></div></div></section>`;
  updateSelectionControls();
  if (selectable) {
    $('toggle-page-selection').onclick = () => {
      const allSelected = pageRows.length > 0 && pageRows.every(row => selectedSections.has(sectionKey(row)));
      for (const row of pageRows) {
        if (allSelected) selectedSections.delete(sectionKey(row));
        else selectedSections.add(sectionKey(row));
      }
      persistSelections();
      hapticFeedback();
      show();
    };
    $('preview-report').onclick = showReport;
    const copyBtn = $('copy-selection-summary');
    if (copyBtn) copyBtn.onclick = () => copySummaryToClipboard(reportRows());
    $('clear-selection').onclick = () => {
      selectedSections.clear();
      clearPersistedSelections();
      hapticFeedback();
      showToast('Seleção de seções limpa.');
      show();
    };
  }
  $('q').addEventListener('input', event => {
    const val = event.target.value;
    const position = event.target.selectionStart;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      search = val;
      page = 0;
      show();
      const input = $('q');
      if (input) {
        input.focus();
        input.setSelectionRange(position, position);
      }
    }, 180);
  });
  $('q').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      clearTimeout(searchDebounceTimer);
      search = event.target.value;
      page = 0;
      show();
    }
  });
  document.querySelectorAll('.btn-empty-reset').forEach(btn => {
    btn.onclick = () => {
      clearTimeout(searchDebounceTimer);
      search = '';
      page = 0;
      $('zone').value = '';
      $('city').value = '';
      $('place').value = '';
      updatePlaces();
      show();
      const input = $('q');
      if (input) input.focus();
    };
  });
  $('download').onclick = download;
  $('reset').onclick = () => {
    clearTimeout(searchDebounceTimer);
    search = '';
    page = 0;
    show();
    const input = $('q');
    if (input) input.focus();
  };
  $('mobile-sort').value = sortKey || data.columns[0][0];
  $('mobile-sort').onchange = event => { sortKey = event.target.value; sortDir = -1; page = 0; show(); };
  $('mobile-sort-direction').onclick = () => { sortDir *= -1; show(); };
  $('prev').onclick = () => { page--; show(); };
  $('next').onclick = () => { page++; show(); };
  document.querySelectorAll('th[data-key]').forEach(element => element.onclick = () => {
    if (sortKey === element.dataset.key) sortDir *= -1;
    else { sortKey = element.dataset.key; sortDir = -1; }
    page = 0;
    show();
  });
}

function updateMainProvenance() {
  const container = $('provenance-details');
  if (!container) return;
  const turn = $('turn')?.value || '2';
  const date = turn === '2' ? '25/10/2026' : '04/10/2026';
  const cargo = turn === '2' ? 'Presidente' : ($('office')?.value || 'Presidente');
  const isPresident = turn === '2' || cargo === 'Presidente';
  const electionCode = turn === '2' ? '6258' : isPresident ? '6257' : '6259';
  const sources = reportSources();
  const sourceItems = sources.map(source => {
    const fileName = new URL(source.url).pathname.split('/').pop();
    return `<li><strong>${escapeHtml(source.label)}:</strong> <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(fileName)}</a>${source.generated ? ` · geração informada no CSV: ${escapeHtml(source.generated)}` : ' · data de geração não informada'}</li>`;
  }).join('');
  container.innerHTML = `<p>Dados oficiais fornecidos pelo Tribunal Superior Eleitoral (TSE) para as Eleições Gerais de 2026 (Eleição ${electionCode}, ${turn}º turno, em ${date}) em Rondônia (Zonas Eleitorais 3 e 30 — Ji-Paraná e Presidente Médici).</p><ul>${sourceItems}</ul><p>Portal público: <a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noopener noreferrer">Dados Abertos do TSE</a> · Conjunto de dados: <a href="https://dadosabertos.tse.jus.br/dataset/resultados-2026" target="_blank" rel="noopener noreferrer">Resultados 2026</a>. Indicadores e taxas calculados diretamente no navegador a partir dos totais de cada seção apurada.</p>`;
}

function updateTurn() {
  const secondTurn = $('turn').value === '2';
  const presidentSelected = $('office').value === 'Presidente';
  if (secondTurn) $('office').value = 'Presidente';
  const titleHeading = document.querySelector('header h1');
  if (titleHeading) titleHeading.textContent = 'Resultados Eleitorais 2026';
  document.title = secondTurn
    ? 'Resultados Eleitorais 2026 — 2º Turno (25/10/2026)'
    : 'Resultados Eleitorais 2026 — 1º Turno (04/10/2026)';
  const turnBadge = $('header-turn-badge');
  if (turnBadge) turnBadge.textContent = secondTurn ? '2º Turno (25/10/2026)' : '1º Turno (04/10/2026)';
  const subtitle = $('header-subtitle');
  if (subtitle) subtitle.textContent = `Apuração e abstenção oficial em Rondônia · ${secondTurn ? '2º Turno' : '1º Turno'}`;
  updatePlaces();
  updateOfficeGuidance();
  updateMainProvenance();
  document.querySelector('.note').innerHTML = secondTurn
    ? '<b>Como interpretar:</b> No 2º turno, os indicadores de aptos, comparecimento e abstenção vêm do detalhe presidencial por seção de 25/10/2026. Os votos presidenciais vêm do arquivo de votação por seção do mesmo turno. A taxa geral é ponderada pelos eleitores aptos.'
    : presidentSelected
      ? '<b>Como interpretar:</b> No 1º turno, ao selecionar Presidente, aptos, comparecimento, abstenções e votos usam a apuração presidencial do TSE. Em quatro seções, aptos e comparecimento diferem da apuração estadual; as abstenções coincidem. A taxa geral é ponderada pelos eleitores aptos.'
      : firstTurnNote;
}

function exportFileName() {
  const turn = $('turn')?.value || '2';
  const tabNames = {
    sections: 'secoes',
    places: 'locais-votacao',
    comparison: 'comparativo',
    candidates: 'candidatos',
    parties: 'partidos'
  };
  const tabSlug = tabNames[tab] || tab;
  const parts = ['resultados-eleicoes-2026', `${turn}-turno`, tabSlug];

  const city = $('city')?.value;
  if (city) {
    const citySlug = city.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (citySlug) parts.push(citySlug);
  }

  const zone = $('zone')?.value;
  if (zone) {
    parts.push(`ze${zone}`);
  }

  return `${parts.join('-')}.csv`;
}

function download() {
  if (!rowsCurrent || !rowsCurrent.length) {
    showToast('Nenhum registro para exportar.');
    return;
  }
  hapticFeedback();
  showToast('Exportando CSV filtrado...');
  const encode = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const output = [colCurrent.map(column => encode(column[1])).join(';'), ...rowsCurrent.map(row => colCurrent.map(([key]) => encode(key === 'rate' ? pf(row[key]) : row[key])).join(';'))].join('\r\n');
  const blob = new Blob(['\ufeff' + output], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = exportFileName();
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

for (const id of ['zone', 'city']) $(id).onchange = () => { clearTimeout(searchDebounceTimer); updatePlaces(); page = 0; show(); };
for (const id of ['place', 'office']) $(id).onchange = () => { clearTimeout(searchDebounceTimer); page = 0; if (id === 'office') updateTurn(); show(); };
document.addEventListener('change', event => {
  if (event.target.matches('.section-select')) {
    const key = event.target.dataset.sectionKey;
    if (event.target.checked) selectedSections.add(key);
    else selectedSections.delete(key);
    persistSelections();
    hapticFeedback();
    updateSelectionControls();
    return;
  }
  if (event.target.id !== 'turn') return;
  clearTimeout(searchDebounceTimer);
  page = 0;
  search = '';
  sortKey = '';
  sortDir = -1;
  selectedSections.clear();
  updateTurn();
  loadPersistedSelections();
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
const tabList = $('tabs');
if (tabList) {
  tabList.addEventListener('keydown', event => {
    const tabs = [...tabList.querySelectorAll('.tab:not(.hidden)')];
    const index = tabs.indexOf(document.activeElement);
    if (index === -1) return;
    let target = -1;
    if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = tabs.length - 1;
    if (target !== -1) {
      event.preventDefault();
      tabs[target].focus();
      tabs[target].click();
    }
  });
}

if (DATA && PRESIDENT_DATA && PRESIDENT_DATA_2T) {
  addTurnFilter();
  addReportDialog();
  orderOfficeOptions();
  updatePlaces();
  document.querySelector('label[for="office"]').textContent = 'Votos exibidos';
  updateTurn();
  loadPersistedSelections();
  updateOfficeGuidance();
  show();
}
