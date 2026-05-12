import { neon } from "@neondatabase/serverless";

export function getEnv(key: string): string | undefined {
  return process.env[key];
}

export function getDb() {
  const url = getEnv("DATABASE_URL");
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return neon(url);
}
