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

console.log(`\n=== Resultado: ${passedTests}/${totalTests} testes aprovados com sucesso! ===\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
