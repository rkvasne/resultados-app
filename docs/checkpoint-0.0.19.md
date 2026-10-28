# Checkpoint 0.0.19

- **Data:** 28/10/2026
- **Versão:** 0.0.19
- **Escopo:** Hierarquia tipográfica harmoniosa e moderna (padrão Linear / Vercel / Apple), calibração de escala proporcional em `responsive.css` e `styles.css` e microinterações táteis.

## O que mudou

1. **Remoção de fontes infladas e desproporcionais:**
   - Diagnosticada e corrigida a sobreposição em `responsive.css` que aplicava valores herdados de 15px no corpo, 19px a 20px em subtítulos, 24px em métricas e 40px em selects.
   - Definida escala tipográfica moderna modular com base em `13px` e `line-height: 1.45`, otimizada para dashboards densos de produtividade e análise de dados.

2. **Hierarquia calibrada:**
   - **Cabeçalho:** `17px` (`font-weight: 650; letter-spacing: -0.025em;`) com subtítulo em `12px` e chips em `10.5px`.
   - **Filtros e formulários:** labels em `10px` uppercase (`letter-spacing: 0.04em`), selects e inputs compactos em `34px` de altura e fonte `12px`.
   - **Métricas:** números em `18px` semibold (`600`) com tracking sutil negativo e formatação tabular, rótulos de apoio em `10px` e subtextos em `10.5px`.
   - **Abas e títulos de painéis:** abas com fonte `12px` e `padding: 5px 11px`, títulos de visão em `14px` (`font-weight: 650`) e textos descritivos em `11.5px`.
   - **Tabela e dados:** cabeçalhos `th` em `10.5px` uppercase, células `td` em `12px` e pills percentuais compactos em `11px`.

3. **Física tátil:**
   - Adicionada microinteração ativa nos botões e abas (`active: scale(0.98)`).
   - Suavidade de transições (`cubic-bezier(0.16, 1, 0.3, 1)`) e antialiasing subpixel em todo o corpo da aplicação.

## Validações e Testes

- `node scripts/test-app.js`: 27/27 testes automatizados aprovados (100%).
- `node --check`: sintaxe JavaScript 100% válida.
- `git diff --check`: sem inconsistências de formatação.
