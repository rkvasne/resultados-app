# Fontes e tratamento dos dados

## Fonte e escopo

O painel foi montado a partir de arquivos públicos de resultados do Tribunal Superior Eleitoral (TSE), referentes ao primeiro turno das Eleições Gerais de 2026, realizado em 4 de outubro. O escopo atual é Rondônia, Zonas Eleitorais 3 e 30: Ji-Paraná e Presidente Médici na 3ª ZE; Ji-Paraná na 30ª ZE.

O histórico registra a página [Resultados 2026 — Dados Abertos do TSE](https://dadosabertos.tse.jus.br/dataset/resultados-2026) como referência para os conjuntos. Confirme a eleição, o turno e a abrangência nos próprios arquivos antes de processar uma nova extração.

## Arquivos de origem no projeto

| Conjunto | Pasta/arquivo | Granularidade e uso |
| --- | --- | --- |
| Detalhe da votação por seção | `detalhe_votacao_secao_2026/` | Aptos, comparecimento, abstenções e resultados por seção para os cargos estaduais. Base dos indicadores de abstenção. |
| Detalhe da votação por município/zona | `detalhe_votacao_munzona_2026/` | Consolidados oficiais e estatísticas por município/zona. Usado para comparações e conferência dos totais. |
| Votação por candidato e município/zona | `votacao_candidato_munzona_2026/` | Votos de candidatos agregados por município/zona. Não permite detalhamento por seção ou local. |
| Votação por partido e município/zona | `votacao_partido_munzona_2026/` | Votos nominais e de legenda agregados por município/zona. |
| Votação por seção no Brasil | `votacao_secao_2026_BR/` | Votos por candidato e seção, incluindo o cargo Presidente. A base nacional é grande e ainda não foi integrada ao HTML. |

Os arquivos compactados no diretório raiz podem ser cópias de distribuição das mesmas fontes. Eles não são lidos pelo painel em tempo de execução.

As fontes brutas e seus arquivos compactados são ignorados pelo Git para evitar que arquivos nacionais grandes sejam incluídos no primeiro commit. O painel publicado continua funcional porque usa o recorte JSON incorporado em `index.html`.

## Abstenção

A taxa é calculada como:

```text
abstenções ÷ eleitores aptos × 100
```

O arquivo por seção apresenta registros por cargo e repete valores de comparecimento/abstenção para a mesma seção. O painel mantém uma base única por seção para os indicadores; nunca some essas repetições entre cargos. Em agregações, calcule a taxa sobre os totais de abstenções e aptos, em vez de tirar a média simples das taxas das seções.

## Integração presidencial pendente

O CSV `votacao_secao_2026_BR.csv` contém votos presidenciais por seção, mas não substitui a base de aptos, comparecimento e abstenções já usada pelo painel. O histórico registra que o arquivo nacional tem cerca de 157 MB compactado e mais de 1 GB descompactado; processe-o em fluxo ou blocos e retenha apenas os registros necessários para RO e zonas 3 e 30.

Antes de incorporar a votação presidencial:

1. Confirme `CD_ELEICAO`, `NR_TURNO`, `SG_UF`, cargo, município, zona e seção nos registros filtrados.
2. Cruze votos com a seção correspondente da base de comparecimento; inclua a UF e o código/nome municipal na chave, além de zona e seção.
3. Preserve os votos conforme as categorias e descrições oficiais do CSV; não trate ausência de linha de candidato como voto de comparecimento ou abstenção.
4. Compare votos e totais presidenciais por município/zona com os consolidados oficiais antes da publicação.
5. Atualize a interface para identificar que Presidente controla os votos exibidos, enquanto a abstenção continua sendo da seção.

Não incorpore a base nacional completa ao HTML. Gere um recorte pequeno e documente origem, filtros, chaves de cruzamento, totais e data de extração.

## Limitações conhecidas

- A página representa as seções apuradas; isso não equivale necessariamente a uma urna física por seção cadastral.
- Candidatos e partidos estão disponíveis no painel apenas por município/zona.
- Os dados são estáticos e refletem a extração incorporada ao HTML; a presença de CSVs atualizados na pasta não atualiza a página automaticamente.
- Presidente ainda não está disponível nas tabelas do painel, embora a fonte nacional por seção esteja presente no repositório.
