"use client";

import { useState } from "react";
import type { ProgressData } from "@/app/actions";
import ConsentPage from "./ConsentPage";
import InstructionsPage from "./InstructionsPage";
import QuizPage from "./QuizPage";
import QuizFirstFailPage from "./QuizFirstFailPage";
import QuizFailedPage from "./QuizFailedPage";
import QuestionPage from "./QuestionPage";
import CompletedPage from "./CompletedPage";

type Page = "consent" | "instructions-1" | "instructions-2" | "quiz" | "quiz-first-fail" | "quiz-failed" | "questions" | "completed";

function getInitialPage(progress: ProgressData): Page {
  if (!progress.consented) return "consent";
  if (progress.completed) return "completed";
  if (progress.quiz_passed === true) return "questions";
  if (progress.quiz_passed === false) {
    return progress.quiz_fail_count >= 2 ? "quiz-failed" : "quiz-first-fail";
  }
  return "instructions-1";
}

interface StudyFlowProps {
  participantId: string;
  initialProgress: ProgressData;
}

export default function StudyFlow({
  participantId,
  initialProgress,
}: StudyFlowProps) {
  const [page, setPage] = useState<Page>(() =>
    getInitialPage(initialProgress),
  );
  const [questionOrder, setQuestionOrder] = useState<string[]>(
    initialProgress.question_order,
  );
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(
    () => new Set(initialProgress.answered_ids),
  );
  const [totalQuestions, setTotalQuestions] = useState(
    initialProgress.total_questions,
  );

  function handleConsentDone(order: string[]) {
    setQuestionOrder(order);
    setAnsweredIds(new Set());
    setTotalQuestions(order.length);
    setPage("instructions-1");
  }

  function handleInstructionsNext() {
    setPage("instructions-2");
  }

  function handleInstructionsDone() {
    setPage("quiz");
  }

  function handleQuizPassed() {
    setPage("questions");
  }

  function handleQuizFailed(quizFailCount: number) {
    if (quizFailCount >= 2) {
      setPage("quiz-failed");
      return;
    }
    setPage("quiz-first-fail");
  }

  function handleReturnToInstructions() {
    setPage("instructions-1");
  }

  function handleAnswerSaved(questionId: string) {
    setAnsweredIds((prev) => new Set([...prev, questionId]));
  }

  function handleStudyComplete() {
    setPage("completed");
  }

  if (page === "consent") {
    return (
      <ConsentPage
        participantId={participantId}
        onConsentDone={handleConsentDone}
      />
    );
  }

  if (page === "instructions-1") {
    return (
      <InstructionsPage
        participantId={participantId}
        step={1}
        onContinue={handleInstructionsNext}
      />
    );
  }

  if (page === "instructions-2") {
    return (
      <InstructionsPage
        participantId={participantId}
        step={2}
        onContinue={handleInstructionsDone}
      />
    );
  }

  if (page === "quiz") {
    return (
      <QuizPage
        participantId={participantId}
        onPass={handleQuizPassed}
        onFail={handleQuizFailed}
      />
    );
  }

  if (page === "quiz-first-fail") {
    return (
      <QuizFirstFailPage onReturnToInstructions={handleReturnToInstructions} />
    );
  }

  if (page === "quiz-failed") {
    return <QuizFailedPage />;
  }

  if (page === "questions") {
    return (
      <QuestionPage
        participantId={participantId}
        questionOrder={questionOrder}
        answeredIds={answeredIds}
        totalQuestions={totalQuestions}
        onAnswerSaved={handleAnswerSaved}
        onComplete={handleStudyComplete}
      />
    );
  }

  return <CompletedPage />;
}
