# Changelog

Este arquivo registra mudanças relevantes do painel no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/). A primeira versão publicada é `0.0.1`.

## [0.0.12] - 2026-10-27

### Melhorado

- Alinhados contador, busca, exportação e limpeza em uma única linha em telas largas; em telas estreitas, busca e ações mantêm uma disposição adaptada.

### Verificado

- Controles conferidos no navegador em 1536 px e 390 px; a página mantém sua largura e a visualização móvel continua organizada.
- `git diff --check` sem erros. O repositório não possui `package.json` ou suíte automatizada.

### Aprendizado

- Fato observado: o grupo de busca e ações quebrava em duas linhas no desktop apesar de haver espaço horizontal.
- Ação aplicada: grade explícita para alinhar os controles em uma linha e manter a quebra apenas em larguras móveis.

## [0.0.11] - 2026-10-27

### Melhorado

- Atualizado o título para identificar um painel independente de resultados de Rondônia e removida do relatório a expressão “Relatório independente”.
- Exibidos no relatório os links diretos para os ZIPs oficiais do CDN do TSE e para o catálogo de Resultados 2026; o rodapé ficou reduzido ao horário de geração.
- Reorganizados os cinco filtros em uma grade responsiva, evitando que o último filtro fique isolado em uma segunda linha no desktop.
- Exibidos os resultados em cartões móveis com métricas essenciais e dados adicionais expansíveis; os cartões de seção são selecionáveis para o relatório, e a tabela completa permanece no desktop.
- Adaptadas busca, exportação, seleção de seções, paginação e ordenação para uso em telas estreitas, sem rolagem horizontal da página.
- Comunicada a aba ativa por estado acessível e preservada a seleção de seções no relatório.

### Verificado

- Layout conferido em 320, 390, 1024 e 1536 px; sem transbordamento horizontal da página e sem erros no console do navegador.
- Importadores em prévia: 409/409 seções e nenhuma divergência entre votos e comparecimento nos dois turnos.
- O repositório não possui `package.json` nem runner de testes; `npm run verify:full` não está disponível. Foram executadas as verificações manuais e de sintaxe descritas em `docs/architecture.md`.

### Aprendizado

- Fato observado: em 390 px, a tabela de seções ultrapassava a largura da tela e parte das abas ficava fora da área visível; no desktop, cinco filtros distribuídos em quatro colunas deixavam o último sozinho na linha seguinte.
- Ação aplicada: cartões em telas móveis e grades responsivas para filtros, métricas e abas.

## [0.0.10] - 2026-10-27

### Alterado

- Identificadas no relatório as fontes TSE, arquivos usados, códigos da eleição, filtros geográficos, seções selecionadas e metadados de geração disponíveis nos CSVs.
- Alinhados os cabeçalhos numéricos do relatório às colunas de valores correspondentes.
- Mantida a impressão do relatório em uma página no recorte validado.

## [0.0.9] - 2026-10-27

### Alterado

- Definido o 2º turno como seleção inicial para apresentar os dados mais recentes e evitar gerar relatórios do turno incorreto por engano.

### Verificado

- Revalidados os dados do 2º turno nas fontes TSE: 409 seções, 1505 linhas de votação cruzadas, aptos 113629, comparecimento 88307, abstenções 25322 e nenhuma divergência entre votos e comparecimento.

## [0.0.8] - 2026-10-27

### Corrigido

- Ajustada a regra de impressão do relatório para remover o layout do painel e evitar uma página extra em branco no PDF.

## [0.0.7] - 2026-10-27

### Adicionado

- Seleção de seções na tabela e prévia de relatório de comparecimento e abstenção, com totais ponderados, detalhamento por seção e impressão/salvamento em PDF.
- Dados presidenciais dos dois turnos para as 409 seções das ZEs 3 e 30, extraídos dos arquivos TSE e validados por eleição, turno e data.

### Corrigido

- Alinhados aptos, comparecimento e abstenções do 1º turno de Presidente aos relatórios SISTOT; cargos estaduais continuam na base estadual.
- Corrigida a contagem de seções em que votos presidenciais coincidem com comparecimento para respeitar os filtros ativos.
- Corrigida a orientação do 1º turno para explicar que Presidente usa base de comparecimento distinta em quatro seções.
- Documentados os novos dados, arquivos de referência e comandos de atualização dos dois turnos.

### Aprendizado

- Fato observado: os extratos presidenciais de comparecimento e os estaduais divergem em aptos e comparecimento em quatro seções, enquanto as abstenções coincidem.
- Ação aplicada: manter as fontes separadas por cargo e comparar os totais com os relatórios SISTOT antes de gerar os recortes locais.

