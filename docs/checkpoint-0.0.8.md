# Checkpoint 0.0.8 — 27/10/2026

## Escopo

- Corrigida a impressão do relatório para ocultar o painel por `display` e remover sua área de layout; o relatório continua visível em mídia de impressão.
- Mantido o formato paisagem e adicionadas regras para evitar a quebra de linhas da tabela e do rodapé entre páginas.

## Verificação

- Teste no Chromium com quatro seções selecionadas: prévia com quatro linhas e PDF A4 paisagem com uma página.
- Confirmado que o painel fica `display: none` em mídia de impressão e que o diálogo/relatório permanecem visíveis.
- `node --check` e `git diff --check` executados após a alteração.
- O projeto não possui `package.json` nem suíte automatizada; `npm run verify:full` continua indisponível.

## Persistência

Esta versão corrige a página em branco extra que aparecia ao imprimir ou salvar o relatório em PDF.
