# Arquitetura e funcionamento

## Visão geral

O projeto é uma página estática, sem etapa de build ou servidor de aplicação. O navegador carrega o HTML, os estilos locais, a lógica JavaScript e o conjunto de dados JSON incluído no próprio HTML.

## Componentes

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da página e JSON utilizado pelo painel. |
| `styles.css` | Apresentação base e estados visuais. |
| `responsive.css` | Ajustes de leiaute para tablets e celulares. |
| `script.js` | Filtros, métricas, tabelas, ordenação, paginação e exportação CSV. |
| `VERSION` | Versão corrente do painel, em SemVer. |

Os quatro arquivos precisam permanecer juntos. As folhas de estilo e o JavaScript são carregados por caminhos relativos no HTML; a página pode ser aberta localmente em um navegador moderno.

## Fluxo dos dados

1. O navegador interpreta o JSON no elemento `script#data` do HTML.
2. O JavaScript filtra as seções por zona, município e local.
3. As métricas de aptos, comparecimento e abstenções são agregadas a partir das seções filtradas.
4. Votos por cargo são associados às seções para a tabela de seção; consolidados, candidatos e partidos usam seus conjuntos próprios.
5. A exportação CSV é criada no navegador a partir das linhas filtradas na visão atual.

O seletor de cargo escolhe os dados de votação. A base de abstenção é comum à seção e não deve ser contada novamente para cada cargo.

## Persistência e rede

Os resultados embutidos são lidos em memória durante a execução da página. O painel não grava alterações em `localStorage`, não usa banco de dados e não envia os dados consultados a um servidor. A exportação gera um arquivo CSV baixável pelo navegador.

Os CSVs de origem não são atualizados automaticamente. Para publicar uma atualização, processe as fontes e substitua os dados JSON incorporados ao HTML. Consulte [Fontes e tratamento dos dados](data-sources.md).

## Verificação manual

Após atualizar o HTML, mantenha os arquivos CSS e JavaScript ao lado dele e abra-o em um navegador. Confira filtros geográficos, alternância de cargo, indicadores de abstenção, busca, ordenação, paginação e exportação. Compare os totais com os consolidados oficiais antes de distribuir os arquivos.
