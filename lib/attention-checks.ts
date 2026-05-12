import type { ChoiceValue } from "@/components/ChoiceButtons";

export interface AttentionCheck {
  instruction1: string; // may contain **bold** markers — slider instruction
  expected1: number;
  instruction2: string; // may contain **bold** markers — choice instruction
  expectedChoice: ChoiceValue;
}

export const ATTENTION_CHECKS: AttentionCheck[] = [
  {
    instruction1: "To confirm you are paying attention, place the slider on **4**.",
    expected1: 4,
    instruction2: "For this attention check, please select **Yes**.",
    expectedChoice: "yes",
  },
  {
    instruction1: "To verify you are following the instructions, select **1** below.",
    expected1: 1,
    instruction2: "To show you are engaged, select **No** below.",
    expectedChoice: "no",
  },
  {
    instruction1: "As an attention check, choose the value that equals **8** minus **5**.",
    expected1: 3,
    instruction2: "As a check of your attention, please select **I don't know**.",
    expectedChoice: "idk",
  },
  {
    instruction1: "Please confirm your focus by selecting **2** on the scale below.",
    expected1: 2,
    instruction2: "Please confirm you are attentive by selecting **Yes**.",
    expectedChoice: "yes",
  },
  {
    instruction1: "As a verification, choose the answer to **3** plus **1** below.",
    expected1: 4,
    instruction2: "To verify your focus, please choose **No** below.",
    expectedChoice: "no",
  },
  {
    instruction1: "To confirm you are following along, place the slider on **5**.",
    expected1: 5,
    instruction2: "As an attention check, select **I don't know** below.",
    expectedChoice: "idk",
  },
  {
    instruction1: "As a check that you are engaged, choose the result of **6** minus **4**.",
    expected1: 2,
    instruction2: "To show you are reading, please select **Yes** below.",
    expectedChoice: "yes",
  },
  {
    instruction1: "To confirm you are reading carefully, place the slider at **3**.",
    expected1: 3,
    instruction2: "As a verification, please select **No**.",
    expectedChoice: "no",
  },
  {
    instruction1: "As a verification of your focus, choose the sum of **2** and **3**.",
    expected1: 5,
    instruction2: "To demonstrate attention, please select **I don't know**.",
    expectedChoice: "idk",
  },
  {
    instruction1: "To show you are following the task, select **1** on the scale below.",
    expected1: 1,
    instruction2: "To confirm you are reading, please select **Yes** below.",
    expectedChoice: "yes",
  },
];

export const ATTENTION_CHECK_INTERVAL = process.env.ATTENTION_CHECK_INTERVAL
  ? parseInt(process.env.ATTENTION_CHECK_INTERVAL, 10)
  : 10;
export const ATTENTION_CHECK_ID_PREFIX = "attention_check:";

export function isAttentionCheck(questionId: string): boolean {
  return questionId.startsWith(ATTENTION_CHECK_ID_PREFIX);
}

export function getAttentionCheckIndex(questionId: string): number {
  return parseInt(questionId.slice(ATTENTION_CHECK_ID_PREFIX.length), 10);
}

export function getAttentionCheck(questionId: string): AttentionCheck {
  const index = getAttentionCheckIndex(questionId);
  return ATTENTION_CHECKS[index % ATTENTION_CHECKS.length];
}

export function buildQuestionOrderWithAttentionChecks(
  shuffledIds: string[],
): string[] {
  const result: string[] = [];
  let checkCounter = 0;

  for (let i = 0; i < shuffledIds.length; i++) {
    result.push(shuffledIds[i]);
    if (
      (i + 1) % ATTENTION_CHECK_INTERVAL === 0 &&
      i + 1 < shuffledIds.length
    ) {
      result.push(`${ATTENTION_CHECK_ID_PREFIX}${checkCounter}`);
      checkCounter++;
    }
  }

  return result;
}
