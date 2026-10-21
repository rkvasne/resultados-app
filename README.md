# Painel Eleitoral — 3ª e 30ª ZE de Rondônia

Painel estático e offline para consultar abstenção por seção e resultados eleitorais das Zonas Eleitorais 3 e 30 de Rondônia.

**Eleição:** 1º turno das Eleições Gerais de 2026, em 4 de outubro de 2026  
**Escopo:** Ji-Paraná e Presidente Médici, conforme a zona eleitoral  
**Versão:** 0.0.3  
**Documentação revisada em:** 21 de outubro de 2026

## Começar

Mantenha os arquivos da interface na mesma pasta e abra o HTML em um navegador atualizado:

- [`index.html`](index.html)
- [`styles.css`](styles.css)
- [`responsive.css`](responsive.css)
- [`presidente_2026.js`](presidente_2026.js)
- [`script.js`](script.js)
- [`favicon.svg`](favicon.svg)

Não é necessário instalar dependências, configurar servidor, criar `.env.local` nem importar CSVs para abrir o painel. Os estilos, a lógica e o recorte presidencial são carregados de arquivos locais; os demais dados ficam incorporados ao HTML.

## O que o painel oferece

- Indicadores de eleitores aptos, comparecimento, abstenções e taxa de abstenção.
- Filtros por zona, município e local de votação.
- Visões por seção, local, consolidados municipais, candidatos e partidos.
- Resultados presidenciais por seção e candidato para as zonas incluídas no painel.
- Busca, ordenação de colunas, paginação e exportação dos resultados filtrados em CSV.
- Consulta offline, sem envio dos dados a um servidor.

O seletor **Votos exibidos** lista os cargos do maior para o menor: Presidente, Governador, Senador, Deputado Federal e Deputado Estadual. Ele altera somente os resultados de votação; aptos, comparecimento e abstenção continuam usando a mesma base por seção. Para Presidente, estão disponíveis as visões por seção, comparação e candidatos; a visão por partido não se aplica porque o recorte por seção não traz essa classificação. Os filtros e indicadores foram compactados para dar mais destaque às tabelas. A ordenação das tabelas pode ser acionada por teclado.

## Dados e limites

O painel incorpora dados públicos do TSE para o 1º turno de 2026. A abstenção é calculada como `abstenções ÷ eleitores aptos × 100`; percentuais consolidados são ponderados pelo número de eleitores aptos.

Os votos de candidatos e partidos disponíveis no painel estão agregados por município/zona. O filtro de local não transforma esses totais em resultados por seção. A lista de seções apuradas também não deve ser interpretada como uma lista de urnas físicas: seções agregadas e outras situações de apuração podem alterar essa correspondência.

Os votos presidenciais foram extraídos do CSV nacional por seção e cruzados com as 409 seções disponíveis para as Zonas 3 e 30. O recorte local fica em `presidente_2026.js`; o CSV nacional não é carregado pelo navegador. Quatro seções apresentam pequenas diferenças entre a soma dos votos presidenciais e o comparecimento da base estadual. Essas diferenças são preservadas e documentadas; não alteram aptos, comparecimento ou abstenções do painel. Consulte [Fontes e tratamento dos dados](docs/data-sources.md).

## Onde os dados ficam

Os dados dos cargos estaduais estão serializados em JSON no elemento `<script id="data" type="application/json">` do HTML. O recorte presidencial fica no arquivo local `presidente_2026.js`. A página carrega ambos junto aos estilos e à lógica JavaScript; não usa `localStorage`, banco de dados ou serviço remoto para guardar os resultados.

Os CSVs de origem ficam nas pastas de dados listadas em [Fontes e tratamento dos dados](docs/data-sources.md). Eles não são carregados pelo painel. Para atualizar o recorte presidencial, use `node scripts/import-president.js --write` com o CSV nacional no caminho padrão.

## Estrutura

```text
.
├── index.html                             # Interface e dados JSON incorporados
├── styles.css                             # Estilos base
├── responsive.css                         # Ajustes para tablet e celular
├── presidente_2026.js                     # Recorte local de votos presidenciais
├── script.js                              # Filtros, tabelas e exportação
├── scripts/import-president.js            # Extrator em fluxo do CSV nacional do TSE
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
├── .env.example
└── favicon.svg
```

O CSV nacional de votação por seção é grande. Ele não é necessário para abrir o painel; `scripts/import-president.js` extrai somente Presidente nas seções cobertas e gera o arquivo local compacto `presidente_2026.js`.

## Atualizar os dados

1. Identifique a edição, turno, abrangência e campos de cada arquivo TSE antes de cruzar registros.
2. Filtre as fontes para Rondônia e para as Zonas 3 e 30; para fontes nacionais grandes, processe em fluxo ou blocos.
3. Cruze os registros usando chaves eleitorais compatíveis — incluindo eleição, turno, UF, município, zona e seção quando disponíveis.
4. Preserve a base de aptos, comparecimento e abstenções uma única vez por seção. Não some as abstenções repetidas entre cargos.
5. Compare os totais por município/zona com os consolidados oficiais e registre a fonte e o tratamento em `docs/data-sources.md`.
6. Atualize o recorte local, a interface e este changelog juntos. Mantenha todos os arquivos da interface na mesma pasta.

## Configuração e privacidade

O projeto não exige variáveis de ambiente. O arquivo [`.env.example`](.env.example) registra essa decisão para evitar a criação de configurações fictícias. Não armazene credenciais ou dados pessoais nesse arquivo.

Todo o processamento do painel ocorre no navegador. Os arquivos CSV de origem são dados públicos de resultados eleitorais; evite adicionar dados pessoais ou credenciais ao HTML e aos documentos.

## Documentação

- [Índice da documentação](docs/README.md)
- [Arquitetura e funcionamento](docs/architecture.md)
- [Fontes e tratamento dos dados](docs/data-sources.md)
- [Histórico da conversa sobre abstenção](historico_conversa_abstencao_eleicoes_2026.md)
- [Registro de mudanças](CHANGELOG.md)
