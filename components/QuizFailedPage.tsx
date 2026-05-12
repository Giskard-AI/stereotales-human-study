"use client";

export default function QuizFailedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">&#10007;</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Comprehension Check Failed
        </h1>
        <p className="text-gray-600">
          Unfortunately, one or more of your answers were incorrect. You are not
          eligible to participate in this study. Thank you for your time.
        </p>
      </div>
    </div>
  );
}
