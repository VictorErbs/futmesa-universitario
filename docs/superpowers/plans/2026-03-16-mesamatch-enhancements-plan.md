# MesaMatch Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Ranking, Table/QR Code Management, and Simplified Scoreboard in MesaMatch, backed entirely by the Prisma database.

**Architecture:** Extend Prisma schema to include `Table` and statistics fields, update the tournament engine and API routes, and add corresponding UI views.

**Tech Stack:** Next.js 15, Prisma ORM, SQLite/PostgreSQL, Tailwind CSS, TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-16-mesamatch-enhancements-design.md`

## Global Constraints
- Must use Prisma database for all persistent state.
- Keep architecture simple and clean.

---

## Task 1: Update Prisma Schema and Seed Data

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update schema.prisma with Table model and Match/Participant additions**

```prisma
model Table {
  id           String   @id @default(cuid())
  number       Int
  name         String?
  status       String   @default("AVAILABLE") // AVAILABLE, IN_USE, MAINTENANCE
  tournamentId String?
  matches      Match[]
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 2: Update Match model to link tableId**

```prisma
model Match {
  // existing fields...
  tableId String?
  table   Table? @relation(fields: [tableId], references: [id])
}
```

- [ ] **Step 3: Run prisma db push or generate**

Run: `npm run prisma:generate`
Expected: Success

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Table model and table relation to Match"
```
