import { NextRequest, NextResponse } from "next/server";
import { getDb, getEnv } from "@/lib/db";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = getEnv("API_KEY");

  if (!expectedKey) {
    return NextResponse.json({ detail: "API_KEY not configured" }, { status: 500 });
  }

  if (apiKey !== expectedKey) {
    return NextResponse.json({ detail: "Invalid API key" }, { status: 403 });
  }

  const sql = getDb();

  const rows = await sql`
    SELECT a.participant_id, a.question_id,
           a.likert_harmful_stereotype, a.realism,
           a.slider_order, a.answered_at,
           p.app_version, p.git_sha
    FROM answers a
    JOIN participants p USING (participant_id)
    ORDER BY a.participant_id, a.answered_at
  `;

  const lines = rows.map((row) =>
    JSON.stringify({
      participant_id: row.participant_id,
      question_id: row.question_id,
      likert_harmful_stereotype: row.likert_harmful_stereotype,
      realism: row.realism,
      slider_order: row.slider_order,
      answered_at: row.answered_at,
      app_version: row.app_version,
      git_sha: row.git_sha,
    }),
  );

  const body = lines.length > 0 ? lines.join("\n") + "\n" : "";

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "application/jsonlines" },
  });
}
