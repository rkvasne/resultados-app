# Checkpoint 0.0.10 — 27/10/2026

## Entrega

- O relatório de consulta agora identifica a fonte de comparecimento/abstenção e, para Presidente, a fonte de votação por seção, com os caminhos relativos dos arquivos.
- O bloco de procedência informa catálogo TSE, código da eleição, turno, data, UF, zonas e seções selecionadas, além de `DT_GERACAO`/`HH_GERACAO` quando disponíveis.
- Os cabeçalhos das colunas numéricas estão alinhados à direita com os valores correspondentes.

## Verificação

- Importadores presidenciais dos turnos 1 e 2 executados com `--write`: 409/409 seções em cada turno e nenhuma divergência entre votos e comparecimento.
- Relatório do 2º turno para as seções 125, 138, 156 e 165 da 30ª ZE: 830 aptos, 738 comparecimentos e 92 abstenções; PDF em uma página.
- Prévia no navegador conferida para cabeçalhos e células numéricas; `node --check` nos scripts e `git diff --check` sem erros.
