"use client";

import type { ReactNode } from "react";

export type ChoiceValue = "yes" | "no" | "idk";

interface ChoiceButtonsProps {
  label: ReactNode;
  value: ChoiceValue | null;
  onChange: (val: ChoiceValue) => void;
}

const OPTIONS: { id: ChoiceValue; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "idk", label: "I don't know" },
];

export default function ChoiceButtons({
  label,
  value,
  onChange,
}: ChoiceButtonsProps) {
  return (
    <div className="w-full">
      <p className="text-base font-semibold text-gray-800 mb-4">{label}</p>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors duration-150 ${
                selected
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
