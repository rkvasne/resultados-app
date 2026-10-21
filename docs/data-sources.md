# Fontes e tratamento dos dados

## Fonte e escopo

O painel foi montado a partir de arquivos públicos de resultados do Tribunal Superior Eleitoral (TSE), referentes ao primeiro turno das Eleições Gerais de 2026, realizado em 4 de outubro. O escopo atual é Rondônia, Zonas Eleitorais 3 e 30: Ji-Paraná e Presidente Médici na 3ª ZE; Ji-Paraná na 30ª ZE. Os resultados estaduais estão em `index.html`; o recorte presidencial está em `presidente_2026.js`.

O histórico registra a página [Resultados 2026 — Dados Abertos do TSE](https://dadosabertos.tse.jus.br/dataset/resultados-2026) como referência para os conjuntos. Confirme a eleição, o turno e a abrangência nos próprios arquivos antes de processar uma nova extração.

## Arquivos de origem no projeto

| Conjunto | Pasta/arquivo | Granularidade e uso |
| --- | --- | --- |
| Detalhe da votação por seção | `detalhe_votacao_secao_2026/` | Aptos, comparecimento, abstenções e resultados por seção para os cargos estaduais. Base dos indicadores de abstenção. |
| Detalhe da votação por município/zona | `detalhe_votacao_munzona_2026/` | Consolidados oficiais e estatísticas por município/zona. Usado para comparações e conferência dos totais. |
| Votação por candidato e município/zona | `votacao_candidato_munzona_2026/` | Votos de candidatos agregados por município/zona. Não permite detalhamento por seção ou local. |
| Votação por partido e município/zona | `votacao_partido_munzona_2026/` | Votos nominais e de legenda agregados por município/zona. |
| Votação por seção no Brasil | `votacao_secao_2026_BR/votacao_secao_2026_BR.csv` | Fonte nacional, processada em fluxo para extrair apenas Presidente nas zonas 3 e 30. O recorte compacto usado pela interface está em `presidente_2026.js`. |

Os arquivos compactados no diretório raiz podem ser cópias de distribuição das mesmas fontes. Eles não são lidos pelo painel em tempo de execução.

As fontes brutas e seus arquivos compactados são ignorados pelo Git para evitar que arquivos nacionais grandes sejam incluídos no primeiro commit. O painel publicado continua funcional porque usa o recorte JSON incorporado em `index.html`.

## Abstenção

A taxa é calculada como:

```text
abstenções ÷ eleitores aptos × 100
```

O arquivo por seção apresenta registros por cargo e repete valores de comparecimento/abstenção para a mesma seção. O painel mantém uma base única por seção para os indicadores; nunca some essas repetições entre cargos. Em agregações, calcule a taxa sobre os totais de abstenções e aptos, em vez de tirar a média simples das taxas das seções.

## Integração presidencial

O script `scripts/import-president.js` lê o CSV nacional em fluxo, decodifica Windows-1252 e seleciona eleição `6257`, turno `1`, UF `RO`, cargo `1` (Presidente) e as seções cobertas pelo painel nas zonas 3 e 30. As linhas são cruzadas por zona, município normalizado e seção; o CSV completo não é enviado ao navegador.

O script valida a cobertura de 409/409 seções e classifica `NR_VOTAVEL=95` como branco e `NR_VOTAVEL=96` como nulo; os demais registros são somados como votos nominais. Para refazer o recorte, execute `node scripts/import-president.js --write` com o CSV em `votacao_secao_2026_BR/votacao_secao_2026_BR.csv`.

O CSV presidencial e a base estadual de comparecimento divergem em quatro seções: 3ª ZE/Ji-Paraná (seções 254 e 999) e 30ª ZE/Ji-Paraná (seções 12 e 16), com diferenças de 1 a 3 votos. O extrator preserva ambos os números e reporta esses casos; não altera os valores de aptos, comparecimento ou abstenções do painel nem infere abstenção a partir de votos por cargo.

Ao selecionar Presidente, a interface mostra votos por seção, consolidados municipais/por zona e votos nominais por candidato. A visão por partido fica indisponível porque o arquivo por seção não associa cada candidato a um partido.

## Limitações conhecidas

- A página representa as seções apuradas; isso não equivale necessariamente a uma urna física por seção cadastral.
- Candidatos e partidos estão disponíveis no painel apenas por município/zona.
- Os dados são estáticos e refletem os recortes locais em `index.html` e `presidente_2026.js`; a presença de CSVs atualizados na pasta não atualiza a página automaticamente.
- A base presidencial tem totais de comparecimento ligeiramente diferentes da base estadual em quatro seções; a interface mantém as fontes separadas e documenta essa limitação.
