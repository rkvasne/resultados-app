# Checkpoint 0.0.23

- **Data:** 29/10/2026
- **Versão:** 0.0.23
- **Escopo:** Rebalanceamento das larguras das colunas: aumento da coluna de local de votação para 250px e ajuste das colunas numéricas para largura mínima contendo seus títulos íntegros.

## O que mudou

1. **Aumento da coluna "Local de votação":**
   - Largura ajustada de `190px` para `250px` em `styles.css` (`th.col-local-th`, `td.col-local-cell` e `.col-local-text`).
   - Apresenta mais caracteres do nome de cada escola ou entidade eleitoral antes de aplicar as reticências (`...`), mantendo o tooltip nativo (`title`) ao passar o mouse.

2. **Otimização de largura mínima para colunas numéricas:**
   - Adicionado `width: 1%; white-space: nowrap;` em `td.num, th.num` e `th.selection-cell, td.selection-cell` em `styles.css`.
   - Ajustado padding horizontal em `th.num .sort-button` e `td.num` para `7px` em `responsive.css`.
   - As colunas de números ("Aptos", "Comparecimento", "Abstenções", "ZE", "Seção", "Local nº", "Brancos", "Nulos", "Nominais", "Legenda") agora assumem o tamanho mínimo necessário para renderizar seus títulos completos sem quebra de linha nem truncamento, liberando espaço horizontal sem folgas excessivas.

## Validações e Testes

- `node scripts/test-app.js`: 27/27 testes automatizados aprovados (100%).
- Validação visual em navegador via captura de tela atestando que todas as colunas de títulos numéricos permanecem legíveis e integras, com layout enxuto e harmonioso.
- `node --check`: sintaxe JavaScript de todos os scripts validada com sucesso.
- `git diff --check`: sem inconsistências de formatação.
