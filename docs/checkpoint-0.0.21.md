# Checkpoint 0.0.21

- **Data:** 29/10/2026
- **Versão:** 0.0.21
- **Escopo:** Refinamento tipográfico contemporâneo, remoção de truncamento em votos exibidos e ajuste de quebra fluida de textos explicativos.

## O que mudou

1. **Remoção de truncamento em "Votos exibidos":**
   - No 2º turno, o elemento `<small>` abaixo do seletor de cargo é completamente ocultado dinamicamente via `script.js` (`display: none; textContent = ''`), eliminando a frase cortada com reticências.
   - No 1º turno, o texto explicativo é conciso e exibido naturalmente sem corte rígido nem reticências (`text-overflow: ellipsis` e `max-width: 44ch` removidos).

2. **Ajuste de quebra de texto nas seções (fluxo fluido em linha única):**
   - Removido o limite artificial `max-width: 84ch` de `.hint` e de `.panel-header .hint` em `styles.css` e `responsive.css`.
   - Textos descritivos como *"Aptos, comparecimento, abstenções e votos presidenciais vêm da apuração do 2º turno. Soma dos votos igual ao comparecimento em 409/409 seções."* agora fluem continuamente em linha única sem quebras artificiais em resoluções de desktop.

3. **Adequação da escala e contraste tipográfico (Padrão Web Contemporâneo):**
   - Rótulos dos inputs (`.field label`) aumentados de 10px/11px para `13px` com peso `500` (Medium) e tom legível Slate-700 (`#334155`), conferindo hierarquia clara e leitura confortável.
   - Eliminação de fontes excessivamente pequenas (10px/11px) e cinzas apagadas em toda a interface: texto base padronizado em `14px/1.5`, com contraste balanceado em Slate-900 (`#0f172a`) para texto principal e Slate-600 (`#475569`) para elementos secundários legíveis.
   - Remoção de pesos bold grotescos/agressivos (800/850) em tabelas e métricas, substituídos por peso semibold elegante (`600`).
   - Sincronização e faxina completa em `responsive.css` para eliminar regras concorrentes obsoletas que sobrepunham `styles.css`.

## Validações e Testes

- `node scripts/test-app.js`: 27/27 testes automatizados aprovados (100%).
- Validação visual via subagente de navegador com captura de tela da primeira dobra confirmando legibilidade, rótulos ampliados, linha única na descrição do painel e ausência de truncamento.
- `node --check`: sintaxe JavaScript de todos os scripts validada com sucesso.
- `git diff --check`: formatação e integridade de arquivos intactas.
