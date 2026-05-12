"use client";

import { useEffect, useState } from "react";
import { getRedirectUrl } from "@/app/actions";

export default function CompletedPage() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    getRedirectUrl()
      .then((url) => setRedirectUrl(url))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!redirectUrl) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">&#10003;</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Study Complete
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your participation! Your responses have been recorded.
        </p>
        {redirectUrl && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Redirecting in {countdown} second{countdown !== 1 && "s"}...
            </p>
            <a
              href={redirectUrl}
              className="inline-block text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Continue now
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
