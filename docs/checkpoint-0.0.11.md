# Checkpoint 0.0.11 — 27/10/2026

## Entrega

- A interface organiza filtros e indicadores por largura da tela. No celular, as linhas das cinco visões são apresentadas em cartões; a tabela completa permanece para desktop.
- Os cartões de seção permitem selecionar registros para a prévia do relatório e expandir dados adicionais. Busca, ordenação, paginação e exportação continuam disponíveis.
- O layout foi revisto em 320, 390, 1024 e 1536 px. As abas ficam visíveis em grade e a página não cria rolagem horizontal.
- Fontes do relatório ligam diretamente aos recursos oficiais TSE, com catálogo e conjunto de dados.

## Revisão formal

- Confirmado que cartões e tabela usam as mesmas linhas filtradas e a mesma chave de seleção; a seleção continua válida ao alternar entre filtros e ao gerar a prévia.
- Confirmado que a lista móvel respeita a ordenação atual e expõe os dados secundários em controles expansíveis. `aria-pressed` reflete a aba ativa.
- Confirmado que o CSS de impressão continua exibindo apenas o relatório, sem substituir a tabela impressa por cartões móveis.
- Limitação conhecida: a tabela da prévia do relatório pode exigir rolagem horizontal em telas estreitas para mostrar todas as colunas.

## Verificação

- `node scripts/import-president.js`: 409/409 seções; 2.904 linhas aproveitadas; totais 113.616 aptos, 87.716 comparecimentos, 25.900 abstenções; zero divergências entre votos e comparecimento.
- `node scripts/import-president-2t.js`: 409/409 seções; 1.505 linhas aproveitadas; totais 113.629 aptos, 88.307 comparecimentos, 25.322 abstenções; zero divergências entre votos e comparecimento.
- `node --check` nos scripts JavaScript, `git diff --check` e inspeção do console do navegador sem erros.
- Prompt 19 registrado na telemetria local; snapshot de outubro atualizado e versionado.
- Não há `package.json`, runner nem suíte automatizada neste repositório; por isso `npm run verify:full` não está disponível. Os importadores foram executados em modo de prévia, sem regravar os arquivos de dados processados.

## Arquivos desta entrega

- `index.html`, `responsive.css`, `script.js` — metadado de versão e interface responsiva.
- `presidente_2026.js`, `presidente_2026_2t.js`, `scripts/import-president.js`, `scripts/import-president-2t.js` — endereços oficiais dos ZIPs TSE utilizados.
- `README.md`, `docs/README.md`, `docs/data-sources.md`, `docs/checkpoint-0.0.10.md` — documentação sincronizada com os ajustes desta sessão.

## Aprendizado

- Fato observado: em 390 px, a tabela de seções extrapolava a tela e parte das abas ficava fora da área visível; no desktop, cinco filtros em quatro colunas deixavam o último sozinho na linha seguinte.
- Ação aplicada: cartões móveis e grades adaptáveis para filtros, métricas e abas.
