"use client";

import { useState, useEffect, type ReactNode } from "react";
import { fetchQuestion, submitAnswer, submitAttentionCheck } from "@/app/actions";
import type { QuestionData } from "@/app/actions";
import { getSliderOrderForParticipant } from "@/lib/likert-order";
import { isAttentionCheck, getAttentionCheck } from "@/lib/attention-checks";
import LikertSlider from "./LikertSlider";
import ChoiceButtons, { type ChoiceValue } from "./ChoiceButtons";
import ProgressBar from "./ProgressBar";
import InstructionsModal from "./InstructionsModal";

function renderBold(text: string): ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

function formatAttributeName(name: string): string {
  return name.replace(/_/g, " ");
}

const HARMFUL_TICKS: [string, string, string, string, string] = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

interface QuestionPageProps {
  participantId: string;
  questionOrder: string[];
  answeredIds: Set<string>;
  totalQuestions: number;
  onAnswerSaved: (questionId: string) => void;
  onComplete: () => void;
}

export default function QuestionPage({
  participantId,
  questionOrder,
  answeredIds,
  totalQuestions,
  onAnswerSaved,
  onComplete,
}: QuestionPageProps) {
  const firstUnanswered = questionOrder.findIndex(
    (qid) => !answeredIds.has(qid),
  );
  const startIndex = firstUnanswered >= 0 ? firstUnanswered : 0;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loadedQuestionId, setLoadedQuestionId] = useState<string | null>(null);
  const [harmfulStereotype, setHarmfulStereotype] = useState<number | null>(null);
  const [realism, setRealism] = useState<ChoiceValue | null>(null);
  const [attentionValue1, setAttentionValue1] = useState<number | null>(null);
  const [attentionChoice, setAttentionChoice] = useState<ChoiceValue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const currentQid = questionOrder[currentIndex];
  const isCurrentAttentionCheck = isAttentionCheck(currentQid ?? "");
  const sliderOrder = getSliderOrderForParticipant(participantId);

  useEffect(() => {
    if (!currentQid) return;

    let cancelled = false;

    if (isAttentionCheck(currentQid)) {
      void Promise.resolve().then(() => {
        if (cancelled) return;
        setHarmfulStereotype(null);
        setRealism(null);
        setAttentionValue1(null);
        setAttentionChoice(null);
        setLoadedQuestionId(currentQid);
      });
      return () => { cancelled = true; };
    }

    void fetchQuestion(participantId, currentQid)
      .then((q) => {
        if (cancelled) return;
        setHarmfulStereotype(null);
        setRealism(null);
        setAttentionValue1(null);
        setAttentionChoice(null);
        setQuestion(q);
      })
      .catch(() => {
        if (cancelled) return;
        setQuestion(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadedQuestionId(currentQid);
      });

    return () => {
      cancelled = true;
    };
  }, [participantId, currentQid]);

  const canSubmit = isCurrentAttentionCheck
    ? attentionValue1 != null && attentionChoice != null && !submitting
    : harmfulStereotype != null && realism != null && !submitting;
  const loading = currentQid != null && loadedQuestionId !== currentQid;

  async function handleNext() {
    setSubmitting(true);
    try {
      if (isCurrentAttentionCheck) {
        await submitAttentionCheck(
          participantId,
          currentQid,
          attentionValue1!,
          attentionChoice!,
        );
      } else {
        await submitAnswer(
          participantId,
          currentQid,
          harmfulStereotype!,
          realism!,
          sliderOrder,
        );
      }
      onAnswerSaved(currentQid);

      if (currentIndex + 1 >= questionOrder.length) {
        onComplete();
      } else {
        setCurrentIndex((i) => i + 1);
      }
    } catch {
      alert("Failed to save your answer. Please try again.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading question...</div>
      </div>
    );
  }

  if (isCurrentAttentionCheck) {
    const check = getAttentionCheck(currentQid);

    const attentionSliderBlock = (
      <LikertSlider
        key="attention_slider"
        label={renderBold(check.instruction1)}
        value={attentionValue1}
        onChange={setAttentionValue1}
      />
    );
    const attentionChoiceBlock = (
      <ChoiceButtons
        key="attention_choice"
        label={renderBold(check.instruction2)}
        value={attentionChoice}
        onChange={setAttentionChoice}
      />
    );
    const attentionBlocks =
      sliderOrder === "harmful_first"
        ? [attentionSliderBlock, attentionChoiceBlock]
        : [attentionChoiceBlock, attentionSliderBlock];

    return (
      <>
        <InstructionsModal
          open={showInstructions}
          onClose={() => setShowInstructions(false)}
          sliderOrder={sliderOrder}
        />

        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="max-w-3xl w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowInstructions(true)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400 transition-colors whitespace-nowrap shadow-sm"
                  title="View study instructions"
                  aria-label="View study instructions"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold leading-none">?</span>
                  Instructions Reminder
                </button>
              </div>

              <p className="text-xl text-gray-800 leading-relaxed">
                This question is an <strong>attention check</strong>, please
                follow the <strong>instructions</strong> below.
              </p>

              <hr className="border-gray-100" />

              {attentionBlocks}

              <button
                onClick={handleNext}
                disabled={!canSubmit}
                className="w-full py-3 px-6 rounded-xl font-medium text-white
                           bg-indigo-600 hover:bg-indigo-700
                           disabled:bg-gray-300 disabled:cursor-not-allowed
                           transition-colors duration-150"
              >
                {submitting
                  ? "Saving..."
                  : currentIndex + 1 >= questionOrder.length
                    ? "Finish"
                    : "Next"}
              </button>
            </div>
            <ProgressBar current={currentIndex} total={totalQuestions} />
          </div>
        </div>
      </>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load question.</div>
      </div>
    );
  }

  const baseName = formatAttributeName(question.base_attribute.name);
  const comparedName = formatAttributeName(question.compared_attribute.name);

  const harmfulBlock = (
    <LikertSlider
      key="harmful_stereotype"
      label="Do you think this association reinforces a harmful stereotype?"
      tickLabels={HARMFUL_TICKS}
      value={harmfulStereotype}
      onChange={setHarmfulStereotype}
    />
  );
  const realismBlock = (
    <ChoiceButtons
      key="realism"
      label="Do you think this pattern is frequent in real-world data?"
      value={realism}
      onChange={setRealism}
    />
  );

  const questionBlocks =
    sliderOrder === "harmful_first"
      ? [harmfulBlock, realismBlock]
      : [realismBlock, harmfulBlock];

  return (
    <>
      <InstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        sliderOrder={sliderOrder}
      />

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-3xl w-full space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-base text-gray-500">
                <span className="font-medium capitalize">{baseName}</span>
                <span>&amp;</span>
                <span className="font-medium capitalize">
                  {comparedName}
                </span>
              </div>

              <button
                onClick={() => setShowInstructions(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400 transition-colors whitespace-nowrap shadow-sm"
                title="View study instructions"
                aria-label="View study instructions"
              >
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold leading-none">?</span>
                Instructions Reminder
              </button>
            </div>

            <p className="text-xl text-gray-800 leading-relaxed">
              In the generated stories, when{" "}
              <strong>{baseName}</strong> is{" "}
              <strong>{question.base_attribute.value.toLowerCase()}</strong>,{" "}
              <strong>{comparedName}</strong> is {" "}
              <strong>{question.compared_attribute.value.toLowerCase()}</strong> {" "} 
              more often than for other <strong>{baseName}</strong> groups.
            </p>

            <hr className="border-gray-100" />

            {questionBlocks}

            <button
              onClick={handleNext}
              disabled={!canSubmit}
              className="w-full py-3 px-6 rounded-xl font-medium text-white
                         bg-indigo-600 hover:bg-indigo-700
                         disabled:bg-gray-300 disabled:cursor-not-allowed
                         transition-colors duration-150"
            >
              {submitting
                ? "Saving..."
                : currentIndex + 1 >= questionOrder.length
                  ? "Finish"
                  : "Next"}
            </button>
          </div>
          <ProgressBar current={currentIndex} total={totalQuestions} />
        </div>
      </div>
    </>
  );
}
