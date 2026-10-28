# Checkpoint 0.0.20

- **Data:** 28/10/2026
- **Versão:** 0.0.20
- **Escopo:** Modernização dos cards estatísticos (KPI Cards autônomos), eliminação de rótulos forçados em upper case, esquema de cores contemporâneo Slate e abas em segmented control.

## O que mudou

1. **Eliminação de rótulos em upper case:**
   - Remoção de `text-transform: uppercase` em `.field label`, `.metric .name`, `th` e `.eyebrow`.
   - Aplicação de *Sentence case* natural (`Zona eleitoral`, `Município`, `Local de votação`, `Taxa de abstenção`, `Comparecimento`), eliminando a estética agressiva e aumentando o conforto visual e legibilidade.

2. **Redesign completo dos cartões estatísticos:**
   - Substituição do container fatiado com divisores verticais simples por 5 cartões estatísticos individuais e autônomos.
   - Cada cartão possui container independente com cantos arredondados (`border-radius: 10px`), bordas sutis (`var(--line)`), elevação suave com sombras em camadas (`var(--shadow-card)`), e efeito de hover flutuante com elevação sutil (`transform: translateY(-1px)`).
   - O cartão de "Taxa de abstenção" recebeu acabamento contextual com borda e fundo em gradiente suave Rose e número destacado em Rose-600 (`#e11d48`).

3. **Esquema de cores contemporâneo Slate & Tailwind UI:**
   - Paleta neutra baseada na escala Slate-50 a Slate-900: `--bg: #f8fafc`, `--card: #ffffff`, `--card-alt: #f1f5f9`, `--ink: #0f172a`, `--muted: #64748b`.
   - Acentuações vibrantes e elegantes em Rose-600 (`#e11d48`), Blue-600 (`#2563eb`) e Emerald-600 (`#059669`).
   - Dark mode calibrado com fundo Slate-950 (`#030712`) e cartões em Slate-900 (`#0f172a`).

4. **Navegação em abas segmentadas (Segmented Control):**
   - Redesenho do container de abas em trilha neutra encapsulada (`background: var(--card-alt)`), com a aba ativa destacada como pílula branca com sombra suave (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06)`).

## Validações e Testes

- `node scripts/test-app.js`: 27/27 testes automatizados aprovados (100%).
- Validação visual via navegador registrando o novo visual moderno, cartões autônomos e ausência de uppercase.
- `node --check`: sintaxe JavaScript 100% válida.
- `git diff --check`: sem inconsistências de formatação ou caracteres indesejados.
