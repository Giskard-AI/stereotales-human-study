import questionsData from "@/data/questions.json";

export interface Question {
  question_id: string;
  avg_percentage: number;
  [key: string]: unknown;
}

const questionsMap = new Map<string, Question>(
  (questionsData as Question[]).map((q) => [q.question_id, q]),
);

export function getQuestionIds(): string[] {
  return Array.from(questionsMap.keys());
}

export function getQuestion(questionId: string): Question | undefined {
  return questionsMap.get(questionId);
}

export function getTotalQuestions(): number {
  return questionsMap.size;
}
