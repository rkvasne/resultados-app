# Checkpoint 0.0.22

- **Data:** 29/10/2026
- **Versão:** 0.0.22
- **Escopo:** Compactação e truncamento elegante da coluna "Local de votação" com tooltip no hover e preservação de impressão integral.

## O que mudou

1. **Compactação da coluna "Local de votação":**
   - Reduzida a largura da coluna para `190px` nas tabelas do painel e do modal de relatório (`th.col-local-th`, `td.col-local-cell` e `.col-local-text`).
   - Aplicado `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` com elemento `<span class="col-local-text">`, garantindo truncamento robusto e consistente em todos os motores de renderização.

2. **Acessibilidade e Tooltip nativo:**
   - Cada célula truncada possui o atributo `title="${escapeHtml(row.nome)}"`, garantindo que o usuário veja o nome completo do local de votação imediatamente ao passar o mouse.

3. **Preservação de impressão:**
   - Em `@media print`, as regras de truncamento são desativadas (`max-width: none; white-space: normal; overflow: visible`), assegurando que relatórios impressos ou gerados em PDF exibam o nome completo dos colégios e postos eleitorais.

## Validações e Testes

- `node scripts/test-app.js`: 27/27 testes automatizados aprovados (100%).
- Validação visual via subagente de navegador com captura de tela confirmando que as colunas numéricas (Aptos, Comparecimento, Abstenções, Abstenção %, Brancos, Nulos) agora cabem no viewport desktop sem rolagem excessiva.
- `node --check`: sintaxe JavaScript de todos os scripts validada com sucesso.
- `git diff --check`: formatação e integridade de arquivos intactas.
