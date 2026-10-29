# Changelog

Este arquivo registra mudanças relevantes do painel no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/). A primeira versão publicada é `0.0.1`.

## [0.1.0] - 2026-10-29

### Adicionado e Melhorado

- **Marco de Maturação do Painel (Minor Release 0.1.0):**
  - Conclusão dos ciclos de auditoria e saneamento com execução do Prompt 20 (Code Janitor), Prompt 25 (Documentation Janitor) e Code Review formal.
  - Nomenclatura amigável, clara e contextual em português para arquivos exportados em CSV (`exportFileName`), com tradução de abas técnicas e inclusão de slugs de zona e município.
  - Alinhamento milimétrico entre títulos de colunas e dados numéricos/textuais, com centralização direta e contêiner `.rate-cell` para badges percentuais.
  - Proteção contra exportação vazia com desabilitação contextual de botão e avisos em toast.
  - Navegação defensiva e segura via *optional chaining* em manipulações de seletores (`turn`, `office`) e no tratamento de divergências de apuração (`comparisonMismatches`).
  - Sincronização e saneamento da documentação de persistência em `docs/architecture.md` (especificando a retenção de seleções em `localStorage`) e reorganização estrutural do índice em `docs/README.md`.

### Aprendizado da Release

- *Fato observado:* Tabelas ricas que combinam texto longo (nomes de escolas) e métricas compactas (números de seção e percentuais) requerem alinhamento explícito por tipo de dado (texto à esquerda, códigos e métricas ao centro) para eliminar ilusão de deslocamento horizontal causada por botões de ordenação flexbox.
- *Fato observado:* Nomenclatura contextual de arquivos baixados com termos em português acelera o arquivamento e organização por parte de usuários não técnicos.

### Verificado

- Suíte completa de 30/30 testes automatizados aprovada com sucesso (`scripts/test-app.js`).
- Validação estrita de sintaxe JavaScript (`node --check`) sem erros ou avisos.
- Conformidade de formatação e ausência de trailing whitespaces validada via `git diff --check`.

## [0.0.25] - 2026-10-29

### Melhorado

- **Nomenclatura amigável e contextual para exportação de CSV:**
  - Substituição do nome técnico prévio (`painel_tse_2026_turno2_sections_ZE_3_30.csv`) por uma nomenclatura em português legível e padronizada com hífens (`exportFileName`).
  - Nomes das visões/abas traduzidos de chaves internas em inglês para termos claros (`secoes`, `locais-votacao`, `comparativo`, `candidatos`, `partidos`).
  - Sem filtros aplicados: nome enxuto (ex: `resultados-eleicoes-2026-2-turno-secoes.csv`).
  - Com filtros ativos: inclusão de slugs amigáveis e normalizados de município e zona (ex: `resultados-eleicoes-2026-2-turno-secoes-ji-parana-ze3.csv` ou `...-ze30.csv`).
- **Prevenção de exportação vazia:**
  - Botão "Exportar CSV" desabilitado automaticamente (`disabled`) quando a tabela não possui registros (por exemplo, após uma busca sem correspondências).
  - Guarda em `download()` contra exportações vazias com aviso contextual em toast ("Nenhum registro para exportar.").

### Verificado

- Suíte de testes automatizados expandida para 30/30 testes aprovados (`scripts/test-app.js`).
- Validação determinística de nomenclatura para todas as abas, turnos e combinações de filtros de município e zona.
- Sintaxe validada via `node --check`.

## [0.0.24] - 2026-10-29

### Melhorado

- **Alinhamento milimétrico entre dados e títulos de colunas:**
  - Colunas de texto ("Município", "Local de votação", "Endereço", "Partido", "Situação", "Destinação") alinhadas à esquerda (`text-align: left`) tanto nos títulos quanto nos dados, fazendo com que o texto inicie no mesmo pixel de referência.
  - Colunas numéricas e de código ("Aptos", "Comparecimento", "Abstenções", "ZE", "Seção", "Local nº", "Brancos", "Nulos", "Nominais", "Legenda") alinhadas ao centro (`text-align: center`), com números centralizados rigorosamente sob os títulos das colunas.
  - Coluna composta "Abstenção %" com contêiner `.rate-cell` em flex centralizado (`display: inline-flex; align-items: center; justify-content: center; gap: 8px`), posicionando a tag de porcentagem e a barra de progresso centralizadas sob o título.
  - Indicador de ordenação (`.sort-indicator`) renderizado condicionalmente apenas quando houver ordenação ativa na coluna, eliminando espaço fantasma no cabeçalho quando inativo.
  - Tabela do modal de relatório (`.report-table`) alinhada com as mesmas regras de consistência para visualização e impressão.

