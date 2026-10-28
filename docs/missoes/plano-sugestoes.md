# Plano de Sugestões e Missões — Resultados-App

Este documento inventaria e estrutura a execução de todas as melhorias e pendências identificadas na auditoria diagnóstica (Prompts 02 + 43), organizadas em ondas de execução autônoma com critérios claros de aceitação.

---

## 1. Inventário de Sugestões (S1 a S7)

| ID | Título | Origem / Categoria | Prompt Oficial | Status Final | Evidência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S1** | **Proteção contra perda de dados (Persistência em localStorage)** | Top 5 / Pendências UX | Prompt 08 (Feature Build) | **Feita** | `script.js` (L59-L90): `persistSelections()`, `loadPersistedSelections()`, `clearPersistedSelections()`, chaves `resultados_app_selected_t1` e `t2`. Teste automatizado 9.2 em `test-app.js`. |
| **S2** | **Sincronização e faxina documental (Alinhamento Docs × Código)** | Top 5 / Pendências Docs | Prompt 25 (Documentation Janitor) | **Feita** | `docs/architecture.md` (L19, L48), `README.md` (L41-L45, L74), `docs/README.md` (L7). |
| **S3** | **Cópia rápida para Área de Transferência (Clipboard API)** | Top 5 / UX Operacional | Prompt 08 (Feature Build) | **Feita** | `script.js` (L92-L138, L180, L500): `formatSummaryText()`, `copySummaryToClipboard()`, botões `#copy-selection-summary` e `#copy-report-summary`. Teste automatizado 10.1 em `test-app.js`. |
| **S4** | **Feedback tátil e avisos contextuais (Haptic Feedback & Toasts)** | Top 5 / UX & Mobile | Prompt 10 (Mobile Adaptation) | **Feita** | `script.js` (L38-L57): `hapticFeedback()`, `showToast()`; `styles.css` (L500-L541): `.app-toast`, `.app-toast.visible`. Teste automatizado 10.2 em `test-app.js`. |
| **S5** | **Resiliência no bootstrap com Fallback Amigável** | Top 5 / Resiliência | Prompt 12 (Refactor & Cleanup) | **Feita** | `script.js` (L4-L35): `showErrorBanner()` com bloco `try/catch` de inicialização; `styles.css` (L467-L499): `.error-boundary-banner`. Teste automatizado 9.1 em `test-app.js`. |
| **S6** | **Expansão da suíte de testes automatizados** | Diagnóstico / Qualidade | Prompt 11 (Testing Strategy) | **Feita** | `scripts/test-app.js` expandido de 13 para 18 testes automatizados cobrindo localStorage, clipboard, toasts e error boundary. |
| **S7** | **PWA / Manifesto Web App / Service Worker** | Diagnóstico / Resiliência | Prompt 08 (Feature Build) | **Não Feita (Justificada)** | Excluído por instrução expressa e mandatória do usuário: *"Não quero fazer nada referente ao PWA."* A aplicação permanece estática e offline por carregamento local. |

### Justificativa de Exclusão (S7)
* **S7 (PWA / Service Worker):** Excluído por instrução expressa e mandatória do usuário: *"Não quero fazer nada referente ao PWA."* A aplicação permanece estática e offline por carregamento local de arquivos, sem registro de Service Worker ou manifesto PWA.

---

## 2. Matriz de Tarefas, Critérios de Aceitação e Ondas

### Onda 1: Fundação, Resiliência e Documentação
*Objetivo:* Eliminar inconsistências documentais e proteger a aplicação contra quebras catastróficas de carga inicial antes de adicionar novas interações.

* **Tarefa 1.1 (S2): Sincronização Documental**
  * *Arquivos:* `docs/architecture.md`, `README.md`, `docs/README.md`.
  * *Critério de Aceitação:* Atualizar `docs/architecture.md` removendo o texto falso de que não há testes e documentando `scripts/test-app.js`; incluir `scripts/test-app.js` e as novidades da v0.0.15 (dark mode, redução de movimento, empty state, navegação WAI-ARIA) no `README.md`; adicionar link para `checkpoint-0.0.15.md` em `docs/README.md`.
  * *Prompt:* Prompt 25 (`25-documentation-janitor.md`).
  * *Status:* Concluído.

* **Tarefa 1.2 (S5): Resiliência e Error Boundary no Bootstrap**
  * *Arquivos:* `script.js`, `styles.css`.
  * *Critério de Aceitação:* Envolver o carregamento inicial de dados em bloco `try/catch`. Caso ocorra falha de integridade em `DATA`, `PRESIDENT_DATA` ou `PRESIDENT_DATA_2T`, exibir banner acessível e estilizado informando que os arquivos locais precisam estar na mesma pasta, sem deixar a tela branca.
  * *Prompt:* Prompt 12 (`12-refactor-and-cleanup.md`).
  * *Status:* Concluído.

