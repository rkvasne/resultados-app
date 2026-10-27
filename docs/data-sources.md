# Fontes e tratamento dos dados

## Fonte e escopo

O painel foi montado a partir de arquivos públicos de resultados do Tribunal Superior Eleitoral (TSE), referentes aos turnos de 4 e 25 de outubro das Eleições Gerais de 2026. O escopo é Rondônia, Zonas Eleitorais 3 e 30: Ji-Paraná e Presidente Médici na 3ª ZE; Ji-Paraná na 30ª ZE. Os resultados do primeiro turno estão em `index.html`; os recortes presidenciais ficam em `presidente_2026.js` e `presidente_2026_2t.js`.

O histórico registra a página [Resultados 2026 — Dados Abertos do TSE](https://dadosabertos.tse.jus.br/dataset/resultados-2026) como referência para os conjuntos. Confirme a eleição, o turno e a abrangência nos próprios arquivos antes de processar uma nova extração.

## Arquivos de origem no projeto

| Conjunto | Pasta/arquivo | Granularidade e uso |
| --- | --- | --- |
| Detalhe da votação por seção | `docs/detalhe_votacao_secao_2026/` | Aptos, comparecimento, abstenções e resultados por seção para os cargos estaduais. Base dos indicadores de abstenção. |
| Detalhe da votação por município/zona | `docs/detalhe_votacao_munzona_2026/` | Consolidados oficiais e estatísticas por município/zona. Usado para comparações e conferência dos totais. |
| Votação por candidato e município/zona | `docs/votacao_candidato_munzona_2026/` | Votos de candidatos agregados por município/zona. Não permite detalhamento por seção ou local. |
| Votação por partido e município/zona | `docs/votacao_partido_munzona_2026/` | Votos nominais e de legenda agregados por município/zona. |
| Votação por seção no Brasil | `docs/votacao_secao_2026_BR/votacao_secao_2026_BR.csv` | Fonte nacional, processada em fluxo para extrair apenas Presidente nas zonas 3 e 30. O recorte compacto usado pela interface está em `presidente_2026.js`. |
| Votação por seção no Brasil, pacote `_2t` | `docs/votacao_secao_2026_BR_2t/votacao_secao_2026_BR.csv` | Contém dados dos dois turnos; o extrator seleciona eleição `6258`, turno `2`, Presidente e a data `25/10/2026`. |
| Detalhe por seção, pacote `_2t` | `docs/detalhe_votacao_secao_2026_2t/detalhe_votacao_secao_2026_BR.csv` | Base presidencial de aptos, comparecimento e abstenções do segundo turno; inclui 409 seções para as ZEs 3 e 30. |

Os arquivos compactados e diretórios de dados brutos ficam sob `docs/` e não são lidos pelo painel em tempo de execução.

As fontes brutas e seus arquivos compactados são ignorados pelo Git e pelo pacote de deploy para manter os grandes CSVs fora do repositório e da publicação. O painel publicado continua funcional porque usa o recorte JSON incorporado em `index.html` e os demais arquivos estáticos locais.

## Abstenção

A taxa é calculada como:

```text
abstenções ÷ eleitores aptos × 100
```

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