### Verificado

- Suíte de 27/27 testes automatizados aprovada com sucesso (`scripts/test-app.js`).
- Validação visual em navegador via captura de tela atestando dados centralizados e alinhados diretamente sob seus respectivos títulos.
- Sintaxe validada via `node --check`.

## [0.0.23] - 2026-10-29

### Melhorado

- **Ajuste fino de largura das colunas da tabela:**
  - Coluna "Local de votação" ampliada de `190px` para `250px` (`th.col-local-th`, `td.col-local-cell` e `.col-local-text`), exibindo mais texto antes do truncamento com reticências.
  - Colunas numéricas ("Aptos", "Comparecimento", "Abstenções", "ZE", "Seção", "Local nº", "Brancos", "Nulos", "Nominais", "Legenda") configuradas com `width: 1%`, `white-space: nowrap` e padding horizontal ajustado para `7px` em células e cabeçalhos.
  - As colunas numéricas agora ocupam o tamanho mínimo indispensável para acomodar seus títulos inteiros sem truncamento de texto, eliminando qualquer espaço ocioso e conferindo equilíbrio total à tabela.

### Verificado

- Suíte completa de 27/27 testes automatizados aprovada com sucesso (`scripts/test-app.js`).
- Validação visual em navegador via captura de tela atestando colunas numéricas compactas, títulos legíveis e cabeçalho alinhado.
- Sintaxe validada via `node --check`.

## [0.0.22] - 2026-10-29

### Melhorado

- **Compactação e truncamento da coluna "Local de votação":**
  - Redução da largura da coluna para `190px` com `text-overflow: ellipsis` (`.col-local-cell`, `.col-local-th` e `.col-local-text`).
  - Nomes extensos de escolas e locais de votação agora são exibidos de forma compacta e truncados com reticências (`...`), liberando espaço horizontal para todas as colunas de métricas e apuração sem forçar rolagem lateral indesejada.
  - Atributo `title` adicionado a cada célula com o nome completo original, permitindo visualização imediata por tooltip ao passar o cursor do mouse.
  - Estilos de impressão (`@media print`) preservados com `max-width: none` e quebra natural, garantindo que relatórios em PDF exibam o nome completo dos locais de votação.

### Verificado

- Suíte de 27/27 testes automatizados aprovada com sucesso (`scripts/test-app.js`).
- Validação visual via navegador registrando a nova largura equilibrada da tabela e truncamento com tooltip.
- Sintaxe validada via `node --check`.

## [0.0.21] - 2026-10-29

### Melhorado

- **Remoção de truncamento em "Votos exibidos":**
  - No 2º turno, o elemento descritivo `<small>` abaixo do seletor de cargo é completamente ocultado via `script.js` (`display: none; textContent = ''`), eliminando a frase cortada com reticências.
  - No 1º turno, o texto é direto e sem reticências ou quebras indesejadas.
- **Quebra fluida de textos descritivos:**
  - Remoção do limite rígido `max-width: 84ch` de `.hint` e de cabeçalhos de painel.
  - O texto explicativo de apuração do 2º turno e seções agora flui sem quebras artificiais de linha em monitores desktop.
- **Refinamento tipográfico contemporâneo (legibilidade e contraste balanceado):**
  - Rótulos dos campos (`.field label`) aumentados de 10px/11px para `13px` com peso `500` (Medium) e cor contrastante Slate-700 (`#334155`).
  - Escala base padronizada em `14px/1.5`, eliminando textos excessivamente miniaturizados ou apagados.
  - Substituição de pesos bold agressivos (800/850) por semibold natural (`600`) e Slate-900 (`#0f172a`).
  - Limpeza e unificação de regras concorrentes em `responsive.css`.

### Verificado

- Suíte de 27/27 testes automatizados aprovada com sucesso (`scripts/test-app.js`).
- Validação visual em browser confirmando ausência de cortes, leitura fluida e rótulos legíveis.
- Sintaxe validada via `node --check`.

