"use client";

import { useState } from "react";
import { consent } from "@/app/actions";

interface ConsentPageProps {
  participantId: string;
  onConsentDone: (order: string[]) => void;
}

export default function ConsentPage({
  participantId,
  onConsentDone,
}: ConsentPageProps) {
  const [checks, setChecks] = useState({
    read: false,
    voluntary: false,
    data: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const allChecked = checks.read && checks.voluntary && checks.data;

  function toggle(key: keyof typeof checks) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleStart() {
    setSubmitting(true);
    try {
      const data = await consent(participantId);
      onConsentDone(data.question_order);
    } catch {
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Consent Form</h1>
        <p className="text-gray-500 mb-8">Information for the Participant</p>

        <div className="space-y-6 text-gray-700 text-[15px] leading-relaxed mb-8">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">
              General Information
            </h2>
            <p>
              You are about to participate in a research study conducted by{" "}
              <strong>Giskard AI</strong>, a company specializing in LLM safety
              and AI quality assurance.
            </p>
            <p className="mt-2">
              This study aims to investigate how people perceive stereotypical
              associations in text. The results will contribute to improving bias
              detection and fairness evaluation in large language models. The
              study has no immediate commercial application and is conducted for
              research purposes only.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Procedure</h2>
            <p>
              You will be asked to read a series of statements and answer two
              simple questions about each one, using rating scales. No particular
              expertise is required. Your internet-based participation will take
              approximately 15&ndash;20 minutes.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">
              Voluntary Participation and Confidentiality
            </h2>
            <p>
              Your participation in this study is voluntary. This means that you
              are consenting to participate without external pressure. During
              your participation, the researchers will collect and record
              information. In order to preserve your identity and the
              confidentiality of the data, the identification of each response
              will be coded, thus preserving the anonymity of your answers. We
              will not collect any personal data on the Prolific platform. The
              data will only be used for research purposes in order to answer the
              scientific objectives of the project. The data may be published in
              scientific journals and shared within the scientific community, in
              which case no publication or scientific communication will contain
              identifying information.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Contact</h2>
            <p>
              If you have any questions about this study, please contact us at{" "}
              <a
                href="mailto:phare@giskard.ai"
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                phare@giskard.ai
              </a>
            </p>
          </section>
        </div>

        <hr className="border-gray-200 mb-6" />

        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checks.read}
              onChange={() => toggle("read")}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">
              I have read and understood the information above.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checks.voluntary}
              onChange={() => toggle("voluntary")}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">
              I understand that my participation is voluntary and I am free to
              withdraw at any time without giving a reason.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checks.data}
              onChange={() => toggle("data")}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">
              I understand that my data will be kept confidential and I can stop
              at any time without justification.
            </span>
          </label>
        </div>

        <button
          onClick={handleStart}
          disabled={!allChecked || submitting}
          className="w-full py-3 px-6 rounded-xl font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors duration-150"
        >
          {submitting ? "Starting..." : "Start Study"}
        </button>
      </div>
    </div>
  );
}
