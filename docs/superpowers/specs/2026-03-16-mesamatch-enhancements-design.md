# Design Spec: Melhorias Integradas para o MesaMatch (Ranking, QR Code de Mesas e Súmula Simplificada)

## 1. Visão Geral
Este documento especifica a adição de três melhorias principais ao projeto **MesaMatch**, mantendo uma arquitetura enxuta, pragmática e sem complexidades desnecessárias (compatível com SQLite local e PostgreSQL em nuvem via Prisma ORM):
1. **Ranking Geral & Histórico de Jogadores**: Agregação de estatísticas por participante ao longo dos torneios.
2. **Gestão de Mesas & QR Code**: Atribuição de partidas a mesas físicas e identificadores fáceis.
3. **Súmula Digital Simplificada**: Histórico rápido de sets/pontos e validação no placar.

---

## 2. Alterações no Modelo de Dados (Prisma Schema)

Adicionaremos os seguintes modelos e campos no `prisma/schema.prisma`:

### Modelos Novos / Ajustados:
- **`Table` (Mesa)**:
  - `id`: String (UUID ou Cuid)
  - `number`: Int (Ex: Mesa 1, 2, 3)
  - `name`: String? (Ex: "Mesa Principal")
  - `status`: Enum (`AVAILABLE`, `IN_USE`, `MAINTENANCE`)
  - `tournamentId`: Foreign Key opcional (ou global do sistema)
- **`Match` (Atualização)**:
  - Adicionar `tableId`: Foreign Key para `Table`
  - Adicionar `eventsJson`: String/JSON para histórico simplificado de pontos (opcional, ex: cronologia dos sets).
- **`Participant` (Atualização / Estatísticas)**:
  - Adicionar campos de cache de estatísticas ou consultas agregadas dinâmicas (vitórias, derrotas, saldo total).

---

## 3. Componentes e Telas

1. **Ranking Geral (`/ranking` ou `/torneios/[id]/ranking`)**:
   - Tabela consolidada calculando o aproveitamento de cada atleta/dupla.
2. **Painel de Mesas (`/torneios/[id]/mesas`)**:
   - Visualização rápida do status de cada mesa e qual partida está rolando.
   - Geração de link/QR Code simples (ex: URL amigável apontando para `/torneios/[id]/mesa/[tableId]`).
3. **Placar Aprimorado (`/torneios/[id]/mesa/[tableId]` ou painel de jogo)**:
   - Botões touch grandes para pontuar, indicando set atual e histórico rápido dos sets anteriores.

---

## 4. Plano de Verificação

- **Testes Unitários**:
  - Testar funções de cálculo de estatísticas e ranking no `tournament-engine.ts`.
- **Testes Manuais**:
  - Criar torneio, alocar partidas em mesas, testar o placar ao vivo e visualizar o ranking atualizado após encerrar uma partida.