## [0.0.20] - 2026-10-28

### Melhorado

- **Eliminação de rótulos em uppercase forçado:**
  - Remoção de `text-transform: uppercase` em todos os rótulos de campos (`.field label`), nomes de métricas (`.metric .name`), cabeçalhos de tabela (`th`) e badges.
  - Adoção de formatação natural em *Sentence case* (`Zona eleitoral`, `Município`, `Local de votação`, `Taxa de abstenção`, `Comparecimento`), proporcionando maior legibilidade e sofisticação visual contemporânea.
- **Redesign completo dos cartões estatísticos (KPI Cards):**
  - Substituição da antiga barra única fatiada com divisores verticais rígidos por 5 cartões estatísticos autônomos e elegantes.
  - Cada cartão possui container independente com cantos arredondados (`border-radius: 10px`), bordas sutis (`var(--line)`), elevação em camadas suaves (`var(--shadow-card)`), e efeito de hover flutuante com transição suave (`transform: translateY(-1px)`).
  - Cartão de "Taxa de abstenção" com destaque contextual em gradiente suave Rose e borda colorida refinada.
- **Esquema de cores ultra-moderno (Slate & Tailwind UI):**
  - Paleta refinada com base em Slate-50 a Slate-900: `--bg: #f8fafc`, `--card: #ffffff`, `--card-alt: #f1f5f9`, `--ink: #0f172a`, `--muted: #64748b`.
  - Acentuação moderna Rose-600 (`#e11d48`) e Blue-600 (`#2563eb`).
  - Dark mode harmonizado com tons profundos Slate-950 (`#030712`) e Navy Slate (`#0f172a`).
- **Navegação em abas segmentadas (Segmented Control):**
  - Redesenho da barra de abas em trilha neutra encapsulada (`background: var(--card-alt)`), com pílula ativa destacada em branco com sombra sutil (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06)`).

### Verificado

- Suíte completa de 27/27 testes automatizados aprovados em `scripts/test-app.js`.
- Verificação visual via navegador confirmando ausência de uppercase e renderização harmônica dos novos cartões estatísticos.
- Sintaxe validada via `node --check`.

## [0.0.19] - 2026-10-28

### Melhorado

- **Hierarquia tipográfica harmoniosa e moderna (padrão Linear / Apple / Vercel):**
  - Eliminação de fontes infladas herdadas de folhas de estilo anteriores em `responsive.css` e `styles.css`.
  - Escala proporcional refinada: corpo base em `13px` com `line-height: 1.45`, antialiasing subpixel (`-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`).
  - Cabeçalho elegante: título principal em `17px` (`font-weight: 650; letter-spacing: -0.025em;`), subtítulo refinado em `12px` e chips/badges em `10.5px`.
  - Cartões de métricas calibrados: números em `18px` semibold (`600`) com `letter-spacing: -0.025em` tabular, rótulos superiores em `10px` uppercase e subtextos em `10.5px`.
  - Controles de formulário compactos: selects e inputs com altura de `34px`, fonte `12px` e cantos arredondados de `6px`.
  - Abas e painéis: abas com `12px` e `padding: 5px 11px`, títulos de visão em `14px` e textos descritivos em `11.5px`.
  - Tabela de dados de alta densidade: cabeçalhos `th` em `10.5px` uppercase, células `td` em `12px` com `padding: 6px 10px` e pills percentuais compactos.
- **Física tátil e microinterações:**
  - Adicionado micro-feedback tátil (`transform: scale(0.98)`) no clique ativo de botões e abas.
  - Sincronização da escala compacta e elegante nos breakpoints mobile e tablet.

### Verificado

- 27/27 testes automatizados aprovados em `scripts/test-app.js`.
- Sintaxe JavaScript verificada com sucesso via `node --check`.

## [0.0.18] - 2026-10-28

### Adicionado

- Botão explícito de fechar janela com ícone "X" (`#dialog-close-x` / `.dialog-close-btn`) no modal de relatório com hit area acessível, efeito hover e suporte a tecla Escape e clique fora.
- Seção canônica de fontes oficiais e critérios dos dados (`#main-provenance` / `.provenance-panel`) diretamente na página principal, exibindo arquivos oficiais do TSE, código da eleição, data/hora de geração do CSV e metodologia de cálculo ponderado.
- Expansão da suíte automatizada de testes para 27 testes aprovados em `scripts/test-app.js`.

