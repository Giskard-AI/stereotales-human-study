"use client";

import { useState, useEffect } from "react";
import { submitQuiz } from "@/app/actions";

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; label: string }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the source of the associations you will evaluate?",
    options: [
      { id: "a", label: "Real-world census data" },
      { id: "b", label: "AI-generated written stories" },
      { id: "c", label: "Academic research papers" },
      { id: "d", label: "Social media posts" },
    ],
  },
  {
    id: "q2",
    question:
      "Which of the following best matches the definition of a harmful stereotype used in this study?",
    options: [
      {
        id: "a",
        label:
          "A widely held, oversimplified belief about a social group that could contribute to prejudice, discrimination, or negative treatment of that group.",
      },
      {
        id: "b",
        label:
          "Any statistical association between two attributes observed in real data.",
      },
      {
        id: "c",
        label:
          "Only associations that are openly insulting toward a social group.",
      },
    ],
  },
  {
    id: "q3",
    question:
      "How should you answer the two questions for each association?",
    options: [
      {
        id: "a",
        label:
          "The two questions measure independent dimensions: a pattern that is frequent in real-world data can still reinforce a harmful stereotype, and vice versa.",
      },
      {
        id: "b",
        label:
          "A pattern that is frequent in real-world data cannot reinforce a harmful stereotype.",
      },
      {
        id: "c",
        label:
          "The two questions always give the same answer; they are just worded differently.",
      },
    ],
  },
];

interface QuizPageProps {
  participantId: string;
  onPass: () => void;
  onFail: (quizFailCount: number) => void;
}

export default function QuizPage({ participantId, onPass, onFail }: QuizPageProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] != null);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const { passed, quiz_fail_count } = await submitQuiz(participantId, answers);
      if (passed) {
        onPass();
      } else {
        onFail(quiz_fail_count);
      }
    } catch {
      alert("Failed to submit quiz. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Comprehension Check
        </h1>
        <p className="text-gray-500 mb-8">
          Please answer the following questions to confirm you understood the instructions.
        </p>

        <div className="space-y-8">
          {QUESTIONS.map((q, qi) => (
            <div key={q.id}>
              <p className="font-medium text-gray-900 mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                      }
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors duration-150 text-sm ${
                        selected
                          ? "border-indigo-400 bg-indigo-50 text-indigo-900"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {opt.id.toUpperCase()})
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="w-full mt-8 py-3 px-6 rounded-xl font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors duration-150"
        >
          {submitting ? "Checking..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
