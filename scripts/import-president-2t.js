const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { Transform } = require('node:stream');
const { TextDecoder } = require('node:util');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const paths = args.filter(argument => !argument.startsWith('--'));
const write = args.includes('--write');
const votesPath = path.resolve(root, paths[0] || 'docs/votacao_secao_2026_BR_2t/votacao_secao_2026_BR.csv');
const detailPath = path.resolve(root, paths[1] || 'docs/detalhe_votacao_secao_2026_2t/detalhe_votacao_secao_2026_BR.csv');
const outputPath = path.join(root, 'presidente_2026_2t.js');
const expectedSections = 409;

const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
const makeKey = (zone, municipality, section) => `${zone}|${normalize(municipality)}|${section}`;
const makeRegionKey = (zone, municipality) => `${zone}|${normalize(municipality)}`;

function parseCsvRow(line) {
  const fields = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index++;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ';' && !quoted) {
      fields.push(value);
      value = '';
    } else {
      value += character;
    }
  }
  fields.push(value);
  return fields;
}

async function eachCsvRow(inputPath, required, callback) {
  const decoder = new TextDecoder('windows-1252');
  const decodeStream = new Transform({
    transform(chunk, encoding, done) { done(null, decoder.decode(chunk, { stream: true })); },
    flush(done) { done(null, decoder.decode()); }
  });
  const lines = readline.createInterface({ input: fs.createReadStream(inputPath).pipe(decodeStream), crlfDelay: Infinity });
  let headers;
  for await (const line of lines) {
    if (!headers) {
      headers = parseCsvRow(line.replace(/^\uFEFF/, ''));
      const missing = required.filter(name => !headers.includes(name));
      if (missing.length) throw new Error(`Colunas obrigatórias ausentes em ${path.basename(inputPath)}: ${missing.join(', ')}.`);
      continue;
    }
    callback(parseCsvRow(line), headers);
  }
}

function number(value, label) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error(`Valor inválido em ${label}: ${value}`);
  return parsed;
}

