# Arquitetura e funcionamento

## Visão geral

O projeto é uma página estática, sem etapa de build ou servidor de aplicação. O navegador carrega o HTML, os estilos locais, a lógica JavaScript e os dados locais dos cargos estaduais e de Presidente.

## Componentes

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da página e JSON utilizado pelo painel. |
| `styles.css` | Apresentação base e estados visuais. |
| `responsive.css` | Ajustes de leiaute para tablets e celulares. |
| `presidente_2026.js` | Recorte local de votos presidenciais por seção, candidato e município/zona. |
| `script.js` | Filtros, métricas, tabelas, ordenação, paginação e exportação CSV. |
| `scripts/import-president.js` | Extrator em fluxo do CSV nacional do TSE e validador do recorte presidencial. |
| `VERSION` | Versão corrente do painel, em SemVer. |

Como o projeto não está conectado ao Hub e não contém um script de sincronização de versão, aplique bumps manualmente em `VERSION`, neste README e na meta `application-version` de `index.html`; depois, confira as referências da versão anterior.

Os arquivos da interface precisam permanecer juntos. As folhas de estilo, os scripts e o favicon são carregados por caminhos relativos no HTML; a página pode ser aberta localmente em um navegador moderno.

## Fluxo dos dados

1. O navegador interpreta o JSON estadual em `script#data` e carrega o recorte presidencial de `presidente_2026.js`.
2. O JavaScript filtra as seções por zona, município e local.
3. As métricas de aptos, comparecimento e abstenções são agregadas a partir das seções filtradas.
4. Votos por cargo são associados às seções para a tabela de seção; consolidados, candidatos e partidos usam seus conjuntos próprios.
5. A exportação CSV é criada no navegador a partir das linhas filtradas na visão atual.

O seletor **Votos exibidos** escolhe somente os dados de votação e apresenta uma orientação contextual: a base de aptos, comparecimento e abstenção é comum à seção e não muda com o cargo. Para Presidente, a visão por partido fica oculta porque o recorte por seção não contém a classificação partidária. A ordenação das tabelas usa botões acessíveis por teclado e comunica a coluna e a direção com `aria-sort`.

## Persistência e rede

Os dados locais são lidos em memória durante a execução da página. O painel não grava alterações em `localStorage`, não usa banco de dados e não envia os dados consultados a um servidor. A exportação gera um arquivo CSV baixável pelo navegador.

Os CSVs de origem não são atualizados automaticamente. Para atualizar os cargos estaduais, substitua o JSON incorporado ao HTML; para Presidente, gere `presidente_2026.js` com `node scripts/import-president.js --write`. Consulte [Fontes e tratamento dos dados](data-sources.md).

## Verificação manual

Após atualizar o HTML, mantenha os arquivos CSS e JavaScript ao lado dele e abra-o em um navegador. Confira filtros geográficos, orientação contextual do cargo (incluindo Presidente), indicadores de abstenção, busca, ordenação com mouse e teclado, estado `aria-sort`, paginação e exportação. Em celular, confirme que a página não cria rolagem horizontal e que a tabela mantém rolagem própria. Compare os totais com os consolidados oficiais antes de distribuir os arquivos.
