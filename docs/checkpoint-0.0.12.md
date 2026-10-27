# Checkpoint 0.0.12 — 27/10/2026

## Entrega

- Busca, exportação CSV e limpeza ficam alinhadas com a contagem de resultados em uma linha nas telas largas.
- Em telas estreitas, a busca ocupa sua própria linha e os botões permanecem lado a lado, com alvos adequados ao toque.
- Atualizada a versão do painel de `0.0.11` para `0.0.12`.

## Revisão

- A grade afeta somente `.toolbar`; a barra independente de seleção de seções mantém o layout próprio.
- As regras móveis sobrescrevem a grade desktop e preservam o empilhamento abaixo de 760 px.
- Busca, exportação, limpeza e contagem continuam no mesmo DOM e seguem a consulta filtrada ativa.

## Verificação

- Navegador em 1536 px: contador e os três controles ficam alinhados na mesma linha.
- Navegador em 390 px: busca e ações se reorganizam sem rolagem horizontal da página.
- `git diff --check` sem erros.
- Prompt 19 registrado na telemetria local; snapshot de outubro atualizado e versionado.
- `npm run verify:full` não está disponível: o projeto não possui `package.json` nem suíte automatizada.

## Aprendizado

- Fato observado: os controles quebravam para duas linhas no desktop mesmo com espaço disponível.
- Ação aplicada: grade desktop explícita e manutenção da disposição móvel em coluna.
