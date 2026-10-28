# Checkpoint 0.0.18

- **Data:** 28/10/2026
- **Versão:** 0.0.18
- **Escopo:** Botão X para fechar modal, fontes oficiais do TSE na página principal, remoção de separadores misturados no título e compactação da primeira dobra (*above the fold*).

## O que mudou

1. **Botão fechar "X" no modal de relatório:**
   - Adicionado `<button class="dialog-close-btn" id="dialog-close-x" aria-label="Fechar janela">` no topo da barra de ações do modal de relatório.
   - Ícone vetorial SVG nítido, hit area confortável de 34x34px, efeito hover com realce e foco acessível.
   - Preservadas as formas de fechamento existentes: botão "Voltar ao painel", clique no backdrop e tecla Escape.

2. **Fontes de dados oficiais diretamente na página principal:**
   - Adicionado contêiner `<section class="panel provenance-panel" id="main-provenance">` com conteúdo dinâmico preenchido via `updateMainProvenance()`.
   - Exibe código oficial da eleição TSE (`6258` para 2º turno, `6257` para Presidente 1º turno, `6259` para Geral Estadual), data, arquivos CSV/ZIP oficiais de origem com timestamp de geração quando disponível, e links diretos para o Portal de Dados Abertos e conjunto Resultados 2026.

3. **Título limpo e sem separadores misturados:**
   - Removida a rotina em `updateTurn()` que reinjetava `Resultados — Eleições 2026 · ${electionDate}` sobrescrevendo o `h1`.
   - Título canônico mantido como `Resultados Eleitorais 2026`.
   - Subtítulo fluido e chips semânticos (`2º Turno (25/10/2026)`) exibem turno e data de forma organizada e limpa.

4. **Primeira dobra (*above the fold*) compacta e de alta densidade:**
   - Header reorganizado em layout horizontal com padding vertical reduzido para `10px`.
   - Barra de filtros com selects e inputs compactados para `34px` de altura, labels em `10px` e textos de suporte com ellipsis.
   - Painel de métricas com padding de `8px 12px`, números `20px` semibold e margem de `8px`.
   - Abas e toolbars com margem reduzida para `8px`.
   - A tabela de dados e seus registros tornam-se imediatamente visíveis na primeira dobra sem necessidade de rolagem.

## Validações e Testes

- `node scripts/test-app.js`: 27/27 testes automatizados aprovados (100%).
- `node --check`: sintaxe validada com sucesso em todos os scripts JavaScript (`script.js`, `presidente_2026.js`, `presidente_2026_2t.js`, `scripts/test-app.js`).
- `git diff --check`: nenhuma inconformidade de formatação.
