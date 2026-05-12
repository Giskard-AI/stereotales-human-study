"use client";

interface QuizFirstFailPageProps {
  onReturnToInstructions: () => void;
}

export default function QuizFirstFailPage({
  onReturnToInstructions,
}: QuizFirstFailPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">&#9888;</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Comprehension Check Not Passed
        </h1>
        <p className="text-gray-600 mb-6">
          One or more answers were incorrect. You may review the instructions and
          try the comprehension check one more time. If you fail again you will be
          considered ineligible for the study.
        </p>
        <button
          onClick={onReturnToInstructions}
          className="w-full py-3 px-6 rounded-xl font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700
                     transition-colors duration-150"
        >
          Return to Instructions
        </button>
      </div>
    </div>
  );
}
