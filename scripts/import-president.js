const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { Transform } = require('node:stream');
const { TextDecoder } = require('node:util');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const write = args.includes('--write');
const inputPath = path.resolve(root, args.find(argument => !argument.startsWith('--')) || 'votacao_secao_2026_BR/votacao_secao_2026_BR.csv');
const outputPath = path.join(root, 'presidente_2026.js');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const embeddedData = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);

if (!embeddedData) throw new Error('Não foi encontrado o bloco JSON de dados em index.html.');

const dashboardData = JSON.parse(embeddedData[1]);
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
const makeKey = (zone, municipality, section) => `${zone}|${normalize(municipality)}|${section}`;
const makeRegionKey = (zone, municipality) => `${zone}|${normalize(municipality)}`;
const baseSections = new Map(dashboardData.sections.map(section => [makeKey(section.z, section.mun, section.sec), section]));
const voteBySection = new Map();
const candidateTotals = new Map();
const candidateCatalog = new Map();
const sourceRowsByRegion = new Map();
let matchedRows = 0;
let unmatchedRows = 0;

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

function fieldIndex(headers, name) {
  const index = headers.indexOf(name);
  if (index === -1) throw new Error(`Coluna obrigatória ausente no CSV: ${name}`);
  return index;
}

async function importVotes() {
  const decoder = new TextDecoder('windows-1252');
  const decodeStream = new Transform({
    transform(chunk, encoding, callback) {
      callback(null, decoder.decode(chunk, { stream: true }));
    },
    flush(callback) {
      callback(null, decoder.decode());
    }
  });
  const input = fs.createReadStream(inputPath).pipe(decodeStream);
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  let headers;

  for await (const line of lines) {
    if (!headers) {
      headers = parseCsvRow(line.replace(/^\uFEFF/, ''));
      const required = ['NR_TURNO', 'CD_ELEICAO', 'SG_UF', 'CD_MUNICIPIO', 'NM_MUNICIPIO', 'NR_ZONA', 'NR_SECAO', 'CD_CARGO', 'DS_CARGO', 'NR_VOTAVEL', 'NM_VOTAVEL', 'QT_VOTOS'];
      for (const name of required) fieldIndex(headers, name);
      continue;
    }

    const values = parseCsvRow(line);
    const field = name => values[fieldIndex(headers, name)];
    if (field('CD_ELEICAO') !== '6257' || field('NR_TURNO') !== '1' || field('SG_UF') !== 'RO' || field('CD_CARGO') !== '1' || normalize(field('DS_CARGO')) !== 'PRESIDENTE') continue;

    const number = field('NR_VOTAVEL');
    const name = field('NM_VOTAVEL');
    if (number !== '95' && number !== '96') candidateCatalog.set(number, { num: number, nome: name });

    const zone = Number(field('NR_ZONA'));
    if (zone !== 3 && zone !== 30) continue;

    const municipality = field('NM_MUNICIPIO');
    const sectionNumber = Number(field('NR_SECAO'));
    const key = makeKey(zone, municipality, sectionNumber);
    const baseSection = baseSections.get(key);
    if (!baseSection) {
      unmatchedRows++;
      continue;
    }

    const voteCount = Number(field('QT_VOTOS'));
    if (!Number.isSafeInteger(voteCount) || voteCount < 0) throw new Error(`Quantidade de votos inválida na seção ${key}.`);
    let votes = voteBySection.get(key);
    if (!votes) {
      votes = { z: zone, mun: baseSection.mun, sec: sectionNumber, cargo: 'Presidente', nom: 0, br: 0, nu: 0, leg: 0, anu: 0 };
      voteBySection.set(key, votes);
    }

    if (number === '95' || normalize(name) === 'VOTO BRANCO') {
      votes.br += voteCount;
    } else if (number === '96' || normalize(name) === 'VOTO NULO') {
      votes.nu += voteCount;
    } else {
      votes.nom += voteCount;
      const regionKey = makeRegionKey(zone, baseSection.mun);
      const candidateKey = `${regionKey}|${number}`;
      candidateTotals.set(candidateKey, (candidateTotals.get(candidateKey) || 0) + voteCount);
    }

    const regionKey = makeRegionKey(zone, baseSection.mun);
    sourceRowsByRegion.set(regionKey, (sourceRowsByRegion.get(regionKey) || 0) + 1);
    matchedRows++;
  }
}

