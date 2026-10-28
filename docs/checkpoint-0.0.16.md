# Checkpoint 0.0.16 — 28/10/2026

## Entrega

- Implementada persistência automática em `localStorage` para a seleção de seções do relatório (`selectedSections`), particionada por turno (`resultados_app_selected_t1` e `resultados_app_selected_t2`), prevenindo perda de trabalho ao recarregar a página ou navegar.
- Implementado botão "Copiar resumo" na barra de seleção de seções e no modal de relatório, permitindo transferência rápida do texto consolidado via Clipboard API com fallback automático para `document.execCommand`.
- Adicionado sistema de feedback tátil leve (`navigator.vibrate(20)`) e avisos flutuantes (*toasts*) temporizados com `role="status"` e `aria-live="polite"`, plenamente compatíveis com os temas claro e escuro.
- Implementado tratamento visual de erros de carga (*Error Boundary*) com banner explicativo amigável (`showErrorBanner`) ao capturar falhas no carregamento de dados essenciais (`TURNO_1_RESUMO` ou `TURNO_2_RESUMO`).
- Expandida a suíte de testes de integridade em `scripts/test-app.js` de 13 para 20 testes, validando persistência, chaves de armazenamento, fallback de cópia, formatação de texto e conformidade com as regras de resiliência.
- Justificado formalmente no plano de sugestões (`docs/missoes/plano-sugestoes.md`) o motivo da não adoção de Service Worker / PWA para manter o escopo estático offline puro, sem riscos de cache zumbi.
- Atualizados `VERSION`, metadado `<meta name="application-version">` em `index.html`, `README.md`, `CHANGELOG.md` e guias documentais para `0.0.16`.

## Revisão

- As funções de persistência utilizam encapsulamento defensivo `try/catch` para respeitar ambientes restritos ou modos de navegação privada onde o `localStorage` pode lançar exceções de quota ou segurança.
- O mecanismo de cópia desacoplou a verificação da Clipboard API assíncrona, assegurando que rejeições de promessa acionem o fallback síncrono via `document.createElement('textarea')` sem propagar erros não tratados.
- Os tokens de cor nos elementos flutuantes e faixas de erro foram vinculados estritamente ao design system existente através da variável semântica `--ink`, prevenindo regressões de contraste.

## Verificação

- `node scripts/test-app.js`: 20/20 testes aprovados (100% de sucesso).
- `node --check` validou sintaxe sem erros para `script.js`, `presidente_2026.js`, `presidente_2026_2t.js`, `scripts/test-app.js`, `scripts/import-president.js` e `scripts/import-president-2t.js`.
- `git diff --check` executado sem erros de formatação ou caracteres indesejados.
- Prompt 19 e telemetria de ciclo registradas no histórico do ecossistema.

## Aprendizado

- Fato observado: a API assíncrona `navigator.clipboard.writeText` pode falhar em contextos sem foco direto de usuário ou sob certas permissões do navegador; ao aninhar o fallback dentro do mesmo bloco try que a promessa rejeitada sem tratamento adequado, a recuperação síncrona não disparava.
- Ação aplicada: isolar a chamada de promessa em bloco dedicado e chavear o fallback sempre que o método assíncrono falhar ou estiver indisponível.
