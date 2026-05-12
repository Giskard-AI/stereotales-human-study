"use server";

import { getDb, getEnv } from "@/lib/db";
import {
  getSliderOrderForParticipant,
  type SliderOrder,
} from "@/lib/likert-order";
import { getQuestion as getQuestionData } from "@/lib/questions";
import { getAttribution, getAttributionCount } from "@/lib/attributions";
import {
  buildQuestionOrderWithAttentionChecks,
  getAttentionCheck,
  isAttentionCheck,
} from "@/lib/attention-checks";
import type { ChoiceValue } from "@/components/ChoiceButtons";

export interface ProgressData {
  participant_id: string;
  consented: boolean;
  completed: boolean;
  quiz_passed: boolean | null;
  quiz_fail_count: number;
  answered_ids: string[];
  question_order: string[];
  total_questions: number;
}

export interface AttributeData {
  name: string;
  value: string;
}

export interface QuestionData {
  question_id: string;
  avg_percentage: number;
  base_attribute: AttributeData;
  compared_attribute: AttributeData;
  metadata: Record<string, unknown>;
}

// --- Deterministic seeded shuffle (replaces Python's random.Random(hash(pid))) ---

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deterministicShuffle(arr: string[], seed: string): string[] {
  const copy = [...arr];
  const rng = mulberry32(hashString(seed));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// --- Server Actions ---

export async function getProgress(
  participantId: string,
): Promise<ProgressData> {
  const sql = getDb();

  const participants = await sql`
    SELECT * FROM participants WHERE participant_id = ${participantId}
  `;

  if (participants.length === 0) {
    return {
      participant_id: participantId,
      consented: false,
      completed: false,
      quiz_passed: null,
      quiz_fail_count: 0,
      answered_ids: [],
      question_order: [],
      total_questions: 0,
    };
  }

  const participant = participants[0];
  const answers = await sql`
    SELECT question_id FROM answers WHERE participant_id = ${participantId}
  `;

  const questionOrder = participant.question_order as string[];
  const attentionResults = (participant.attention_checks_results ?? {}) as Record<string, unknown>;
  const completedAttentionIds = Object.keys(attentionResults);

  return {
    participant_id: participantId,
    consented: true,
    completed: participant.completed_at !== null,
    quiz_passed: participant.quiz_passed as boolean | null,
    quiz_fail_count: Number(participant.quiz_fail_count ?? 0),
    answered_ids: [
      ...answers.map((a) => a.question_id as string),
      ...completedAttentionIds,
    ],
    question_order: questionOrder,
    total_questions: questionOrder.length,
  };
}

export async function consent(
  participantId: string,
): Promise<{ question_order: string[] }> {
  const sql = getDb();

  const existing = await sql`
    SELECT participant_id FROM participants WHERE participant_id = ${participantId}
  `;

  if (existing.length > 0) {
    throw new Error("Participant already consented");
  }

  const totalAttributions = getAttributionCount();
  const appVersion = getEnv("STUDY_VERSION") ?? "unknown";
  const gitSha = process.env.NEXT_PUBLIC_GIT_SHA ?? "unknown";

  // pg_advisory_xact_lock in a CTE serialises attribution assignment:
  // the lock is held for the duration of this single-statement transaction,
  // so no two concurrent requests can pick the same index.
  const LOCK_ID = 737_001;
  const inserted = await sql`
    WITH lock AS (
      SELECT pg_advisory_xact_lock(${LOCK_ID})
    ),
    next_attr AS (
      SELECT s.idx
      FROM lock, generate_series(0, ${totalAttributions - 1}) AS s(idx)
      WHERE s.idx NOT IN (
        SELECT attribution_index FROM participants WHERE attribution_index IS NOT NULL
      )
      ORDER BY s.idx
      LIMIT 1
    )
    INSERT INTO participants (participant_id, consented_at, attribution_index, question_order, app_version, git_sha)
    SELECT
      ${participantId},
      NOW(),
      next_attr.idx,
      '[]'::jsonb,
      ${appVersion},
      ${gitSha}
    FROM next_attr
    RETURNING attribution_index
  `;

  if (inserted.length === 0) {
    throw new Error("No available attributions left");
  }

  const attrIndex = inserted[0].attribution_index as number;
  const questionIds = getAttribution(attrIndex);
  const shuffled = deterministicShuffle(questionIds, participantId);
  const orderWithChecks = buildQuestionOrderWithAttentionChecks(shuffled);

  await sql`
    UPDATE participants
    SET question_order = ${JSON.stringify(orderWithChecks)}::jsonb
    WHERE participant_id = ${participantId}
  `;

  return { question_order: orderWithChecks };
}

export async function submitAnswer(
  participantId: string,
  questionId: string,
  likertHarmfulStereotype: number,
  realism: ChoiceValue,
  sliderOrder: SliderOrder,
): Promise<{ answered_count: number }> {
  const sql = getDb();

  const participants = await sql`
    SELECT participant_id, question_order, attention_checks_results FROM participants
    WHERE participant_id = ${participantId}
  `;

  if (participants.length === 0) {
    throw new Error("Participant not found");
  }

  if (sliderOrder !== getSliderOrderForParticipant(participantId)) {
    throw new Error("Slider order does not match participant");
  }

  await sql`
    INSERT INTO answers (
      participant_id,
      question_id,
      likert_harmful_stereotype,
      realism,
      slider_order,
      answered_at
    )
    VALUES (
      ${participantId},
      ${questionId},
      ${likertHarmfulStereotype},
      ${realism},
      ${sliderOrder},
      NOW()
    )
    ON CONFLICT (participant_id, question_id)
    DO UPDATE SET
      likert_harmful_stereotype = ${likertHarmfulStereotype},
      realism = ${realism},
      slider_order = ${sliderOrder},
      answered_at = NOW()
  `;

  const answers = await sql`
    SELECT question_id FROM answers WHERE participant_id = ${participantId}
  `;

  const questionOrder = participants[0].question_order as string[];
  const attentionResults = (participants[0].attention_checks_results ?? {}) as Record<string, unknown>;
  const regularQuestionCount = questionOrder.filter((id) => !isAttentionCheck(id)).length;
  const attentionCheckCount = questionOrder.filter((id) => isAttentionCheck(id)).length;
  if (
    answers.length >= regularQuestionCount &&
    Object.keys(attentionResults).length >= attentionCheckCount
  ) {
    await sql`
      UPDATE participants SET completed_at = NOW()
      WHERE participant_id = ${participantId}
    `;
  }

  return { answered_count: answers.length };
}

export async function submitAttentionCheck(
  participantId: string,
  checkId: string,
  givenValue1: number,
  givenChoice: ChoiceValue,
): Promise<{ passed: boolean }> {
  const sql = getDb();

  const participants = await sql`
    SELECT participant_id, question_order, attention_checks_results
    FROM participants WHERE participant_id = ${participantId}
  `;

  if (participants.length === 0) {
    throw new Error("Participant not found");
  }

  if (!isAttentionCheck(checkId)) {
    throw new Error("Not an attention check ID");
  }

  const check = getAttentionCheck(checkId);
  const passed =
    givenValue1 === check.expected1 && givenChoice === check.expectedChoice;

  const existing = (participants[0].attention_checks_results ?? {}) as Record<string, unknown>;
  const updated = {
    ...existing,
    [checkId]: {
      expected_1: check.expected1,
      expected_2: check.expectedChoice,
      given_1: givenValue1,
      given_2: givenChoice,
      passed,
    },
  };

  await sql`
    UPDATE participants
    SET attention_checks_results = ${JSON.stringify(updated)}::jsonb
    WHERE participant_id = ${participantId}
  `;

  return { passed };
}

export async function fetchQuestion(
  participantId: string,
  questionId: string,
): Promise<QuestionData> {
  const sql = getDb();

  const participants = await sql`
    SELECT participant_id FROM participants WHERE participant_id = ${participantId}
  `;

  if (participants.length === 0) {
    throw new Error("Participant not found");
  }

  const q = getQuestionData(questionId);
  if (!q) {
    throw new Error("Question not found");
  }

  const { question_id, avg_percentage, base_attribute, compared_attribute, ...metadata } = q;
  return {
    question_id,
    avg_percentage: avg_percentage as number,
    base_attribute: base_attribute as { name: string; value: string },
    compared_attribute: compared_attribute as { name: string; value: string },
    metadata,
  };
}

const QUIZ_CORRECT_ANSWERS: Record<string, string> = {
  q1: "b",
  q2: "a",
  q3: "a",
};

export async function submitQuiz(
  participantId: string,
  answers: Record<string, string>,
): Promise<{ passed: boolean; quiz_fail_count: number }> {
  const sql = getDb();

  const participants = await sql`
    SELECT participant_id, quiz_fail_count
    FROM participants
    WHERE participant_id = ${participantId}
  `;

  if (participants.length === 0) {
    throw new Error("Participant not found");
  }

  const passed = Object.entries(QUIZ_CORRECT_ANSWERS).every(
    ([qId, correct]) => answers[qId] === correct,
  );
  const currentFailCount = Number(participants[0].quiz_fail_count ?? 0);
  const nextFailCount = passed ? currentFailCount : currentFailCount + 1;

  await sql`
    UPDATE participants
    SET quiz_answers = ${JSON.stringify(answers)}::jsonb,
        quiz_passed = ${passed},
        quiz_fail_count = ${nextFailCount}
    WHERE participant_id = ${participantId}
  `;

  return { passed, quiz_fail_count: nextFailCount };
}

export async function getRedirectUrl(): Promise<string> {
  return getEnv("REDIRECT_URL") || "https://example.com";
}
