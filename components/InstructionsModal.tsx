"use client";

import { useEffect, useRef } from "react";
import type { SliderOrder } from "@/lib/likert-order";
import InstructionsContent from "./InstructionsContent";

interface InstructionsModalProps {
  open: boolean;
  onClose: () => void;
  sliderOrder: SliderOrder;
}

export default function InstructionsModal({
  open,
  onClose,
  sliderOrder,
}: InstructionsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative max-w-3xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Study Instructions
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <InstructionsContent sliderOrder={sliderOrder} />

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 px-6 rounded-xl font-medium text-gray-700
                     bg-gray-100 hover:bg-gray-200
                     transition-colors duration-150"
        >
          Close
        </button>
      </div>
    </div>
  );
}
