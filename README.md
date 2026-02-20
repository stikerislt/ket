# KET Scenario Trainer v1

KET Scenario Trainer yra Next.js + TypeScript mokomasis zaidimas, paremtas pateiktais KET saltiniais.

## Funkcijos

- Scenario-based klausimai su momentiniu griztamuoju rysiu
- Praktika, Egzamino simuliacija, Teminis mokymas
- Evidence-lock logika (`INSUFFICIENT_RULE_BASIS`)
- KET nuorodos prie kiekvieno klausimo
- Anoniminis progreso sekimas pagal saugu cookie token
- Admin import/publish srautas

## Techninis stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Vitest + Playwright

## Lokalus paleidimas

1. Nukopijuokite `.env.example` i `.env` ir susikoreguokite reiksmes.
2. Paleiskite DB:

```bash
docker compose up -d
```

3. Instaliuokite priklausomybes:

```bash
npm install
```

4. Sugeneruokite Prisma klienta ir pritaikykite schema:

```bash
npm run db:generate
npm run db:push
```

5. Uzkraukite pradinius saltinius ir klausimus:

```bash
npm run db:seed
```

6. Paleiskite programa:

```bash
npm run dev
```

## Supabase SQL paleidimas

Jei naudojate Supabase vietoje lokalaus Docker Postgres:

1. Atidarykite Supabase projekto SQL Editor.
2. Paleiskite skriptus tokia tvarka:
   - `supabase/sql/001_schema.sql`
   - `supabase/sql/002_seed_sources_and_exam.sql`
   - `supabase/sql/003_seed_questions.sql`
3. Programos `.env` faile nustatykite `DATABASE_URL` i Supabase Postgres connection string (`sslmode=require`).

Pastaba: seeding SQL skriptai yra idempotentiniai (gali buti paleidziami pakartotinai).

## Testai

```bash
npm run test
npm run test:e2e
```

## API (v1)

- `GET /api/v1/questions`
- `POST /api/v1/attempts`
- `POST /api/v1/attempts/{id}/answers`
- `POST /api/v1/attempts/{id}/complete`
- `GET /api/v1/progress`
- `POST /api/v1/admin/questions/import`
- `POST /api/v1/admin/questions`
- `PATCH /api/v1/admin/questions/{id}`
- `POST /api/v1/admin/questions/{id}/publish`
- `GET /api/v1/admin/sources`

Admin endpointams butina antraste: `x-admin-password`.

## Svarbios pastabos

- Egzamino vertinimas pagal oficialu Regitra teorijos slenksti paliktas `UNSCORED`, jei truksta patvirtintos taisykliu bazes.
- Klausimai publikuojami tik kai yra bent viena pirmine KET nuoroda.
