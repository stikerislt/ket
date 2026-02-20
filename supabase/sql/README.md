# Supabase SQL Setup

Run these SQL files in Supabase SQL Editor in this exact order:

1. `001_schema.sql`
2. `002_seed_sources_and_exam.sql`
3. `003_seed_questions.sql`

Notes:

- Scripts are re-runnable (`ON CONFLICT` upserts + delete/reinsert child rows).
- Schema matches Prisma models in `prisma/schema.prisma`.
- Seed data comes from `content/sources/ket-knygute-2024-2025.json` and `content/questions/initial-15.lt.json`.
- If you update content JSON, regenerate seed SQL with:
  - `npm run db:seed:sql`