## [Não lançado]

### Adicionado

- Seleção de seções na tabela e prévia de relatório de comparecimento e abstenção, com totais ponderados, detalhamento por seção e impressão/salvamento em PDF.

### Corrigido

- Alinhados aptos, comparecimento e abstenções do 1º turno de Presidente aos relatórios SISTOT, com os totais oficiais por seção e município; os demais cargos mantêm a base estadual.
- Atualizados os caminhos de origem para os dados TSE movidos para `docs/` e ampliadas as regras do Git para ignorar os arquivos brutos nessa pasta.
- Importados os votos presidenciais e os dados de comparecimento/abstenção do segundo turno para as 409 seções das ZEs 3 e 30; incluído seletor de turno, com Presidente como único cargo no segundo turno.
- Identificada e documentada a inconsistência dos arquivos regionais de Rondônia rotulados `_2t`, que ainda contêm dados da eleição de 04/10; o recorte do segundo turno usa os arquivos nacionais com filtros de eleição, turno e data.
- Atualizado o extrator presidencial de primeiro turno para buscar seu CSV padrão em `docs/`, acompanhando a reorganização dos dados.
- Atualizadas referências documentais sobre o empacotamento de dados brutos e incluído `.vercelignore` na estrutura do projeto.

## [0.0.6] - 2026-10-21

### Aprendizado

- Fato observado: o repositório não possui manifesto de dependências nem runner de testes; as verificações disponíveis são sintaxe, validação do importador e checagem visual no navegador.
- Ação aplicada: registrar no guia de arquitetura os limites e os checks disponíveis para os próximos checkpoints.

## [0.0.5] - 2026-10-21

### Alterado

- Removida a identificação institucional do cabeçalho e reduzidos os elementos acima da tabela para priorizar os resultados.
- Compactados os indicadores em uma faixa única e ocultadas orientações repetidas no filtro de cargo, mantendo-as disponíveis para leitores de tela.

## [0.0.4] - 2026-10-21

### Corrigido

- Limitado o pacote de deploy da Vercel aos arquivos necessários para servir o painel, excluindo os CSVs brutos que excediam o limite de upload.

## [0.0.3] - 2026-10-21

### Alterado

- Reordenada a lista de cargos do maior para o menor: Presidente, Governador, Senador, Deputado Federal e Deputado Estadual.
- Compactados filtros, indicadores e espaçamentos para dar mais destaque às tabelas e aos resultados.

## [0.0.2] - 2026-10-21

### Adicionado

- Votos presidenciais por seção, candidato e município/zona, extraídos em fluxo do CSV nacional do TSE para as 409 seções das zonas 3 e 30.
- Script de importação com validação de cobertura e totais, sem carregar o CSV nacional na interface.
- Favicon local para evitar a requisição de um ícone inexistente.

### Alterado

- Clarificados o rótulo e o efeito do seletor de cargo; a visão por partido é ocultada para Presidente, que não tem classificação partidária no recorte por seção.
- Separados visualmente os filtros geográficos do controle de votos exibidos, com orientação contextual que reforça que o cargo não altera a abstenção.
- Melhorados contraste e tamanho dos textos auxiliares e dos rótulos dos filtros.
- Tornada a ordenação das tabelas acessível por teclado, com botões focáveis e estado anunciado por `aria-sort`.
- Documentados os dados presidenciais e as diferenças de comparecimento identificadas em quatro seções.

### Corrigido

- Removida uma linha de CSS residual do HTML que era exibida como texto acima do painel.

### Aprendizado

- Fato observado: a auditoria identificou que o seletor de cargo aparecia junto aos filtros geográficos e não deixava evidente que a abstenção permanece igual.
- Ação aplicada: o controle passou a se chamar “Votos exibidos”, ganhou orientação contextual e foi destacado dos filtros geográficos.

## [0.0.1] - 2026-10-21

### Adicionado

- README, índice e guias locais de arquitetura e dados.
- Registro explícito de que Presidente ainda não foi integrado e de que o projeto não requer variáveis de ambiente.
- Nomes convencionais para a página estática: `index.html`, `styles.css`, `responsive.css` e `script.js`.

### Alterado

- Separados os estilos e a lógica em arquivos CSS e JavaScript locais, mantendo os dados JSON incorporados ao HTML.
- Melhorada a experiência em telas pequenas com filtros empilhados, abas roláveis, controles de toque maiores e tabelas com rolagem horizontal.
- Esclarecido que o seletor de cargo altera os votos exibidos, enquanto as métricas de abstenção continuam sendo calculadas por seção.
- Atualizados os textos de interpretação, o título da visão por seção e os rótulos dos indicadores.
