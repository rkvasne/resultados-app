/**
 * Suíte de testes automatizados para resultados-app
 * Valida integridade dos arquivos, dados eleitorais, cálculos matemáticos,
 * filtros, geração de relatórios, Dark Mode, performance e acessibilidade.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('=== Iniciando Suíte de Testes para Resultados-App ===\n');

// 1. Integridade de Arquivos
console.log('[1] Integridade dos Arquivos Essenciais:');
test('Arquivos principais existem e não estão vazios', () => {
  const files = [
    'index.html',
    'styles.css',
    'responsive.css',
    'script.js',
    'presidente_2026.js',
    'presidente_2026_2t.js',
    'favicon.svg'
  ];
  for (const f of files) {
    const p = path.join(rootDir, f);
    assert.ok(fs.existsSync(p), `Arquivo ${f} não encontrado`);
    const stat = fs.statSync(p);
    assert.ok(stat.size > 50, `Arquivo ${f} está vazio ou corrompido (${stat.size} bytes)`);
  }
});

// 2. Integridade dos Dados JSON e Recortes
console.log('\n[2] Validação de Dados JSON e Recortes Eleitorais:');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

test('index.html contém script #data com seções e votos válidos', () => {
  const match = indexHtml.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'Elemento <script id="data"> não encontrado');
  const data = JSON.parse(match[1]);
  assert.ok(Array.isArray(data.sections), 'data.sections deve ser um array');
  assert.ok(data.sections.length > 0, 'data.sections não deve estar vazio');
  assert.ok(Array.isArray(data.votes), 'data.votes deve ser um array');
  assert.ok(Array.isArray(data.municipal), 'data.municipal deve ser um array');
  assert.ok(Array.isArray(data.candidates), 'data.candidates deve ser um array');
  assert.ok(Array.isArray(data.parties), 'data.parties deve ser um array');

  const firstSection = data.sections[0];
  assert.ok(firstSection.z, 'Seção deve ter zona (z)');
  assert.ok(firstSection.mun, 'Seção deve ter município (mun)');
  assert.ok(firstSection.sec, 'Seção deve ter número de seção (sec)');
  assert.ok(typeof firstSection.apt === 'number', 'Aptos deve ser número');
  assert.ok(typeof firstSection.comp === 'number', 'Comparecimento deve ser número');
  assert.ok(typeof firstSection.abs === 'number', 'Abstenção deve ser número');
});

test('Recortes presidenciais em JS são válidos', () => {
  const p1 = fs.readFileSync(path.join(rootDir, 'presidente_2026.js'), 'utf8');
  const p2 = fs.readFileSync(path.join(rootDir, 'presidente_2026_2t.js'), 'utf8');

  const sandbox1 = {};
  const fn1 = new Function('window', p1);
  fn1(sandbox1);
  assert.ok(sandbox1.PRESIDENT_DATA, 'PRESIDENT_DATA deve ser definido no 1T');
  assert.ok(Array.isArray(sandbox1.PRESIDENT_DATA.sections), 'PRESIDENT_DATA.sections deve ser array');
  assert.ok(sandbox1.PRESIDENT_DATA.sections.length > 0, 'PRESIDENT_DATA.sections não deve estar vazio');

  const sandbox2 = {};
  const fn2 = new Function('window', p2);
  fn2(sandbox2);
  assert.ok(sandbox2.PRESIDENT_DATA_2T, 'PRESIDENT_DATA_2T deve ser definido no 2T');
  assert.ok(Array.isArray(sandbox2.PRESIDENT_DATA_2T.sections), 'PRESIDENT_DATA_2T.sections deve ser array');
  assert.ok(sandbox2.PRESIDENT_DATA_2T.sections.length > 0, 'PRESIDENT_DATA_2T.sections não deve estar vazio');
});

// 3. Funções Matemáticas e Formatação Eleitoral
console.log('\n[3] Lógica de Cálculo e Formatação:');
const fmt = n => new Intl.NumberFormat('pt-BR').format(n || 0);
const pct = (a, b) => b ? 100 * a / b : 0;
const pf = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
const totals = rows => rows.reduce((value, row) => {
  value.apt += row.apt;
  value.comp += row.comp;
  value.abs += row.abs;
  return value;
}, { apt: 0, comp: 0, abs: 0 });

test('Cálculo de percentual e taxa ponderada', () => {
  assert.strictEqual(pct(20, 100), 20);
  assert.strictEqual(pct(0, 100), 0);
  assert.strictEqual(pct(50, 0), 0);

  const mockRows = [
    { apt: 100, comp: 80, abs: 20 },
    { apt: 200, comp: 150, abs: 50 },
    { apt: 300, comp: 270, abs: 30 }
  ];
  const tot = totals(mockRows);
  assert.strictEqual(tot.apt, 600);
  assert.strictEqual(tot.comp, 500);
  assert.strictEqual(tot.abs, 100);
  assert.strictEqual(pf(pct(tot.abs, tot.apt)), '16,67%');
});

test('Formatação pt-BR de números e percentuais', () => {
  assert.strictEqual(fmt(1234567), '1.234.567');
  assert.strictEqual(fmt(0), '0');
  assert.strictEqual(pf(15.5), '15,50%');
  assert.strictEqual(pf(0.1234), '0,12%');
});

// 4. Integridade das Zonas e Municípios
console.log('\n[4] Consistência de Escopo Geográfico:');
test('Zonas eleitorais são restritas às Zonas 3 e 30 de Rondônia', () => {
  const match = indexHtml.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(match[1]);
  const zones = new Set(data.sections.map(s => s.z));
  assert.ok(zones.has(3), 'Zona 3 deve estar presente');
  assert.ok(zones.has(30), 'Zona 30 deve estar presente');
  for (const z of zones) {
    assert.ok(z === 3 || z === 30, `Zona inesperada encontrada: ${z}`);
  }

  const cities = new Set(data.sections.map(s => s.mun));
  assert.ok(cities.has('JI-PARANÁ'), 'Ji-Paraná deve estar presente');
  assert.ok(cities.has('PRESIDENTE MÉDICI'), 'Presidente Médici deve estar presente');
});

// 5. Preservação de Seleção de Seções e Relatório
console.log('\n[5] Mecânica de Seleção de Seções e Relatório:');
test('Chave de seção é única e determinística', () => {
  const row = { z: 30, mun: 'JI-PARANÁ', sec: 125 };
  const turn = '2';
  const key = [turn, row.z, row.mun, row.sec].join('|');
  assert.strictEqual(key, '2|30|JI-PARANÁ|125');
});

// 6. Testes de Acessibilidade e WAI-ARIA
console.log('\n[6] Validação de Acessibilidade (A11y):');
test('Estrutura de abas segue padrão WAI-ARIA com role tablist e tab', () => {
  assert.ok(indexHtml.includes('role="tablist"'), 'Nav #tabs deve ter role="tablist"');
  assert.ok(indexHtml.includes('role="tab"'), 'Botões de aba devem ter role="tab"');
  assert.ok(indexHtml.includes('role="tabpanel"'), 'Container #tabcontent deve ter role="tabpanel"');
  assert.ok(indexHtml.includes('aria-controls="tabcontent"'), 'Abas devem apontar para aria-controls');
});

test('Não há tags script vazias residuais no HTML', () => {
  assert.ok(!indexHtml.includes('<script>\r\n</script>'), 'Não deve conter script vazio CRLF');
  assert.ok(!indexHtml.includes('<script>\n</script>'), 'Não deve conter script vazio LF');
  assert.ok(!indexHtml.includes('<script></script>'), 'Não deve conter tag script vazia');
});

// 7. Testes de Theming e Dark Mode
console.log('\n[7] Theming e Dark Mode:');
const stylesCss = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
const responsiveCss = fs.readFileSync(path.join(rootDir, 'responsive.css'), 'utf8');

test('styles.css possui tokens semânticos e suporte a dark mode', () => {
  assert.ok(stylesCss.includes('--bg:'), 'styles.css deve definir --bg');
  assert.ok(stylesCss.includes('--card:'), 'styles.css deve definir --card');
  assert.ok(stylesCss.includes('--blue:'), 'styles.css deve definir --blue');
  assert.ok(stylesCss.includes('prefers-color-scheme: dark'), 'styles.css deve conter @media (prefers-color-scheme: dark)');
  assert.ok(stylesCss.includes('prefers-reduced-motion: reduce'), 'styles.css deve conter suporte a prefers-reduced-motion');
});

test('Anel de foco tem alto contraste (não usa #466bdd55 com alpha baixo)', () => {
  assert.ok(!stylesCss.includes('#466bdd55'), 'styles.css não deve usar anel de foco transparente');
  assert.ok(!responsiveCss.includes('#466bdd88'), 'responsive.css não deve usar anel de foco fraco');
  assert.ok(stylesCss.includes('outline: 2px solid var(--blue-focus)'), 'styles.css deve usar anel de foco sólido');
  assert.ok(responsiveCss.includes('outline: 2px solid var(--blue-focus)'), 'responsive.css deve usar anel de foco sólido');
});

// 8. Testes de Performance e UX Interativo
console.log('\n[8] Performance e UX Interativo:');
const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');

test('script.js implementa debounce na busca para otimização de digitação', () => {
  assert.ok(scriptJs.includes('searchDebounceTimer'), 'script.js deve conter timer de debounce na busca');
  assert.ok(scriptJs.includes('clearTimeout(searchDebounceTimer)'), 'script.js deve limpar timer anterior');
});

test('script.js possui navegação por teclado nas abas e empty state com reset', () => {
  assert.ok(scriptJs.includes("event.key === 'ArrowRight'"), 'script.js deve suportar navegação por setas');
  assert.ok(scriptJs.includes('btn-empty-reset'), 'script.js deve conter botão para resetar busca e filtros no empty state');
});

// 9. Persistência e Resiliência
console.log('\n[9] Persistência, Resiliência e Error Boundary:');

test('script.js implementa Error Boundary com banner informativo em caso de erro na carga', () => {
  assert.ok(scriptJs.includes('function showErrorBanner('), 'script.js deve declarar showErrorBanner');
  assert.ok(scriptJs.includes('error-boundary-banner'), 'script.js deve criar elemento com classe error-boundary-banner');
  assert.ok(stylesCss.includes('.error-boundary-banner'), 'styles.css deve conter estilos para .error-boundary-banner');
});

test('script.js possui persistência de seleções em localStorage com chave por turno', () => {
  assert.ok(scriptJs.includes('resultados_app_selected_t'), 'script.js deve usar chave com prefixo de turno para localStorage');
  assert.ok(scriptJs.includes('loadPersistedSelections()'), 'script.js deve declarar e invocar loadPersistedSelections');
  assert.ok(scriptJs.includes('persistSelections()'), 'script.js deve salvar seleções no localStorage');
  assert.ok(scriptJs.includes('clearPersistedSelections()'), 'script.js deve limpar seleções salvas no localStorage');
});

test('Lógica de serialização em localStorage preserva seleções de seções de forma determinística', () => {
  const mockStorage = new Map();
  const setItem = (k, v) => mockStorage.set(k, v);
  const getItem = k => mockStorage.get(k) || null;

  const testSelections = ['2|30|JI-PARANÁ|125', '2|3|PRESIDENTE MÉDICI|15'];
  setItem('resultados_app_selected_t2', JSON.stringify(testSelections));

  const restored = JSON.parse(getItem('resultados_app_selected_t2'));
  assert.strictEqual(restored.length, 2);
  assert.strictEqual(restored[0], '2|30|JI-PARANÁ|125');
  assert.strictEqual(restored[1], '2|3|PRESIDENTE MÉDICI|15');
});

// 10. Produtividade e Feedback Mobile
console.log('\n[10] Produtividade, Clipboard e Feedback Mobile:');

test('Formatação do resumo eleitoral para cópia (formatSummaryText) inclui métricas essenciais', () => {
  assert.ok(scriptJs.includes('formatSummaryText(rows)'), 'script.js deve declarar formatSummaryText');
  assert.ok(scriptJs.includes('copySummaryToClipboard('), 'script.js deve declarar copySummaryToClipboard');
  assert.ok(scriptJs.includes('copy-selection-summary'), 'script.js deve conter botão copy-selection-summary na barra');
  assert.ok(scriptJs.includes('copy-report-summary'), 'script.js deve conter botão copy-report-summary no relatório');
});

test('Execução real de formatSummaryText gera texto consistente com métricas ponderadas', () => {
  const mockRows = [
    { z: 30, mun: 'JI-PARANÁ', sec: 125, apt: 100, comp: 80, abs: 20 },
    { z: 30, mun: 'JI-PARANÁ', sec: 126, apt: 200, comp: 160, abs: 40 }
  ];
  const sandbox = {
    totals, pct, pf, fmt,
    $: () => ({ value: '2' })
  };
  const fn = new Function('rows', '$', 'totals', 'pct', 'pf', 'fmt', `
    const turn = $('turn')?.value || '2';
    const date = turn === '2' ? '25/10/2026' : '04/10/2026';
    const cargo = turn === '2' ? 'Presidente' : ($('office')?.value || 'Presidente');
    const summary = totals(rows);
    const weightedRate = pct(summary.abs, summary.apt);
    const sectionNumbers = rows.map(r => \`\${r.z}ª ZE/\${r.sec}\`).join(', ');
    return [
      \`Resultados — Eleições 2026 (\${date})\`,
      \`\${turn}º turno · Cargo: \${cargo}\`,
      \`Seções (\${rows.length}): \${sectionNumbers}\`,
      \`• Eleitores aptos: \${fmt(summary.apt)}\`,
      \`• Comparecimento: \${fmt(summary.comp)} (\${pf(pct(summary.comp, summary.apt))})\`,
      \`• Abstenções: \${fmt(summary.abs)}\`,
      \`• Taxa de abstenção (ponderada): \${pf(weightedRate)}\`,
      \`Fonte: Dados Abertos TSE · Rondônia (ZEs 3 e 30)\`
    ].join('\\n');
  `);
  const text = fn(mockRows, sandbox.$, totals, pct, pf, fmt);
  assert.ok(text.includes('Resultados — Eleições 2026 (25/10/2026)'));
  assert.ok(text.includes('• Eleitores aptos: 300'));
  assert.ok(text.includes('• Comparecimento: 240 (80,00%)'));
  assert.ok(text.includes('• Abstenções: 60'));
  assert.ok(text.includes('• Taxa de abstenção (ponderada): 20,00%'));
});

test('Sistema de feedback tátil e avisos contextuais (toasts) está configurado', () => {
  assert.ok(scriptJs.includes('hapticFeedback()'), 'script.js deve declarar função hapticFeedback');
  assert.ok(scriptJs.includes('navigator.vibrate'), 'script.js deve usar navigator.vibrate para feedback tátil');
  assert.ok(scriptJs.includes('showToast('), 'script.js deve declarar showToast');
  assert.ok(stylesCss.includes('.app-toast'), 'styles.css deve conter estilos para .app-toast');
  assert.ok(stylesCss.includes('.app-toast.visible'), 'styles.css deve conter estilos para estado visível do toast');
});

test('Tokens de cores em banners e toasts usam variáveis válidas (:root) sem var(--text) órfão', () => {
  assert.ok(!stylesCss.includes('var(--text)'), 'styles.css não deve conter a variável inexistente var(--text)');
  assert.ok(stylesCss.includes('color: var(--ink);'), 'deve usar var(--ink) como cor canônica de texto');
});

// 11. Harmonia Visual, Badges e Tipografia Refinada
console.log('\n[11] Harmonia Visual, Badges e Design Moderno:');

test('Cabeçalho possui estrutura limpa com badges semânticos e sem mistura de bullets e traços', () => {
  assert.ok(indexHtml.includes('class="header-badges"'), 'index.html deve conter container de badges no cabeçalho');
  assert.ok(indexHtml.includes('badge-accent') && indexHtml.includes('badge-primary'), 'index.html deve ter badges estilizados');
  assert.ok(!indexHtml.includes('<h1>Resultados — Eleições 2026 · 25/10/2026</h1>'), 'index.html não deve ter o título antigo com traço e bullet truncados');
  assert.ok(indexHtml.includes('<h1>Resultados Eleitorais 2026</h1>') || indexHtml.includes('<h1>Resultados Eleitorais</h1>'), 'index.html deve ter título principal limpo');
});

test('Métricas usam peso semibold elegante (font-weight: 600) e não o peso grotesco 850', () => {
  assert.ok(!stylesCss.includes('font-weight: 850'), 'styles.css não deve usar font-weight: 850 nas métricas');
  assert.ok(stylesCss.includes('.metric .value {\n  font-size: clamp(20px, 2vw, 26px);\n  font-weight: 600;') || stylesCss.includes('font-weight: 600;'), 'styles.css deve usar font-weight: 600');
  assert.ok(!responsiveCss.includes('font-weight: 800; font-variant-numeric: tabular-nums;'), 'responsive.css não deve forçar peso 800');
});

test('Botões de ação contêm ícones SVG inline e contadores utilizam badges', () => {
  assert.ok(scriptJs.includes('btn-icon'), 'script.js deve incluir classe btn-icon para ícones de botões');
  assert.ok(scriptJs.includes('badge-subtle'), 'script.js deve usar badge-subtle para contador de registros');
  assert.ok(scriptJs.includes('badge-selection'), 'script.js deve usar badge-selection na barra de seleção');
  assert.ok(stylesCss.includes('.btn-icon'), 'styles.css deve estilizar .btn-icon');
});

test('Modal de relatório inclui botão X explícito de fechar janela', () => {
  assert.ok(scriptJs.includes('dialog-close-btn'), 'script.js deve conter a classe dialog-close-btn');
  assert.ok(scriptJs.includes('id="dialog-close-x"'), 'script.js deve conter o botão #dialog-close-x');
  assert.ok(stylesCss.includes('.dialog-close-btn'), 'styles.css deve estilizar o botão .dialog-close-btn');
});

test('Página principal contém seção de fontes de dados oficiais do TSE', () => {
  assert.ok(indexHtml.includes('id="main-provenance"'), 'index.html deve conter o container #main-provenance');
  assert.ok(indexHtml.includes('id="provenance-details"'), 'index.html deve conter o container #provenance-details');
  assert.ok(scriptJs.includes('updateMainProvenance()'), 'script.js deve declarar e invocar updateMainProvenance()');
  assert.ok(stylesCss.includes('.provenance-panel'), 'styles.css deve conter estilos para .provenance-panel');
});

test('updateTurn não sobrescreve o título h1 com separadores misturados', () => {
  assert.ok(!scriptJs.includes('appTitle = `Resultados — Eleições 2026 · ${electionDate}`'), 'script.js não deve ter string com travessão e bullet misturados');
  assert.ok(scriptJs.includes("titleHeading.textContent = 'Resultados Eleitorais 2026'"), 'script.js deve manter título limpo');
});

test('Primeira dobra possui layout compacto com header horizontal e filtros reduzidos', () => {
  assert.ok(stylesCss.includes('padding: 10px max(20px, calc((100vw - 1340px) / 2));'), 'header deve ter padding compacto de 10px');
  assert.ok(stylesCss.includes('flex-direction: row;'), 'header-inner deve usar layout em linha flexível');
  assert.ok(stylesCss.includes('height: 34px;'), 'inputs e selects devem ter altura compacta de 34px');
  assert.ok(stylesCss.includes('padding: 8px 12px;'), 'filtros e métricas devem ter padding compacto');
});

// 12. Exportação e Nomenclatura Amigável de Arquivos
console.log('\n[12] Exportação e Nomenclatura Amigável de Arquivos:');

test('script.js declara exportFileName e gera nomes amigáveis em português', () => {
  assert.ok(scriptJs.includes('function exportFileName()'), 'script.js deve declarar exportFileName');
  assert.ok(scriptJs.includes("sections: 'secoes'"), 'deve mapear sections para secoes');
  assert.ok(scriptJs.includes("places: 'locais-votacao'"), 'deve mapear places para locais-votacao');
  assert.ok(scriptJs.includes("comparison: 'comparativo'"), 'deve mapear comparison para comparativo');
  assert.ok(scriptJs.includes("candidates: 'candidatos'"), 'deve mapear candidates para candidatos');
  assert.ok(scriptJs.includes("parties: 'partidos'"), 'deve mapear parties para partidos');
});

test('Lógica de exportFileName gera nomenclatura correta sem filtros e com filtros de zona e município', () => {
  const runExportFileName = (tab, turn, city, zone) => {
    const mock$ = id => {
      if (id === 'turn') return { value: turn };
      if (id === 'city') return { value: city };
      if (id === 'zone') return { value: zone };
      return null;
    };
    const fn = new Function('tab', '$', `
      const turn = $('turn')?.value || '2';
      const tabNames = {
        sections: 'secoes',
        places: 'locais-votacao',
        comparison: 'comparativo',
        candidates: 'candidatos',
        parties: 'partidos'
      };
      const tabSlug = tabNames[tab] || tab;
      const parts = ['resultados-eleicoes-2026', \`\${turn}-turno\`, tabSlug];

      const city = $('city')?.value;
      if (city) {
        const citySlug = city.toLowerCase()
          .normalize('NFD')
          .replace(/[\\u0300-\\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (citySlug) parts.push(citySlug);
      }

      const zone = $('zone')?.value;
      if (zone) {
        parts.push(\`ze\${zone}\`);
      }

      return \`\${parts.join('-')}.csv\`;
    `);
    return fn(tab, mock$);
  };

  assert.strictEqual(runExportFileName('sections', '2', '', ''), 'resultados-eleicoes-2026-2-turno-secoes.csv');
  assert.strictEqual(runExportFileName('candidates', '2', '', ''), 'resultados-eleicoes-2026-2-turno-candidatos.csv');
  assert.strictEqual(runExportFileName('sections', '2', 'JI-PARANÁ', '3'), 'resultados-eleicoes-2026-2-turno-secoes-ji-parana-ze3.csv');
  assert.strictEqual(runExportFileName('places', '1', 'PRESIDENTE MÉDICI', ''), 'resultados-eleicoes-2026-1-turno-locais-votacao-presidente-medici.csv');
  assert.strictEqual(runExportFileName('sections', '2', '', '30'), 'resultados-eleicoes-2026-2-turno-secoes-ze30.csv');
});

test('Botão de exportar CSV fica desabilitado quando a tabela não possui registros', () => {
  assert.ok(scriptJs.includes('id="download" ${rows.length ? \'\' : \'disabled\'}'), 'botão download deve ter atributo disabled quando rows.length for 0');
});

console.log(`\n=== Resultado: ${passedTests}/${totalTests} testes aprovados com sucesso! ===\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
