# Checkpoint 0.1.0 (Minor Release)

- **Data:** 29/10/2026
- **Versão:** 0.1.0
- **Escopo:** Marco de maturação do painel: saneamento de código (Prompt 20), saneamento documental (Prompt 25), code review formal e consolidação de exportação de dados amigável.

## O que mudou

1. **Saneamento e Auditoria de Código (Prompt 20 & Code Review):**
   - Adicionada navegação defensiva (`optional chaining`) em consultas ao DOM em `reportSources`, `showReport` e no seletor de turno.
   - Proteção de fallback seguro no tratamento de divergências de apuração (`presidentData?.comparisonMismatches || []`).
   - Botão de download configurado para desabilitação contextual reativa (`disabled` se `rows.length === 0`).
   - Verificação de guarda na função `download()` contra invocações em listas vazias, com emissão de toast explicativo ao usuário.
2. **Saneamento Documental (Prompt 25):**
   - Correção do drift documental em `docs/architecture.md`: documentada a persistência de seleções de seções no `localStorage` por turno.
   - Reorganização estrutural em `docs/README.md`, agrupando guias arquiteturais e checkpoints cronológicos em seções dedicadas.
3. **Consolidação de UX e Exportação:**
   - Nomenclatura descritiva e limpa em português para arquivos CSV gerados via navegador.
   - Alinhamento de colunas por tipologia (texto à esquerda, códigos e métricas ao centro) em todas as abas e relatórios.

## Validações e Testes

- `node scripts/test-app.js`: 30/30 testes automatizados aprovados (100%).
- `node --check`: sintaxe JavaScript validada sem erros em todos os arquivos de código.
- `git diff --check`: formatação rigorosamente validada sem quebras ou trailing whitespaces.
- Verificação funcional em navegador via subagente.
