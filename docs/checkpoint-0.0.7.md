# Checkpoint 0.0.7 — 27/10/2026

## Escopo

- Incluídos os dados de comparecimento e votação presidencial dos dois turnos para 409 seções das ZEs 3 e 30.
- Adicionada seleção de seções, prévia do relatório e impressão/salvamento em PDF pelo navegador.
- Incluídos na documentação os cinco relatórios SISTOT usados na conferência dos dados do primeiro turno.
- Atualizadas as instruções para as fontes TSE movidas para `docs/`.

## Revisão formal

A revisão do worktree encontrou dois achados médios, ambos corrigidos antes do checkpoint:

1. A indicação de votos presidenciais iguais ao comparecimento subtraía divergências globais mesmo com filtros ativos. A comparação agora usa apenas as seções visíveis.
2. A orientação dos cargos estaduais dizia que todos os cargos usavam uma só base. O texto agora explica a base presidencial SISTOT e as diferenças de aptos e comparecimento em quatro seções.

Não foram confirmados outros achados na seleção, nos cálculos do relatório ou na impressão durante a revisão.

## Evidências

- Os extratores validam eleição, turno, data e cobertura das 409 seções antes de gerar os recortes.
- Prévia do importador 1º turno: eleição 6257, 409/409 seções, 2.904 linhas de votação, 13 candidatos, aptos 113.616, comparecimento 87.716, abstenções 25.900 e nenhuma divergência entre votos e comparecimento.
- Prévia do importador 2º turno: eleição 6258, 409/409 seções, 1.505 linhas de votação, 2 candidatos, aptos 113.629, comparecimento 88.307, abstenções 25.322 e nenhuma divergência entre votos e comparecimento.
- Conferidos os totais presidenciais do 1º turno e os valores de quatro seções com os relatórios SISTOT arquivados em `docs/`.
- Teste funcional no navegador: relatório do 2º turno para as seções 125, 138, 156 e 165 apresentou quatro linhas e totais de 830 aptos, 738 comparecimentos e 92 abstenções (11,08% ponderados); o filtro da 30ª ZE no 1º turno indicou 232/232 correspondências.
- A versão foi sincronizada em `VERSION`, `README.md` e na meta `application-version` de `index.html`.
- Executados `node --check` nos três scripts, `git diff --check` e verificação de consistência de versão; todos passaram. O snapshot local foi gerado em `telemetry/snapshots/` (5 eventos em `events-2026-10.jsonl`).
- A suíte `npm run verify:full` não está disponível: este projeto estático não tem `package.json` nem runner de testes. O gravador oficial de telemetria do satélite também não está disponível porque `.agent/hub` não existe. Não foi criado vínculo com o Hub; o snapshot foi gerado pelo script central com `--project .`.

## Persistência

Este checkpoint reúne o código, os recortes locais, os cinco PDFs de referência e a documentação da versão 0.0.7. Os CSVs e pacotes brutos do TSE continuam excluídos do Git pelas regras de `.gitignore`.
