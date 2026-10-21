# Painel Eleitoral — 3ª e 30ª ZE de Rondônia

Painel estático e offline para consultar abstenção por seção e resultados eleitorais das Zonas Eleitorais 3 e 30 de Rondônia.

**Eleição:** 1º turno das Eleições Gerais de 2026, em 4 de outubro de 2026  
**Escopo:** Ji-Paraná e Presidente Médici, conforme a zona eleitoral  
**Versão:** 0.0.1  
**Documentação revisada em:** 21 de outubro de 2026

## Começar

Mantenha estes quatro arquivos na mesma pasta e abra o HTML em um navegador atualizado:

- [`index.html`](index.html)
- [`styles.css`](styles.css)
- [`responsive.css`](responsive.css)
- [`script.js`](script.js)

Não é necessário instalar dependências, configurar servidor, criar `.env.local` nem importar CSVs para abrir o painel. Os arquivos CSS e JavaScript são carregados localmente; os dados consultados já estão incorporados ao HTML.

## O que o painel oferece

- Indicadores de eleitores aptos, comparecimento, abstenções e taxa de abstenção.
- Filtros por zona, município e local de votação.
- Visões por seção, local, consolidados municipais, candidatos e partidos.
- Busca, ordenação de colunas, paginação e exportação dos resultados filtrados em CSV.
- Consulta offline, sem envio dos dados a um servidor.

O seletor **Cargo dos votos exibidos** altera os dados de votação. A abstenção é calculada pela seção e permanece igual para todos os cargos.

## Dados e limites

O painel incorpora dados públicos do TSE para o 1º turno de 2026. A abstenção é calculada como `abstenções ÷ eleitores aptos × 100`; percentuais consolidados são ponderados pelo número de eleitores aptos.

Os votos de candidatos e partidos disponíveis no painel estão agregados por município/zona. O filtro de local não transforma esses totais em resultados por seção. A lista de seções apuradas também não deve ser interpretada como uma lista de urnas físicas: seções agregadas e outras situações de apuração podem alterar essa correspondência.

**Presidente ainda não está integrado ao painel.** O CSV nacional de votação por seção está disponível no repositório, mas os seus votos não foram filtrados para as duas zonas nem incorporados aos dados da página. A base de comparecimento por seção já usada pelo painel permite exibir a abstenção ao lado dos votos presidenciais depois que esses resultados forem processados e cruzados com as seções corretas. Consulte [Fontes e tratamento dos dados](docs/data-sources.md).

## Onde os dados ficam

Os dados que o navegador consulta estão serializados em JSON dentro do elemento `<script id="data" type="application/json">` no HTML. O JavaScript lê esse bloco; CSS, JavaScript e dados permanecem no computador do usuário durante a consulta. A página não usa `localStorage`, banco de dados ou serviço remoto para guardar os resultados.

Os CSVs de origem ficam nas pastas de dados listadas em [Fontes e tratamento dos dados](docs/data-sources.md). Eles não são carregados automaticamente pelo painel. Para atualizar os resultados, é necessário processar as fontes e atualizar o JSON incorporado ao HTML.

## Estrutura

```text
.
├── index.html                             # Interface e dados JSON incorporados
├── styles.css                             # Estilos base
├── responsive.css                         # Ajustes para tablet e celular
├── script.js                              # Filtros, tabelas e exportação
├── detalhe_votacao_secao_2026/            # Apuração por seção de RO
├── detalhe_votacao_munzona_2026/          # Consolidados por município/zona
├── votacao_candidato_munzona_2026/        # Votos por candidato e município/zona
├── votacao_partido_munzona_2026/          # Votos por partido e município/zona
├── votacao_secao_2026_BR/                 # Votação nacional por seção, incluindo Presidente
├── historico_conversa_abstencao_eleicoes_2026.md
├── docs/
├── CHANGELOG.md
├── VERSION
├── .gitignore
└── .env.example
```

O CSV nacional de votação por seção é grande. Ele não é necessário para abrir o painel e não deve ser incorporado integralmente ao HTML; extraia apenas os registros necessários antes de integrar um novo cargo.

## Atualizar os dados

1. Identifique a edição, turno, abrangência e campos de cada arquivo TSE antes de cruzar registros.
2. Filtre as fontes para Rondônia e para as Zonas 3 e 30; para fontes nacionais grandes, processe em fluxo ou blocos.
3. Cruze os registros usando chaves eleitorais compatíveis — incluindo eleição, turno, UF, município, zona e seção quando disponíveis.
4. Preserve a base de aptos, comparecimento e abstenções uma única vez por seção. Não some as abstenções repetidas entre cargos.
5. Compare os totais por município/zona com os consolidados oficiais e registre a fonte e o tratamento em `docs/data-sources.md`.
6. Atualize o JSON do HTML, a interface e este changelog juntos. Mantenha os três arquivos do painel na mesma pasta.

## Configuração e privacidade

O projeto não exige variáveis de ambiente. O arquivo [`.env.example`](.env.example) registra essa decisão para evitar a criação de configurações fictícias. Não armazene credenciais ou dados pessoais nesse arquivo.

Todo o processamento do painel ocorre no navegador. Os arquivos CSV de origem são dados públicos de resultados eleitorais; evite adicionar dados pessoais ou credenciais ao HTML e aos documentos.

## Documentação

- [Índice da documentação](docs/README.md)
- [Arquitetura e funcionamento](docs/architecture.md)
- [Fontes e tratamento dos dados](docs/data-sources.md)
- [Histórico da conversa sobre abstenção](historico_conversa_abstencao_eleicoes_2026.md)
- [Registro de mudanças](CHANGELOG.md)