### Melhorado

- Resolução definitiva do conflito de separadores no título: remoção da sobrescrita em tempo de execução via `updateTurn()` que gerava `Resultados — Eleições 2026 · 25/10/2026`. Título padronizado para `Resultados Eleitorais 2026` com dados de turno e data exibidos nos badges semânticos e no subtítulo fluido.
- Otimização de densidade visual na primeira dobra (*above the fold*):
  - Cabeçalho reorganizado em barra horizontal compacta (`10px` de padding vertical) com título à esquerda e chips/badges à direita.
  - Barra de filtros compactada com inputs e selects de altura `34px`, labels de `10px` e textos explicativos contidos.
  - Cartões de métricas compactados com padding de `8px 12px` e números semibold de `20px`.
  - Abas, painéis e barras de ferramentas com espaçamentos otimizados, garantindo que os primeiros registros e a tabela de dados apareçam imediatamente na primeira dobra da tela.

### Verificado

- 27/27 testes automatizados aprovados na suíte `scripts/test-app.js`.
- Sintaxe validada via `node --check` em todos os scripts JavaScript da aplicação.
- `git diff --check` sem erros de formatação.

## [0.0.17] - 2026-10-28

### Adicionado

- Cabeçalho reformulado com hierarquia limpa e badges visuais semânticos em chips (`Eleições 2026`, `2º Turno`, `Zonas 3 e 30` e `● Dados Oficiais TSE`), eliminando pontuações artificiais soltas (`·` e `—`).
- Ícones vetoriais SVG inline minimalistas e leves integrados em todos os botões de ação (exportação CSV, visualização de relatório, cópia de resumo, limpeza de filtros, alternância de seleção e paginação).
- Badges de contagem e status para total de registros encontrados e seções selecionadas na barra de ferramentas.
- Três novos testes automatizados em `scripts/test-app.js` (totalizando 23 testes) validando estrutura do cabeçalho, badges, peso de métricas e ícones SVG.

### Melhorado

- Calibração da tipografia dos cartões de métricas: redução do peso dos números de `850` (extra-bold ruidoso) para `600` (semibold harmonioso), mantendo alinhamento numérico `tabular-nums`.
- Restauração e refinamento dos subtextos contextuais das métricas para leitura clara sem poluição visual.
- Rótulos dos botões simplificados e mais diretos ("Exportar CSV", "Ver Relatório", "Limpar").

### Verificado

- 23/23 testes automatizados aprovados na suíte `scripts/test-app.js`.
- Sintaxe validada via `node --check` em todos os scripts JavaScript da aplicação.
- `git diff --check` sem erros de formatação ou caracteres indesejados.

## [0.0.16] - 2026-10-28

### Adicionado

- Proteção contra perda de dados com persistência automática de seleções de seções em `localStorage` particionada por turno (`resultados_app_selected_t1` e `t2`).
- Botão "Copiar resumo" na barra de seleção e no diálogo de relatório para cópia imediata formatada via Clipboard API com fallback robusto via `document.execCommand`.
- Sistema de feedback tátil (`navigator.vibrate`) e avisos contextuais flutuantes (*toasts*) com `role="status"` e `aria-live="polite"` calibrados para temas claro e escuro.
- Tratamento de erro (*Error Boundary*) visual explicativo com banner informativo (`showErrorBanner`) e proteção `try/catch` no bootstrap de dados da aplicação.
- Expansão da suíte de testes automatizados para 20 testes em `scripts/test-app.js` cobrindo persistência, cópia para área de transferência, integridade de tokens CSS e resiliência de carga.

### Melhorado

- Correção dos tokens semânticos em `.error-boundary-banner` e `.app-toast` para `var(--ink)`.
- Encadeamento seguro em `formatSummaryText` para prevenir falhas em chamadas antecipadas.
- Alinhamento da documentação técnica de arquitetura em `docs/architecture.md`, `README.md` e `docs/README.md`.

### Verificado

- 20/20 testes automatizados aprovados em `scripts/test-app.js`.
- Sintaxe validada via `node --check` em todos os scripts JavaScript (`script.js`, `presidente_2026.js`, `presidente_2026_2t.js`, `scripts/test-app.js`, `scripts/import-president.js`, `scripts/import-president-2t.js`).
- `git diff --check` sem erros de formatação ou caracteres indesejados.

