# Checkpoint 0.0.13 — 27/10/2026

## Entrega

- Unificada a hierarquia tipográfica do painel com fontes do sistema, reforçando títulos, indicadores, filtros, tabelas e cartões sem adicionar dependências externas.
- Atualizado o título do app para “Resultados — Eleições 2026 · data”; o título e a aba do navegador acompanham o turno selecionado.
- Atualizados `VERSION`, README, changelog e metadados da página para `0.0.13`.

## Revisão

- A tipografia usa a pilha nativa do sistema para continuar disponível offline.
- O cabeçalho identifica painel independente, fonte pública, região e turno; a data aparece no título sem ser repetida no subtítulo.
- Os tamanhos do relatório impresso continuam definidos pelas regras específicas de impressão.

## Verificação

- Sintaxe JavaScript validada com `node --check` em `script.js`, nos dois recortes presidenciais e nos dois importadores.
- Importador do 1º turno: 409/409 seções, 2.904 registros aproveitados e nenhuma divergência votos/comparecimento; totais: 113.616 aptos, 87.716 comparecimentos e 25.900 abstenções.
- Importador do 2º turno: 409/409 seções, 1.505 registros aproveitados e nenhuma divergência votos/comparecimento; totais: 113.629 aptos, 88.307 comparecimentos e 25.322 abstenções.
- Navegador: título conferido nos dois turnos; abas aplicáveis ao 1º turno, seleção de página e prévia do relatório verificadas.
- Layout medido em 320, 390, 1024 e 1536 px; sem transbordamento horizontal do documento. Filtros reorganizam-se conforme a largura disponível.
- `git diff --check` sem erros. `npm run verify:full` não pode ser executado porque o repositório não possui `package.json` nem suíte npm.
- Prompt 19 registrado na telemetria local; snapshot do projeto atualizado e versionado.

## Aprendizado

- Fato observado: textos auxiliares, títulos, indicadores e tabelas tinham tamanhos próximos e pesos pouco diferenciados.
- Ação aplicada: escala tipográfica por função, preservando os estilos de impressão e as fontes locais.