async function main() {
  for (const inputPath of [votesPath, detailPath]) {
    if (!fs.existsSync(inputPath)) throw new Error(`CSV não encontrado: ${inputPath}`);
  }

  const baseSections = new Map();
  let detailGeneratedAt = '';
  let detailGeneratedTime = '';
  await eachCsvRow(detailPath, ['DT_GERACAO', 'HH_GERACAO', 'NR_TURNO', 'CD_ELEICAO', 'DT_ELEICAO', 'SG_UF', 'NM_MUNICIPIO', 'NR_ZONA', 'NR_SECAO', 'CD_CARGO', 'DS_CARGO', 'QT_APTOS', 'QT_COMPARECIMENTO', 'QT_ABSTENCOES', 'NR_LOCAL_VOTACAO', 'NM_LOCAL_VOTACAO', 'DS_LOCAL_VOTACAO_ENDERECO', 'DS_MODELO_URNA', 'DT_RECEBIMENTO_BU_HOR_TSE'], (values, headers) => {
    const field = name => values[headers.indexOf(name)];
    if (field('CD_ELEICAO') !== '6258' || field('NR_TURNO') !== '2' || field('DT_ELEICAO') !== '25/10/2026' || field('SG_UF') !== 'RO' || field('CD_CARGO') !== '1' || normalize(field('DS_CARGO')) !== 'PRESIDENTE') return;
    detailGeneratedAt = field('DT_GERACAO');
    detailGeneratedTime = field('HH_GERACAO');
    const zone = Number(field('NR_ZONA'));
    if (zone !== 3 && zone !== 30) return;
    const municipality = field('NM_MUNICIPIO');
    const section = Number(field('NR_SECAO'));
    const key = makeKey(zone, municipality, section);
    if (baseSections.has(key)) throw new Error(`Seção repetida no detalhe do 2º turno: ${key}.`);
    baseSections.set(key, {
      z: zone,
      mun: municipality,
      sec: section,
      local: Number(field('NR_LOCAL_VOTACAO')) || null,
      nome: field('NM_LOCAL_VOTACAO'),
      end: field('DS_LOCAL_VOTACAO_ENDERECO'),
      apt: number(field('QT_APTOS'), `${key}/aptos`),
      comp: number(field('QT_COMPARECIMENTO'), `${key}/comparecimento`),
      abs: number(field('QT_ABSTENCOES'), `${key}/abstenções`),
      modelo: field('DS_MODELO_URNA'),
      bu: field('DT_RECEBIMENTO_BU_HOR_TSE')
    });
  });
  if (baseSections.size !== expectedSections) throw new Error(`Cobertura do detalhe do 2º turno: ${baseSections.size}/${expectedSections} seções; esperado 409.`);

  const voteBySection = new Map();
  const candidateCatalog = new Map();
  const candidateTotals = new Map();
  let matchedRows = 0;
  let unmatchedRows = 0;
  let sourceGeneratedAt = '';
  let sourceGeneratedTime = '';
  await eachCsvRow(votesPath, ['DT_GERACAO', 'HH_GERACAO', 'NR_TURNO', 'CD_ELEICAO', 'DS_ELEICAO', 'DT_ELEICAO', 'SG_UF', 'NM_MUNICIPIO', 'NR_ZONA', 'NR_SECAO', 'CD_CARGO', 'DS_CARGO', 'NR_VOTAVEL', 'NM_VOTAVEL', 'QT_VOTOS'], (values, headers) => {
    const field = name => values[headers.indexOf(name)];
    if (field('CD_ELEICAO') !== '6258' || field('NR_TURNO') !== '2' || field('DT_ELEICAO') !== '25/10/2026' || field('SG_UF') !== 'RO' || field('CD_CARGO') !== '1' || normalize(field('DS_CARGO')) !== 'PRESIDENTE') return;
    const zone = Number(field('NR_ZONA'));
    if (zone !== 3 && zone !== 30) return;
    const key = makeKey(zone, field('NM_MUNICIPIO'), Number(field('NR_SECAO')));
    const section = baseSections.get(key);
    if (!section) { unmatchedRows++; return; }
    const num = field('NR_VOTAVEL');
    const name = field('NM_VOTAVEL');
    if (num !== '95' && num !== '96') candidateCatalog.set(num, { num, nome: name });
    let vote = voteBySection.get(key);
    if (!vote) {
      vote = { z: zone, mun: section.mun, sec: section.sec, cargo: 'Presidente', nom: 0, br: 0, nu: 0, leg: 0, anu: 0 };
      voteBySection.set(key, vote);
    }
    const count = number(field('QT_VOTOS'), `${key}/votos`);
    if (num === '95' || normalize(name) === 'VOTO BRANCO') vote.br += count;
    else if (num === '96' || normalize(name) === 'VOTO NULO') vote.nu += count;
    else {
      vote.nom += count;
      const regionKey = makeRegionKey(zone, section.mun);
      const candidateKey = `${regionKey}|${num}`;
      candidateTotals.set(candidateKey, (candidateTotals.get(candidateKey) || 0) + count);
    }
    sourceGeneratedAt = field('DT_GERACAO');
    sourceGeneratedTime = field('HH_GERACAO');
    matchedRows++;
  });
  if (unmatchedRows) throw new Error(`${unmatchedRows} linhas de votos presidenciais do turno 2 não correspondem ao detalhe das seções selecionadas.`);
  if (voteBySection.size !== baseSections.size) throw new Error(`Cobertura dos votos do turno 2: ${voteBySection.size}/${baseSections.size} seções.`);

  const sections = [...baseSections.values()].map(section => ({ ...section, ...voteBySection.get(makeKey(section.z, section.mun, section.sec)), rate: section.apt ? 100 * section.abs / section.apt : 0 })).sort((a, b) => a.z - b.z || a.mun.localeCompare(b.mun, 'pt-BR') || a.sec - b.sec);
  const comparisonMismatches = sections.flatMap(section => {
    const presidentialBallots = section.nom + section.br + section.nu;
    return presidentialBallots === section.comp ? [] : [{ z: section.z, mun: section.mun, sec: section.sec, presidentialBallots, attendance: section.comp }];
  });
  const regions = [...new Map(sections.map(section => [makeRegionKey(section.z, section.mun), { z: section.z, mun: section.mun }])).values()];
  const candidates = regions.flatMap(region => [...candidateCatalog.values()].map(candidate => ({
    ...region,
    ...candidate,
    votos: candidateTotals.get(`${makeRegionKey(region.z, region.mun)}|${candidate.num}`) || 0
  })));
  candidates.sort((a, b) => a.z - b.z || a.mun.localeCompare(b.mun, 'pt-BR') || b.votos - a.votos || a.num.localeCompare(b.num, 'pt-BR', { numeric: true }));
  const municipalitiesByKey = new Map();
  for (const section of sections) {
    const key = makeRegionKey(section.z, section.mun);
    let summary = municipalitiesByKey.get(key);
    if (!summary) {
      summary = { z: section.z, mun: section.mun, apt: 0, comp: 0, abs: 0, nom: 0, br: 0, nu: 0 };
      municipalitiesByKey.set(key, summary);
    }
    for (const property of ['apt', 'comp', 'abs', 'nom', 'br', 'nu']) summary[property] += section[property];
  }
  const output = {
    source: 'TSE Resultados 2026 — Votação por seção no Brasil + Detalhe da votação por seção no Brasil',
    sourceFiles: {
      attendance: 'docs/detalhe_votacao_secao_2026_2t/detalhe_votacao_secao_2026_BR.csv',
      votes: 'docs/votacao_secao_2026_BR_2t/votacao_secao_2026_BR.csv'
    },
    detailGeneratedAt,
    detailGeneratedTime,
    sourceGeneratedAt,
    sourceGeneratedTime,
    electionCode: 6258,
    turn: 2,
    electionDate: '25/10/2026',
    matchedRows,
    comparisonMismatches,
    sections,
    candidates,
    municipalities: [...municipalitiesByKey.values()].sort((a, b) => a.z - b.z || a.mun.localeCompare(b.mun, 'pt-BR'))
  };
  const totals = sections.reduce((sum, section) => (sum.apt += section.apt, sum.comp += section.comp, sum.abs += section.abs, sum.nom += section.nom, sum.br += section.br, sum.nu += section.nu, sum), { apt: 0, comp: 0, abs: 0, nom: 0, br: 0, nu: 0 });
  console.log(`Eleição ${output.electionCode}, turno ${output.turn} (${output.electionDate}); fonte gerada em ${sourceGeneratedAt}.`);
  console.log(`Seções cobertas: ${sections.length}/${baseSections.size}; linhas aproveitadas: ${matchedRows}; candidatos: ${candidateCatalog.size}.`);
  console.log(`Totais nas 409 seções: ${JSON.stringify(totals)}; divergências votos/comparecimento: ${comparisonMismatches.length}.`);
  if (comparisonMismatches.length) console.log(`Seções com divergência: ${comparisonMismatches.map(item => `${item.z}/${item.mun}/${item.sec} (${item.presidentialBallots} votos; ${item.attendance} comparecimentos)`).join('; ')}`);
  if (write) {
    fs.writeFileSync(outputPath, `window.PRESIDENT_DATA_2T = ${JSON.stringify(output)};\n`, 'utf8');
    console.log(`Arquivo gerado: ${path.relative(root, outputPath)}`);
  } else {
    console.log('Prévia validada. Use --write para gerar presidente_2026_2t.js.');
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
