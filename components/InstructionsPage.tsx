"use client";

import { useEffect } from "react";
import { getSliderOrderForParticipant } from "@/lib/likert-order";
import InstructionsContent from "./InstructionsContent";

interface InstructionsPageProps {
  participantId: string;
  step: 1 | 2;
  onContinue: () => void;
}

const STEP_CONFIG = {
  1: {
    title: "Study Instructions",
    subtitle: "Please read the following before starting.",
    sections: ["context", "task"] as const,
    buttonLabel: "Next",
  },
  2: {
    title: "Socio-demographic Attributes",
    subtitle: "Here are the attributes and values you will encounter in the study.",
    sections: ["attributes"] as const,
    buttonLabel: "Begin Study",
  },
};

export default function InstructionsPage({
  participantId,
  step,
  onContinue,
}: InstructionsPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const config = STEP_CONFIG[step];
  const sliderOrder = getSliderOrderForParticipant(participantId);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {config.title}
          </h1>
          <span className="text-sm text-gray-400 font-medium">
            {step} / 2
          </span>
        </div>
        <p className="text-gray-500 mb-8">
          {config.subtitle}
        </p>

        <InstructionsContent
          sections={[...config.sections]}
          sliderOrder={sliderOrder}
        />

        {step === 2 && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <p className="font-semibold">Attention!</p>
            <p className="mt-1">
              Before starting the experiment you will be asked to complete a comprehension
              check based on the instructions, failure to respond to these questions will
              first result in going through the instructions again and if you fail the
              second time you will be excluded from the experiment.
            </p>
          </div>
        )}

        <button
          onClick={onContinue}
          className="w-full mt-8 py-3 px-6 rounded-xl font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700
                     transition-colors duration-150"
        >
          {config.buttonLabel}
        </button>
      </div>
    </div>
  );
}
