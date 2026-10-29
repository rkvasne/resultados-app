# Resultados Eleitorais 2026

Painel independente, estático e offline para consultar abstenção por seção e resultados eleitorais das Zonas Eleitorais 3 e 30 de Rondônia, com dados públicos do TSE.

**Eleição:** 1º turno (4 de outubro) e 2º turno (25 de outubro) das Eleições Gerais de 2026

**Escopo:** Ji-Paraná e Presidente Médici, conforme a zona eleitoral

**Versão:** 0.1.1

**Documentação revisada em:** 29/10/2026

## Começar

Mantenha os arquivos da interface na mesma pasta e abra o HTML em um navegador atualizado:

- [`index.html`](index.html)
- [`styles.css`](styles.css)
- [`responsive.css`](responsive.css)
- [`presidente_2026.js`](presidente_2026.js)
- [`presidente_2026_2t.js`](presidente_2026_2t.js)
- [`script.js`](script.js)
- [`favicon.svg`](favicon.svg)
- [`.vercelignore`](.vercelignore)

Não é necessário instalar dependências, configurar servidor, criar `.env.local` nem importar CSVs para abrir o painel. Os estilos, a lógica e o recorte presidencial são carregados de arquivos locais; os demais dados ficam incorporados ao HTML.

## O que o painel oferece

- Indicadores de eleitores aptos, comparecimento, abstenções e taxa de abstenção.
- Seleção de várias seções para uma prévia de relatório com totais ponderados e percentuais por seção; impressão do relatório ou salvamento em PDF pelo navegador.
- Filtros por zona, município e local de votação.
- Visões por seção, local, consolidados municipais, candidatos e partidos.
- Resultados presidenciais por seção e candidato para as zonas incluídas no painel.
- Busca, ordenação de colunas, paginação e exportação dos resultados filtrados em CSV.
- Consulta offline, sem envio dos dados a um servidor.
- Interface responsiva: filtros e indicadores se reorganizam em telas menores; os resultados viram cartões no celular e as seções podem ser selecionadas para o relatório.
- Ordenação móvel por campo e direção, com dados adicionais expansíveis nos cartões.
- Hierarquia tipográfica unificada com fontes do sistema, sem dependências externas, para leitura consistente também offline.
- Caixas de seleção nativas de 16 px, com área de toque acessível no celular e realce da seção selecionada.
- Suporte nativo ao Modo Escuro (`prefers-color-scheme: dark`) e sensibilidade a movimento (`prefers-reduced-motion: reduce`).
- Navegação fluida por teclado nas abas por setas direcionais (WAI-ARIA Tabs pattern) e anel de foco de alto contraste.
- Estado vazio (*empty state*) interativo com botão direto para "Limpar busca e filtros".
- Busca otimizada com debounce inteligente de 180 ms na digitação.

O seletor **Turno** abre no 2º turno e permite consultar as duas apurações. No 1º turno, **Votos exibidos** lista os cargos do maior para o menor: Presidente, Governador, Senador, Deputado Federal e Deputado Estadual. Ao escolher Presidente, os votos e indicadores usam o detalhamento presidencial do TSE/SISTOT; para os demais cargos, usam o detalhamento estadual. No 2º turno, Presidente é o único cargo disponível e seus votos, aptos, comparecimento e abstenções vêm das respectivas fontes de 25/10. Para Presidente, estão disponíveis as visões por seção, comparação e candidatos; a visão por partido não se aplica porque o recorte por seção não traz essa classificação. A ordenação das tabelas pode ser acionada por teclado.

## Dados e limites

O painel incorpora dados públicos do TSE para os dois turnos de 2026. No 2º turno, a interface mostra apenas Presidente e usa aptos, comparecimento e abstenções da apuração de 25/10. A abstenção é calculada como `abstenções ÷ eleitores aptos × 100`; percentuais consolidados são ponderados pelo número de eleitores aptos.

Os votos de candidatos e partidos disponíveis no painel estão agregados por município/zona. O filtro de local não transforma esses totais em resultados por seção. A lista de seções apuradas também não deve ser interpretada como uma lista de urnas físicas: seções agregadas e outras situações de apuração podem alterar essa correspondência.

Os recortes presidenciais em `presidente_2026.js` e `presidente_2026_2t.js` combinam votação e comparecimento por ZE, município e seção. No 1º turno, Presidente usa a base presidencial do TSE/SISTOT e fecha os totais municipais dos relatórios. Ela difere da base estadual em aptos e comparecimento em quatro seções, mas mantém as mesmas abstenções. Os CSVs de origem não são carregados pelo navegador. Consulte [Fontes e tratamento dos dados](docs/data-sources.md).

## Onde os dados ficam

Os dados dos cargos estaduais estão serializados em JSON no elemento `<script id="data" type="application/json">` do HTML. Os recortes presidenciais ficam em `presidente_2026.js` e `presidente_2026_2t.js`. A página carrega esses arquivos locais junto aos estilos e à lógica JavaScript; não usa `localStorage`, banco de dados ou serviço remoto para guardar os resultados.

Os CSVs de origem ficam sob `docs/` e não são carregados pelo painel. Para atualizar o recorte presidencial, use `node scripts/import-president.js --write`; o caminho padrão é `docs/votacao_secao_2026_BR/votacao_secao_2026_BR.csv`.

## Estrutura

```text
.
├── index.html                             # Interface e dados JSON incorporados
├── styles.css                             # Estilos base
├── responsive.css                         # Ajustes para tablet e celular
├── presidente_2026.js                     # Recorte local de votos presidenciais
├── presidente_2026_2t.js                  # Recorte local presidencial do 2º turno
├── script.js                              # Filtros, tabelas e exportação
├── scripts/import-president.js            # Extrator em fluxo do CSV nacional do TSE
├── scripts/import-president-2t.js         # Votos e comparecimento presidenciais do 2º turno
├── scripts/test-app.js                    # Suíte de testes automatizados em Node
├── historico_conversa_abstencao_eleicoes_2026.md
├── docs/                                  # Documentação e fontes TSE ignoradas pelo Git
│   ├── detalhe_votacao_secao_2026/
│   ├── detalhe_votacao_munzona_2026/
│   └── votacao_secao_2026_BR/
├── CHANGELOG.md
├── VERSION
├── .gitignore
├── .vercelignore
├── .env.example
└── favicon.svg
```

Os CSVs nacionais de votação por seção são grandes e não são necessários para abrir o painel. `scripts/import-president.js` atualiza `presidente_2026.js`; `scripts/import-president-2t.js` cruza votação e comparecimento do segundo turno e gera `presidente_2026_2t.js`. Os arquivos regionais de RO rotulados `_2t` estavam desatualizados e não foram usados. Consulte [Fontes e tratamento dos dados](docs/data-sources.md).

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
