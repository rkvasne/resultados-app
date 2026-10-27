# Arquitetura e funcionamento

## Visão geral

O projeto é uma página estática, sem etapa de build ou servidor de aplicação. O navegador carrega o HTML, os estilos locais, a lógica JavaScript e os dados locais dos cargos estaduais e de Presidente para os dois turnos.

## Componentes

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da página e JSON utilizado pelo painel. |
| `styles.css` | Apresentação base e estados visuais. |
| `responsive.css` | Ajustes de leiaute para tablets e celulares. |
| `presidente_2026.js` | Recorte presidencial do 1º turno, com comparecimento/abstenção SISTOT e votos por seção, candidato e município/zona. |
| `presidente_2026_2t.js` | Recorte presidencial do 2º turno, com comparecimento/abstenção e votos por seção, candidato e município/zona. |
| `script.js` | Filtros, métricas, tabelas, ordenação, paginação e exportação CSV. |
| `scripts/import-president.js` | Extrator em fluxo do CSV nacional do TSE e validador do recorte presidencial. |
| `scripts/import-president-2t.js` | Extrator e validador do recorte presidencial do 2º turno. |
| `VERSION` | Versão corrente do painel, em SemVer. |
| `.vercelignore` | Limita o deploy aos arquivos estáticos necessários e exclui os CSVs brutos locais. |

Como o projeto não está conectado ao Hub e não contém um script de sincronização de versão, aplique bumps manualmente em `VERSION`, neste README e na meta `application-version` de `index.html`; depois, confira as referências da versão anterior.

Os arquivos da interface precisam permanecer juntos. As folhas de estilo, os scripts e o favicon são carregados por caminhos relativos no HTML; a página pode ser aberta localmente em um navegador moderno.

## Fluxo dos dados

1. O navegador interpreta o JSON estadual em `script#data` e carrega os recortes presidenciais de `presidente_2026.js` e `presidente_2026_2t.js`.
2. O JavaScript filtra as seções por zona, município e local.
3. As métricas de aptos, comparecimento e abstenções são agregadas a partir das seções filtradas.
4. Votos por cargo são associados às seções para a tabela de seção; consolidados, candidatos e partidos usam seus conjuntos próprios.
5. A exportação CSV é criada no navegador a partir das linhas filtradas na visão atual.

O seletor **Votos exibidos** lista os cargos do maior para o menor. No 1º turno, Presidente usa a base presidencial de comparecimento/abstenção do TSE/SISTOT; os demais cargos usam a base estadual. No 2º turno, somente Presidente está disponível. Para Presidente, a visão por partido fica oculta porque o recorte por seção não contém a classificação partidária. A seleção de seções permite gerar uma prévia de relatório, com totais ponderados e impressão pelo navegador. Na impressão, a folha oculta o painel e mantém somente o relatório para evitar páginas vazias. A ordenação das tabelas usa botões acessíveis por teclado e comunica a coluna e a direção com `aria-sort`.

O cabeçalho identifica o produto como painel independente, sem usar a identificação institucional da Justiça Eleitoral. Os indicadores formam uma faixa compacta e as orientações repetidas nos filtros permanecem acessíveis sem ocupar espaço visual.

## Persistência e rede

Os dados locais são lidos em memória durante a execução da página. O painel não grava alterações em `localStorage`, não usa banco de dados e não envia os dados consultados a um servidor. A exportação gera um arquivo CSV baixável pelo navegador.

Os CSVs de origem não são atualizados automaticamente. Para atualizar os cargos estaduais, substitua o JSON incorporado ao HTML; para Presidente, gere os recortes com `node scripts/import-president.js --write` e `node scripts/import-president-2t.js --write`. Consulte [Fontes e tratamento dos dados](data-sources.md).

## Verificação manual

Após atualizar o HTML, mantenha os arquivos CSS e JavaScript ao lado dele e abra-o em um navegador. Confira filtros geográficos, orientação contextual do cargo (incluindo Presidente), indicadores de abstenção, busca, ordenação com mouse e teclado, estado `aria-sort`, paginação e exportação. Em celular, confirme que a página não cria rolagem horizontal e que a tabela mantém rolagem própria. Compare os totais com os consolidados oficiais antes de distribuir os arquivos.

O repositório não contém `package.json`, runner de testes ou suíte automatizada; por isso `npm run verify:full` não está definido. Os checks disponíveis incluem `node --check` nos scripts, prévias validadas dos dois importadores, `git diff --check`, comparação dos totais e conferência funcional no navegador.
