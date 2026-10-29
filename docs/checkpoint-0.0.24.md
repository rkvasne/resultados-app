# Checkpoint 0.0.24

- **Data:** 29/10/2026
- **Versão:** 0.0.24
- **Escopo:** Alinhamento milimétrico entre dados e títulos de colunas na tabela de apuração e no relatório.

## O que mudou

1. **Alinhamento e coerência visual por tipo de coluna:**
   - **Colunas de texto:** "Município", "Local de votação", "Endereço", "Partido", "Situação" e "Destinação" configuradas com alinhamento à esquerda (`text-align: left`) tanto no cabeçalho `<th>` quanto nas células `<td>`. O texto dos títulos e das linhas inicia rigorosamente no mesmo pixel vertical.
   - **Colunas numéricas e códigos:** "ZE", "Seção", "Local nº", "Aptos", "Comparecimento", "Abstenções", "Brancos", "Nulos", "Nominais" e "Legenda" configuradas com alinhamento centralizado (`text-align: center`), posicionando cada valor diretamente sob o centro do título da respectiva coluna.
   - **Coluna composta "Abstenção %":** Célula com contêiner `.rate-cell` em flexbox centralizado (`display: inline-flex; align-items: center; justify-content: center; gap: 8px`), posicionando a tag percentual e a mini barra de progresso centralizadas sob o título.
2. **Eliminação de espaço fantasma nos botões de ordenação:**
   - O indicador de ordenação (`.sort-indicator`) só é renderizado no DOM do cabeçalho quando a coluna estiver ativamente ordenada, evitando gap de flexbox quando inativa.
3. **Harmonia na tabela de relatório (`.report-table`):**
   - Regras idênticas aplicadas às tabelas de visualização e exportação/impressão para manter coerência visual.

## Validações e Testes

- `node scripts/test-app.js`: 27/27 testes automatizados aprovados (100%).
- Validação visual em navegador via captura de tela atestando que todas as colunas de dados estão milimetricamente alinhadas com seus títulos correspondentes.
- `node --check`: sintaxe JavaScript de todos os scripts validada com sucesso.
- `git diff --check`: sem inconsistências de formatação.
