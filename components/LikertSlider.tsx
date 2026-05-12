"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";

interface LikertSliderProps {
  label: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  tickLabels?: [string, string, string, string, string];
  value: number | null;
  onChange: (val: number) => void;
}

export default function LikertSlider({
  label,
  leftLabel,
  rightLabel,
  tickLabels,
  value,
  onChange,
}: LikertSliderProps) {
  const [touched, setTouched] = useState(false);
  const steps = [1, 2, 3, 4, 5];

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setTouched(true);
    onChange(parseInt(e.target.value, 10));
  }

  function handleTickClick(val: number) {
    setTouched(true);
    onChange(val);
  }

  const showValue = touched && value != null;
  const showOuterLabels = !tickLabels && (leftLabel || rightLabel);

  return (
    <div className="w-full">
      <p className="text-base font-semibold text-gray-800 mb-4">{label}</p>

      <div className="relative px-2 flex flex-col">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value ?? 3}
          onChange={handleChange}
          onPointerDown={() => {
            if (!touched) {
              setTouched(true);
              onChange(value ?? 3);
            }
          }}
          className={`w-full h-2 rounded-full appearance-none cursor-pointer mb-0
                      bg-gray-200 accent-indigo-600
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-white
                      [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:duration-150
                      ${
                        touched
                          ? "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-600"
                          : "[&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:opacity-0"
                      }
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:border-2
                      [&::-moz-range-thumb]:border-white
                      [&::-moz-range-thumb]:shadow-md
                      ${
                        touched
                          ? "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-indigo-600"
                          : "[&::-moz-range-thumb]:w-0 [&::-moz-range-thumb]:h-0 [&::-moz-range-thumb]:opacity-0"
                      }`}
        />

        <div
          className={`relative mx-[10px] ${tickLabels ? "h-12" : "h-7"}`}
        >
          {steps.map((s, idx) => {
            const tickLabel = tickLabels?.[idx];
            const leftPercent = (idx / (steps.length - 1)) * 100;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleTickClick(s)}
                style={{ left: `${leftPercent}%` }}
                className="absolute top-2 -translate-x-1/2 flex flex-col items-center gap-1 group cursor-pointer w-[80px]"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    showValue && value === s
                      ? "bg-indigo-600"
                      : "bg-gray-300 group-hover:bg-gray-400"
                  }`}
                />
                {tickLabel ? (
                  <span
                    className={`text-[11px] leading-tight font-medium text-center transition-colors ${
                      showValue && value === s
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }`}
                  >
                    {tickLabel}
                  </span>
                ) : (
                  <span
                    className={`text-xs font-medium transition-colors ${
                      showValue && value === s
                        ? "text-indigo-600"
                        : "text-gray-400"
                    }`}
                  >
                    {s}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showOuterLabels && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 max-w-[40%]">
              {leftLabel}
            </span>
            <span className="text-xs text-gray-500 max-w-[40%] text-right">
              {rightLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
