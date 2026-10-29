# Checkpoint 0.1.3 — Seleção Total via Cabeçalho da Tabela

**Data:** 29/10/2026
**Versão:** 0.1.3

---

## 1. Contexto e Objetivo

Na visão principal de seções eleitorais (`tab-sections`), o cabeçalho da coluna de seleção exibia apenas o rótulo de texto estático `Selecionar`. Para marcar todas as seções de uma consulta, os usuários precisavam recorrer exclusivamente aos botões de ação na barra superior ("Selecionar todas" ou "Selecionar página").

Em interfaces web e aplicações analíticas contemporâneas, o padrão de usabilidade consagrado é a presença de uma caixa de seleção mestre no cabeçalho da coluna (`th`), que permite selecionar e desselecionar o conjunto em lote diretamente com um clique, apresentando estado intermediário (*indeterminate*) quando apenas parte dos itens está marcada.

O objetivo do Checkpoint 0.1.3 foi implementar essa funcionalidade nativa de forma acessível, rápida e reativa, com feedback de toast, vibração tátil e sincronização com filtros e persistência.

---

## 2. Alterações Realizadas

### 2.1 Controle Mestre no Cabeçalho (`script.js`)
- **Marcação Dinâmica em `show()`:**
  - Substituição de `<th>Selecionar</th>` por:
    ```html
    <th class="selection-cell" title="Selecionar ou desmarcar todos os registros filtrados">
      <label class="selection-header-wrap" for="select-all-header">
        <input type="checkbox" id="select-all-header" aria-label="Selecionar todos os registros filtrados">
        <span class="sr-only">Selecionar todos</span>
      </label>
    </th>
    ```
- **Lógica de Alternância Total (`handleToggleAll`):**
  - Vinculada ao evento `change` do `#select-all-header` e ao clique de conveniência em `th.selection-cell`.
  - Ao marcar, adiciona todas as chaves de `rowsCurrent` ao conjunto `selectedSections`.
  - Ao desmarcar, remove todas as chaves de `rowsCurrent` do conjunto `selectedSections`.
  - Exibe toast contextual (`X seções selecionadas.` / `Todas as seções foram desmarcadas.`), aciona `triggerHapticFeedback()` e persiste imediatamente em `localStorage`.
- **Sincronização de Estados em `updateSelectionControls()`:**
  - Calcula a interseção entre `rowsCurrent` e `selectedSections`.
  - Se todas as seções filtradas estiverem selecionadas: `checked = true`, `indeterminate = false`.
  - Se algumas (mas não todas) estiverem selecionadas: `checked = false`, `indeterminate = true`.
  - Se nenhuma estiver selecionada: `checked = false`, `indeterminate = false`.
  - Se a tabela não possuir registros (`rowsCurrent.length === 0`): `disabled = true`.

### 2.2 Estilização e Acessibilidade (`styles.css`)
- Criação da classe `.selection-header-wrap` com `display: inline-flex; align-items: center; justify-content: center; cursor: pointer;`.
- Criação da classe `.sr-only` para leitores de tela sem causar deslocamentos de layout.
- Centralização estrita do controle na célula `th.selection-cell`.

### 2.3 Suíte de Testes Automatizados (`scripts/test-app.js`)
- Adicionada a seção `[14] Seleção Total via Cabeçalho da Tabela`:
  - Teste de integridade de marcação e suporte a estado `indeterminate`.
  - Teste de alternância mestre cobrindo seleção total e desmarcação em lote sobre registros filtrados.
- Suíte total expandida para **34 testes**, todos aprovados com 100% de sucesso.

---

## 3. Verificações e Evidências

- **Verificação Visual em Navegador Real:**
  - Validação do estado desmarcado (vazio).
  - Validação do estado indeterminado (*dash* intermediário) ao marcar seções individuais.
  - Validação do estado totalmente marcado (*check*) ao clicar no cabeçalho ou no botão "Selecionar todas".
- **Testes Unitários:** `node scripts/test-app.js` → 34/34 testes aprovados.
- **Sintaxe JavaScript:** `node --check script.js presidente_2026.js presidente_2026_2t.js scripts/test-app.js` → 0 erros.
- **Formatação de Código:** `git diff --check` → 0 pendências.

---

## 4. Próximos Passos Sugeridos

- Acompanhar usabilidade em consultas extensas com paginação de 100 itens e "Todos".
- Avaliar a extensão de controles mestres similares em futuras tabelas detalhadas, se aplicável.