---

### Onda 2: Persistência, Produtividade Operacional e Feedback Mobile
*Objetivo:* Implementar recursos de alto valor percebido para o usuário em campo sem quebrar a operação offline.

* **Tarefa 2.1 (S1): Persistência de Seleções em `localStorage`**
  * *Arquivos:* `script.js`.
  * *Critério de Aceitação:* Salvar `selectedSections` no `localStorage` sob chaves com prefixo por turno (ex.: `resultados_app_selected_t1`, `resultados_app_selected_t2`). Restaurar automaticamente ao carregar a página ou alternar filtros. Ao clicar em "Limpar seleção", remover a chave correspondente.
  * *Prompt:* Prompt 08 (`08-feature-build.md`).
  * *Status:* Concluído.

* **Tarefa 2.2 (S3): Cópia Rápida para Clipboard**
  * *Arquivos:* `script.js`, `index.html`.
  * *Critério de Aceitação:* Adicionar botão "Copiar resumo" acessível tanto na barra da visão de seções (quando houver seleção) quanto no modal de relatório. Ao clicar, formatar texto com eleitores aptos, comparecimento, abstenções e taxa ponderada e copiá-lo via `navigator.clipboard.writeText`.
  * *Prompt:* Prompt 08 (`08-feature-build.md`).
  * *Status:* Concluído.

* **Tarefa 2.3 (S4): Feedback Tátil e Toasts Contextuais**
  * *Arquivos:* `script.js`, `styles.css`, `responsive.css`.
  * *Critério de Aceitação:* Disparar vibração sutil (`navigator.vibrate?.(12)`) ao selecionar/desmarcar seções e ao copiar resumo. Criar container flutuante leve para toasts acessíveis com `role="status"` e `aria-live="polite"` (mensagens temporárias de 2,5s como *"Resumo copiado para a área de transferência"*, *"Seleção salva"*, *"CSV exportado"*). Garantir que botões móveis possuam alvo de toque ≥ 44 px e cores compatíveis com temas claro e escuro. Sem atalhos de teclado físico em telas touch.
  * *Prompt:* Prompt 10 (`10-mobile-adaptation.md`).
  * *Status:* Concluído.

---

### Onda 3: Testes, Verificação Independente e Checkpoint
*Objetivo:* Expandir a suíte automatizada para garantir zero regressões, conferir item por item com o Prompt 34 e consolidar no Git via Prompt 19.

* **Tarefa 3.1 (S6): Expansão da Suíte de Testes**
  * *Arquivos:* `scripts/test-app.js`.
  * *Critério de Aceitação:* Adicionar testes automatizados cobrindo a lógica de persistência (localStorage mock), geração do texto formatado para cópia no clipboard, formatação do banner de erro e verificação dos novos botões.
  * *Prompt:* Prompt 11 (`11-testing-strategy.md`).
  * *Status:* Concluído (18/18 testes passando).

* **Tarefa 3.2: Verificação Independente e Conferência (Prompt 34)**
  * *Critério de Aceitação:* Executar `node scripts/test-app.js` (todos passando), `node --check` em todos os arquivos JS, e `git diff --check`.
  * *Prompt:* Prompt 34 (`34-verification-specialist.md`).
  * *Status:* Concluído.

* **Tarefa 3.3: Consolidação Git e Documentação da Missão (Prompt 19)**
  * *Critério de Aceitação:* Atualizar `docs/missoes/plano-sugestoes.md` com status de cada sugestão, registrar commit e push com Conventional Commits sem bump de versão.
  * *Prompt:* Prompt 19 (`19-session-checkpoint.md`).
  * *Status:* Concluído.

---

## 3. Log de Progresso das Ondas

| Onda | Escopo | Status | Evidências / Notas |
| :--- | :--- | :--- | :--- |
| **Onda 1** | Docs (S2) + Error Boundary (S5) | **Concluída** | `docs/architecture.md`, `README.md`, `docs/README.md`, `script.js` (showErrorBanner) e `styles.css`. |
| **Onda 2** | Persistência (S1) + Clipboard (S3) + Haptic/Toasts (S4) | **Concluída** | `script.js`: localStorage por turno, copySummaryToClipboard, hapticFeedback, showToast; `styles.css`. |
| **Onda 3** | Testes (S6) + Review Formal + Commit/Push | **Concluída** | 18/18 testes automatizados aprovados em `scripts/test-app.js`, `node --check` 100% verde, `git diff --check` sem erros. |