function buildOutput() {
  if (unmatchedRows) throw new Error(`${unmatchedRows} linhas presidenciais das zonas 3/30 não correspondem a seções do painel.`);
  if (voteBySection.size !== baseSections.size) throw new Error(`Cobertura incompleta: ${voteBySection.size} seções presidenciais para ${baseSections.size} seções no painel.`);

  const votes = [...voteBySection.values()].sort((left, right) => left.z - right.z || left.mun.localeCompare(right.mun, 'pt-BR') || left.sec - right.sec);
  const comparisonMismatches = votes.flatMap(vote => {
    const attendance = baseSections.get(makeKey(vote.z, vote.mun, vote.sec)).comp;
    const presidentialBallots = vote.nom + vote.br + vote.nu;
    return presidentialBallots === attendance ? [] : [{ z: vote.z, mun: vote.mun, sec: vote.sec, presidentialBallots, attendance }];
  });

  const regions = [...new Map(dashboardData.sections.map(section => [makeRegionKey(section.z, section.mun), { z: section.z, mun: section.mun }])).values()];
  const candidates = regions.flatMap(region => [...candidateCatalog.values()].map(candidate => ({
    ...region,
    ...candidate,
    votos: candidateTotals.get(`${makeRegionKey(region.z, region.mun)}|${candidate.num}`) || 0
  })));
  candidates.sort((left, right) => left.z - right.z || left.mun.localeCompare(right.mun, 'pt-BR') || right.votos - left.votos || left.num.localeCompare(right.num, 'pt-BR', { numeric: true }));

  const municipalitiesByKey = new Map();
  for (const section of dashboardData.sections) {
    const key = makeRegionKey(section.z, section.mun);
    let summary = municipalitiesByKey.get(key);
    if (!summary) {
      summary = { z: section.z, mun: section.mun, apt: 0, comp: 0, abs: 0, nom: 0, br: 0, nu: 0 };
      municipalitiesByKey.set(key, summary);
    }
    summary.apt += section.apt;
    summary.comp += section.comp;
    summary.abs += section.abs;
    const vote = voteBySection.get(makeKey(section.z, section.mun, section.sec));
    summary.nom += vote.nom;
    summary.br += vote.br;
    summary.nu += vote.nu;
  }

  return {
    source: 'TSE votacao_secao_2026_BR.csv',
    electionCode: 6257,
    turn: 1,
    matchedRows,
    comparisonMismatches,
    sections: votes,
    candidates,
    municipalities: [...municipalitiesByKey.values()].sort((left, right) => left.z - right.z || left.mun.localeCompare(right.mun, 'pt-BR'))
  };
}

async function main() {
  if (!fs.existsSync(inputPath)) throw new Error(`CSV não encontrado: ${inputPath}`);
  await importVotes();
  const output = buildOutput();
  const sourceLineCount = [...sourceRowsByRegion.values()].reduce((total, count) => total + count, 0);
  console.log(`Seções cobertas: ${output.sections.length}/${baseSections.size}`);
  console.log(`Linhas do CSV aproveitadas: ${sourceLineCount}; candidatos: ${output.candidates.length}`);
  console.log(`Conferência: ${output.sections.length - output.comparisonMismatches.length}/${output.sections.length} seções têm soma das categorias igual ao comparecimento; diferenças preservadas sem alterar a abstenção.`);
  if (output.comparisonMismatches.length) console.log(`Seções com diferença: ${output.comparisonMismatches.map(item => `${item.z}/${item.mun}/${item.sec} (${item.presidentialBallots} votos; ${item.attendance} comparecimentos)`).join('; ')}`);

  if (write) {
    fs.writeFileSync(outputPath, `window.PRESIDENT_DATA = ${JSON.stringify(output)};\n`, 'utf8');
    console.log(`Arquivo gerado: ${path.relative(root, outputPath)}`);
  } else {
    console.log('Prévia validada. Use --write para gerar presidente_2026.js.');
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
