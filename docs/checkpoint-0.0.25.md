# Checkpoint 0.0.25

- **Data:** 29/10/2026
- **Versão:** 0.0.25
- **Escopo:** Nomenclatura amigável em português para exportação de CSV e proteção contra exportação de tabela vazia.

## O que mudou

1. **Nomes de arquivo amigáveis e contextuais (`exportFileName`):**
   - Substituição do padrão técnico antigo (`painel_tse_2026_turno2_sections_ZE_3_30.csv`) por padrão em português com hífens legíveis.
   - Tradução de abas técnicas: `sections` -> `secoes`, `places` -> `locais-votacao`, `comparison` -> `comparativo`, `candidates` -> `candidatos`, `parties` -> `partidos`.
   - Normalização sem acentos de municípios (ex: `JI-PARANÁ` -> `ji-parana`, `PRESIDENTE MÉDICI` -> `presidente-medici`).
   - Sufixo inteligente: sem filtros ativos, o nome mantém-se enxuto (`resultados-eleicoes-2026-2-turno-secoes.csv`); com filtros selecionados, acrescenta os slugs contextuais (`...-ji-parana-ze3.csv` ou `...-ze30.csv`).
2. **Prevenção de exportação vazia:**
   - O botão "Exportar CSV" recebe o atributo `disabled` quando a tabela filtrada estiver com zero registros (`rows.length === 0`).
   - A função `download()` verifica se há registros antes de prosseguir, emitindo feedback contextual via toast caso não haja dados.

## Validações e Testes

- `node scripts/test-app.js`: 30/30 testes automatizados aprovados (100%), incluindo 3 novos testes dedicados para a função `exportFileName` e desabilitação de botão.
- `node --check`: sintaxe JavaScript de todos os scripts validada com sucesso.
- `git diff --check`: sem inconsistências de formatação.
