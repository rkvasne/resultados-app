# Checkpoint 0.0.17 — 28/10/2026

## Entrega

- Reformulado o cabeçalho principal da aplicação para uma arquitetura visual moderna e harmoniosa, substituindo o padrão confuso de pontuação mista (`·` e `—`) por uma hierarquia direta com título principal claro (`Resultados Eleitorais`), subtítulo em português fluído e conjunto de badges visuais estilizados em chips (`Eleições 2026`, `2º Turno`, `Zonas 3 e 30`, `● Dados Oficiais TSE`).
- Refinada a tipografia dos indicadores de apuração e comparecimento, ajustando o peso dos números de `850` para `600` (semibold), mantendo alinhamento tabular (`tabular-nums`) e restaurando a visibilidade dos subtextos contextuais de forma limpa.
- Integrados ícones vetoriais SVG inline em todos os botões da barra de ferramentas e do modal de relatório (exportação CSV, visualização de relatório, cópia de resumo, limpeza de seleção e busca, paginação), garantindo operação 100% offline sem dependência de fontes ou bibliotecas externas.
- Adicionados badges semânticos para contadores de registros e estado da barra de seleção com indicador de ponto ativo.
- Expandida a suíte de testes em `scripts/test-app.js` para 23 verificações automatizadas, cobrindo a integridade dos badges, pesos tipográficos e ícones de botões.
- Atualizados `VERSION`, `<meta name="application-version">` em `index.html`, `README.md`, `CHANGELOG.md` e guias para `0.0.17`.

## Revisão

- A inclusão dos ícones SVG inline foi realizada diretamente em elementos escaláveis com atributos padronizados (`viewBox="0 0 24 24"`, `width="14"`, `height="14"`, `stroke="currentColor"`), adaptando-se automaticamente às cores do tema claro e escuro.
- O ajuste tipográfico nas métricas evitou a agressividade visual de pesos ultra-bold, alinhando a interface com as diretrizes modernas de design de sistemas analíticos (Linear/Vercel/Apple).
- A estrutura de classes dos botões e seletores ID foi preservada integralmente para assegurar retrocompatibilidade com todos os testes e automações.

## Verificação

- `node scripts/test-app.js`: 23/23 testes aprovados (100% de sucesso).
- `node --check` validou sintaxe de todos os scripts JavaScript da aplicação.
- `git diff --check` executado sem erros de formatação ou caracteres indesejados.
- Prompt 19 e telemetria sincronizados com o repositório central.

## Aprendizado

- Fato observado: títulos que agregam múltiplos metadados concatenados por traços e pontos geram ruído visual e percepção de amadorismo na interface.
- Ação aplicada: decompor metadados em badges e chips visuais dedicados, reservando o título para o propósito central da aplicação e o subtítulo para descrição fluida em língua natural.
