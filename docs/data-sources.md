# Fontes e tratamento dos dados

## Fonte e escopo

O painel foi montado a partir de arquivos públicos de resultados do Tribunal Superior Eleitoral (TSE), referentes aos turnos de 4 e 25 de outubro das Eleições Gerais de 2026. O escopo é Rondônia, Zonas Eleitorais 3 e 30: Ji-Paraná e Presidente Médici na 3ª ZE; Ji-Paraná na 30ª ZE. Os resultados do primeiro turno estão em `index.html`; os recortes presidenciais ficam em `presidente_2026.js` e `presidente_2026_2t.js`.

O portal principal é o [Portal de Dados Abertos do TSE](https://dadosabertos.tse.jus.br/). O conjunto usado pelo painel é [Resultados — 2026](https://dadosabertos.tse.jus.br/dataset/resultados-2026). Os arquivos oficiais são distribuídos pelo CDN do TSE e atualizados ao final de cada turno; os importadores filtram o código da eleição, turno, cargo, UF, zona e data dentro do arquivo baixado.

Os links do CDN apontam para o recurso oficial atual, que pode ser substituído quando o TSE publica uma nova apuração. O relatório registra também os campos de geração internos do CSV (`DT_GERACAO` e `HH_GERACAO`) para caracterizar o snapshot efetivamente usado.

## Arquivos de origem no projeto

| Uso no painel | Arquivo oficial no CDN do TSE | Dados derivados |
| --- | --- | --- |
| Seções, comparecimento, abstenção e votos dos cargos estaduais | [detalhe_votacao_secao_2026.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip) | Base por seção do 1º turno; os campos de aptos, comparecimento e abstenções alimentam cartões, tabelas, locais e relatórios. |
| Votos de Presidente por seção | [votacao_secao_2026_BR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2026_BR.zip) | Votos presidenciais por seção e candidato. O recurso é atualizado ao fim de cada turno; a extração filtra eleição, turno, cargo e as ZEs 3 e 30. |
| Comparecimento presidencial do 2º turno | [detalhe_votacao_secao_2026.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2026.zip) | Aptos, comparecimento e abstenções do 2º turno de Presidente. As cópias locais usadas na extração são snapshots do pacote, filtradas para eleição `6258`, turno `2`, data `25/10/2026`, RO e zonas 3 e 30. |
| Comparativos oficiais por município/zona | [detalhe_votacao_munzona_2026.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_munzona/detalhe_votacao_munzona_2026.zip) | Consolidados oficiais utilizados na visão Comparativo dos cargos estaduais. |
| Visão Candidatos dos cargos estaduais | [votacao_candidato_munzona_2026.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2026.zip) | Votação de candidatos por município/zona; não detalha seção nem local. |
| Visão Partidos dos cargos estaduais | [votacao_partido_munzona_2026.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_partido_munzona/votacao_partido_munzona_2026.zip) | Votos nominais e de legenda agregados por município/zona. |
| Catálogo dos conjuntos | [Portal de Dados Abertos do TSE](https://dadosabertos.tse.jus.br/) · [Resultados — 2026](https://dadosabertos.tse.jus.br/dataset/resultados-2026) | Página principal e metadados oficiais dos recursos acima. |

Os arquivos compactados e diretórios de dados brutos ficam sob `docs/` e não são lidos pelo painel em tempo de execução.

As fontes brutas e seus arquivos compactados são ignorados pelo Git e pelo pacote de deploy para manter os grandes CSVs fora do repositório e da publicação. O painel publicado continua funcional porque usa o recorte JSON incorporado em `index.html` e os demais arquivos estáticos locais.

## Abstenção

A taxa é calculada como:

```text
abstenções ÷ eleitores aptos × 100
```

### Identificação das fontes no relatório

O relatório de comparecimento/abstenção informa o catálogo do TSE, código da eleição, turno, data, UF, zonas e números das seções, além do link direto para o ZIP de detalhe por seção que fornece os indicadores. Exibe `DT_GERACAO` e `HH_GERACAO` registrados no CSV usado quando esses campos estão disponíveis. A data/hora de geração do relatório é apresentada à parte e não deve ser confundida com a geração da base.

O relatório não usa os totais de votação para calcular aptos, comparecimento, abstenções ou taxas; por isso, não lista o ZIP de votação como fonte das estatísticas do PDF. Esse ZIP continua sendo utilizado nas visões de resultados por seção e candidatos presidenciais do painel.

O arquivo estadual por seção apresenta registros por cargo e repete valores de comparecimento/abstenção. Para os cargos estaduais, o painel mantém uma base por seção e não soma essas repetições. Para Presidente, utiliza o detalhe específico da eleição presidencial, conforme os relatórios SISTOT. Em qualquer agregação, calcule a taxa sobre os totais de abstenções e aptos, em vez de tirar a média simples das taxas das seções.

## Integração presidencial

O script `scripts/import-president.js` lê em fluxo o CSV nacional de votos e o detalhe presidencial, decodifica Windows-1252 e seleciona eleição `6257`, turno `1`, UF `RO`, cargo `1` (Presidente) e as seções das zonas 3 e 30. As fontes são cruzadas por zona, município normalizado e seção. O recorte local preserva aptos, comparecimento, abstenções e votos; os CSVs completos não são enviados ao navegador.

O script valida a cobertura de 409/409 seções e classifica `NR_VOTAVEL=95` como branco e `NR_VOTAVEL=96` como nulo; os demais registros são somados como votos nominais. Para refazer o recorte, execute `node scripts/import-president.js --write`. O voto vem de `docs/votacao_secao_2026_BR/votacao_secao_2026_BR.csv`; o comparecimento presidencial vem de `docs/detalhe_votacao_secao_2026_2t/detalhe_votacao_secao_2026_BR.csv`, filtrado para eleição `6257`, turno `1` e data `04/10/2026`.

O script `scripts/import-president-2t.js` cruza a votação presidencial com o detalhe de comparecimento do segundo turno usando zona, município normalizado e seção. Ele exige eleição `6258`, turno `2`, cargo Presidente e data `25/10/2026`, valida cobertura de 409 seções e gera `presidente_2026_2t.js`. Para atualizar esse recorte, execute `node scripts/import-president-2t.js --write`.

### Verificação dos arquivos identificados como 2º turno

Há uma inconsistência nos arquivos regionais rotulados `_2t`: os CSVs de Rondônia em `docs/votacao_secao_2026_RO_2t/`, `docs/detalhe_votacao_secao_2026_2t/` e `docs/votacao_candidato_munzona_2026_2t/` registram eleição estadual `6259`, turno `1`, geração em 26/10 e data de eleição 04/10; eles contêm apenas Governador, Senador e deputados. Esses arquivos não foram usados no recorte presidencial do segundo turno.

O pacote nacional de votação marcado `_2t` contém as séries de primeiro e segundo turno: a leitura completa identificou eleição `6258`, turno `2`, em 25/10/2026, além da eleição de primeiro turno. O pacote nacional de detalhe contém, para as zonas 3 e 30, 409 registros presidenciais do turno 2. A interface usa somente linhas do turno 2 e mantém comparecimento/abstenção do detalhe separado dos votos.

No primeiro turno, a base presidencial do TSE/SISTOT difere da estadual em quatro seções: 3ª ZE/Ji-Paraná (seções 254 e 999) e 30ª ZE/Ji-Paraná (seções 12 e 16). Juntas, essas diferenças somam 6 aptos e 6 comparecimentos; as abstenções coincidem. A interface usa os totais presidenciais quando Presidente está selecionado e os estaduais para os demais cargos.

Ao selecionar Presidente, a interface mostra votos por seção, consolidados municipais/por zona e votos nominais por candidato. A visão por partido fica indisponível porque o arquivo por seção não associa cada candidato a um partido.

## Limitações conhecidas

- A página representa as seções apuradas; isso não equivale necessariamente a uma urna física por seção cadastral.
- Candidatos e partidos estão disponíveis no painel apenas por município/zona.
- Os dados são estáticos e refletem os recortes locais em `index.html`, `presidente_2026.js` e `presidente_2026_2t.js`; a presença de CSVs atualizados na pasta não atualiza a página automaticamente.
- A base presidencial tem totais de comparecimento ligeiramente diferentes da base estadual em quatro seções; a interface mantém as fontes separadas e documenta essa limitação.
