# Changelog

Este arquivo registra mudanças relevantes do painel no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/). A primeira versão publicada é `0.0.1`.

## [Não lançado]

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
