# Checkpoint 0.0.9 — 27/10/2026

## Escopo

- Conferidos novamente os recortes presidenciais do 2º turno contra os CSVs TSE disponíveis em `docs/`.
- Definido o 2º turno como a seleção inicial do app para evitar que relatórios sejam gerados no turno errado.
- Mantida a troca manual para o 1º turno.

## Evidências dos dados do TSE

- Eleição `6258`, turno `2`, data `25/10/2026`.
- Cobertura: 409/409 seções; 1.505 linhas de votação cruzadas; 2 candidatos.
- Totais: 113.629 aptos, 88.307 comparecimentos e 25.322 abstenções.
- Nas 409 seções, aptos = comparecimento + abstenções e votos válidos, brancos e nulos somam o comparecimento; zero divergências.
- Relatório publicado para as seções 125, 138, 156 e 165 da 30ª ZE: 830 aptos, 738 comparecimentos, 92 abstenções e 11,08% de abstenção ponderada.
- O PDF desse recorte foi gerado em uma página.

## Persistência e limites

- A suíte automatizada `npm run verify:full` não existe neste projeto porque não há `package.json`; a prévia do importador e o fluxo publicado foram verificados diretamente.
- O 1º turno continua disponível no seletor de turno.
