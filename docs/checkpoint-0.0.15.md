# Checkpoint 0.0.15 — 28/10/2026

## Entrega

- Criada suíte de testes automatizados com execução local direta em Node (`scripts/test-app.js`) contendo 13 verificações de integridade de arquivos, dados eleitorais, cálculos ponderados, escopo geográfico, acessibilidade WAI-ARIA, theming e debounce.
- Implementado suporte nativo ao Modo Escuro (`prefers-color-scheme: dark`) via variáveis CSS com tokens semânticos ajustados para contraste conforme WCAG em superfícies, textos, tabelas, rankings, cabeçalho e modal de impressão.
- Implementado suporte à preferência de redução de movimento (`prefers-reduced-motion: reduce`) para usuários sensíveis a animações e transições.
- Criado estado vazio (*empty state*) contextual na listagem de seções e na visualização móvel, com botão de ação direta para "Limpar busca e filtros" e foco automático retornado ao campo de busca.
- Implementada navegação por teclado completa entre abas com suporte a setas direcionais (ArrowLeft / ArrowRight / Home / End) e foco dinâmico seguindo o padrão WAI-ARIA Tabs pattern.
- Implementado debounce de 180 ms no campo de pesquisa textual com cancelamento preventivo ao interagir com filtros suspensos ou limpar parâmetros.
- Atualizada semântica de acessibilidade nas abas (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-hidden`, `role="tabpanel"`).
- Refatorado o anel de foco para contraste sólido (`outline: 2px solid var(--blue-focus)`) para melhor visibilidade em foco por teclado.
- Balanceada a distribuição dos 5 cartões de métricas na visualização móvel.
- Atualizados `VERSION`, metadado `<meta name="application-version">` em `index.html`, `README.md` e `CHANGELOG.md` para `0.0.15`.

## Revisão

- As modificações preservaram estritamente o isolamento da aplicação estática offline, sem adicionar dependências externas ou alterar os dados canônicos em `presidente_2026.js` e `presidente_2026_2t.js`.
- O escopo de estilos manteve coerência com o design original, expandindo as variáveis CSS globais em `styles.css` e refinando os seletores em `responsive.css`.
- O timer de debounce foi promovido a escopo de módulo em `script.js` e limpo nos eventos de alteração de filtros (zona, município, local, turno) e botões de reset, prevenindo execuções de filtros defasados ou fora de ordem.
- O estilo do `.empty-state` recebeu `white-space: normal` para evitar transbordamento horizontal em tabelas ou telas estreitas.
- A aba de partidos no 2º turno mantém sincronizado o atributo `aria-hidden="true"` enquanto oculta.

## Verificação

- `node scripts/test-app.js`: 13/13 testes aprovados (100% de sucesso).
- `node --check` validou sintaxe sem erros para `script.js`, `presidente_2026.js`, `presidente_2026_2t.js` e `scripts/test-app.js`.
- Teste interativo de navegador executado via subagente gravado em artefato WebP (`verify_frontend_fixes_1793150464806.webp`), validando comportamento desktop e responsivo móvel a 375 px, busca com debounce, empty state, navegação de abas e modal.
- `git diff --check` executado sem erros de formatação ou caracteres indesejados.
- Prompt 19 e ciclo de prompts registrado na telemetria local e snapshot de telemetria sincronizado.

## Aprendizado

- Fato observado: ao aplicar debounce assíncrono em campos de busca de aplicações estáticas reativas com filtros combinados, se o usuário digitar e imediatamente alternar um dropdown ou clicar em limpar, o timer pendente pode disparar após a nova seleção e sobrescrever o estado de exibição.
- Ação aplicada: declarar o identificador do timer em escopo de módulo e executar `clearTimeout()` preventivo em todos os pontos de entrada de filtros e resets.
