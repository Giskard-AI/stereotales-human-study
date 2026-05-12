import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

function loadEnv() {
  try {
    const content = readFileSync(".env.local", "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (match) process.env[match[1]] = match[2];
    }
  } catch {
    // .env.local not found — assume DATABASE_URL is already in env
  }
}

async function migrate() {
  loadEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(url);

  console.log("Running schema migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS participants (
      participant_id TEXT PRIMARY KEY,
      consented_at   TIMESTAMPTZ,
      completed_at   TIMESTAMPTZ,
      question_order JSONB
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS answers (
      participant_id            TEXT REFERENCES participants(participant_id),
      question_id               TEXT,
      likert_harmful_stereotype INTEGER CHECK (likert_harmful_stereotype BETWEEN 1 AND 5),
      realism                   TEXT CHECK (realism IN ('yes','no','idk')),
      slider_order              TEXT NOT NULL DEFAULT 'harmful_first',
      answered_at               TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (participant_id, question_id)
    )
  `;

  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS app_version TEXT`;
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS git_sha TEXT`;
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS quiz_fail_count INTEGER NOT NULL DEFAULT 0`;
  await sql`
    ALTER TABLE answers
    ADD COLUMN IF NOT EXISTS slider_order TEXT NOT NULL DEFAULT 'harmful_first'
  `;
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS quiz_answers JSONB`;
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN`;
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS attention_checks_results JSONB NOT NULL DEFAULT '{}'::jsonb`;
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS attribution_index INTEGER`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_attribution ON participants (attribution_index) WHERE attribution_index IS NOT NULL`;

  // Idempotent: if running against an existing DB that had the old two-question schema,
  // add the new columns so the script still succeeds, then drop the legacy columns.
  await sql`ALTER TABLE answers ADD COLUMN IF NOT EXISTS likert_harmful_stereotype INTEGER CHECK (likert_harmful_stereotype BETWEEN 1 AND 5)`;
  await sql`ALTER TABLE answers ADD COLUMN IF NOT EXISTS realism TEXT CHECK (realism IN ('yes','no','idk'))`;
  await sql`ALTER TABLE answers DROP COLUMN IF EXISTS likert_acceptability`;
  await sql`ALTER TABLE answers DROP COLUMN IF EXISTS likert_naturalness`;

  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