## [0.0.15] - 2026-10-28

### Adicionado

- Suíte de testes automatizados em Node (`scripts/test-app.js`) com 13 verificações de integridade de arquivos, dados eleitorais, cálculos ponderados, escopo geográfico, acessibilidade WAI-ARIA, theming e debounce.
- Suporte nativo ao Modo Escuro (`prefers-color-scheme: dark`) com tokens semânticos de cores e contraste calibrado para superfícies, textos, tabelas, métricas e modal de relatório.
- Suporte a `prefers-reduced-motion: reduce` para desativar transições e respeitar preferências de sensibilidade a movimento.
- Estado vazio (*empty state*) interativo na tabela e na visualização móvel com botão de ação direta para "Limpar busca e filtros".
- Navegação completa por teclado nas abas com teclas direcionais (ArrowLeft / ArrowRight / Home / End) conforme padrão WAI-ARIA Tabs pattern.

### Melhorado

- Debounce de 180 ms na digitação do campo de busca com cancelamento preventivo ao alterar filtros suspensos ou resetar, reduzindo recálculos desnecessários no DOM.
- Semântica de acessibilidade nas abas com atributos `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-hidden` e `role="tabpanel"`.
- Indicador de foco de alto contraste (`outline: 2px solid var(--blue-focus)`) atendendo às diretrizes de acessibilidade visual.
- Grade móvel dos 5 cartões de métricas balanceada com disposição limpa em telas estreitas.

### Verificado

- Suíte de testes automatizados executada via `node scripts/test-app.js` com 13/13 testes aprovados.
- Sintaxe validada via `node --check` para todos os scripts JS (`script.js`, `presidente_2026.js`, `presidente_2026_2t.js`, `scripts/test-app.js`).
- Validação no navegador via subagente em desktop e mobile (375 px) gravada em artefato WebP.
- `git diff --check` sem erros e telemetria de prompts registrada.

## [0.0.14] - 2026-10-27

### Adicionado

- Removida tag `<script>` vazia residual em `index.html`.

### Melhorado

- Reduzidas as caixas de seleção dos resultados para o controle nativo de 16 × 16 px; mantida área de toque de 44 px nos cartões móveis, foco visível e indicação da linha selecionada.
- Uniformizados espaçamentos, títulos, abas, tabelas, rankings, cartões e estados desabilitados nas visões do painel e no relatório.
- Aumentados textos auxiliares do relatório e dos cartões para leitura mais confortável.

### Verificado

- Importadores de 1º e 2º turnos validados com 409/409 seções e zero divergências.
- Navegador: todas as visões de ambos os turnos e prévia de relatório conferidas.
- Layout em 320, 390, 1024 e 1536 px sem transbordamento horizontal.
- `git diff --check` sem erros.

### Aprendizado

- Fato observado: os checkboxes personalizados em 20 px pareciam grandes na lista de resultados e os elementos de seleção variavam entre desktop e celular.
- Ação aplicada: manter o checkbox nativo de 16 px e ampliar somente o rótulo clicável no celular, preservando a acessibilidade.

## [0.0.13] - 2026-10-27

### Melhorado

- Criada uma escala tipográfica coerente para cabeçalho, indicadores, filtros, tabelas, cartões móveis e relatório, com pesos e espaçamentos que destacam cada nível de informação.
- Mantido o uso de fontes do sistema para preservar a operação offline; o subtítulo do painel identifica fonte, região e turno sem repetir a data exibida no título.

### Verificado

- Cabeçalho e título da aba conferidos nos dois turnos; todas as abas e a prévia do relatório foram verificadas no navegador.
- Layout conferido em 320, 390, 1024 e 1536 px; sintaxe JavaScript e `git diff --check` sem erros.
- O repositório não possui `package.json` nem suíte npm; `npm run verify:full` não está disponível.

### Aprendizado

- Fato observado: a interface misturava textos auxiliares entre 10 e 12 px com títulos pouco diferenciados, inclusive em cartões e relatório.
- Ação aplicada: escalar tipografia por função e elevar o tamanho mínimo dos dados auxiliares móveis.

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
