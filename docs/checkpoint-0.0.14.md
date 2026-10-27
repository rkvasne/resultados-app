# Checkpoint 0.0.14 — 27/10/2026

## Entrega

- Padronizados os checkboxes da tabela e dos cartões móveis em 16 × 16 px, com aparência nativa do navegador.
- Mantido alvo clicável com pelo menos 44 px nos cartões móveis, foco de teclado visível e realce da linha selecionada.
- Harmonizados espaçamentos, títulos, abas, tabelas, rankings, cartões e estados de botões entre as visões de dados e o relatório.
- Atualizados `VERSION`, metadado da página, README e changelog para `0.0.14`.

## Revisão

- O estilo geral, as cores e o fluxo funcional do painel foram preservados; as mudanças ficam em `responsive.css` e se aplicam às visões do primeiro e do segundo turno.
- Revisado o cascade: o checkbox permanece 16 px em tabela e cartão; a área de toque adicional é limitada ao rótulo móvel.
- Verificadas linhas selecionadas, foco, hover e estados desabilitados; os estilos impressos do relatório permanecem próprios para impressão.

## Verificação

- `node --check` passou para `script.js`, `presidente_2026.js`, `presidente_2026_2t.js`, `scripts/import-president.js` e `scripts/import-president-2t.js`.
- Importador do 1º turno: 409/409 seções, 2.904 registros, aptos 113.616, comparecimentos 87.716, abstenções 25.900 e zero divergências entre votos e comparecimento.
- Importador do 2º turno: 409/409 seções, 1.505 registros, aptos 113.629, comparecimentos 88.307, abstenções 25.322 e zero divergências entre votos e comparecimento.
- Navegador: visões de seção, local, comparativo, candidatos e partidos no 1º turno; seções, local, comparativo e candidatos no 2º; prévia do relatório com fontes.
- Layout em 320, 390, 1024 e 1536 px: sem transbordamento horizontal. Checkbox de 16 × 16 px; alvo móvel medido em 53 × 44 px. Console sem erros.
- `git diff --check` passou. `npm run verify:full` não pôde ser executado porque o projeto não contém `package.json` ou suíte npm.
- Prompt 19 registrado na telemetria local, com snapshot atualizado e incluído no commit.
- `sync-version.js --dry-run` resolveu o contexto central `agents-rules`, não o contexto deste repositório; não gravou arquivos. As referências do projeto foram sincronizadas manualmente, sem criar junction ou link para o Hub.

## Aprendizado

- Fato observado: os checkboxes de 20 px chamavam atenção além do necessário, e os estilos do rótulo e do alvo móvel não distinguiam o tamanho do controle da área de interação.
- Ação aplicada: adotar o checkbox nativo de 16 px e separar visualmente sua dimensão da área móvel acessível.
