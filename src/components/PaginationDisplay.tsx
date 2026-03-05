"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export default function PaginationDisplay({ currentPage, totalPages, onPageChange, disabled = false }: Props) {
  const safeTotalPages = useMemo(() => Math.max(1, totalPages), [totalPages]);
  const [inputValue, setInputValue] = useState(String(currentPage));

  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const clampPage = (value: number) => {
    if (!Number.isFinite(value)) return currentPage;
    if (value < 1) return 1;
    if (value > safeTotalPages) return safeTotalPages;
    return value;
  };

  const commitInput = () => {
    const parsedValue = Number.parseInt(inputValue.trim(), 10);
    const nextPage = clampPage(parsedValue);
    setInputValue(String(nextPage));

    if (nextPage !== currentPage) {
      onPageChange(nextPage);
    }
  };

  const goToPrevious = () => {
    if (currentPage <= 1) return;
    onPageChange(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage >= safeTotalPages) return;
    onPageChange(currentPage + 1);
  };

  const leftDisabled = disabled || currentPage <= 1;
  const rightDisabled = disabled || currentPage >= safeTotalPages;

  return (
    <div className="flex items-center gap-2 text-dark-gray">
      <button
        type="button"
        onClick={goToPrevious}
        disabled={leftDisabled}
        className="h-10 w-10 flex items-center justify-center cursor-pointer enabled:hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <div className="text-3xl leading-none text-gray-500">{`\u2039`}</div>
      </button>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={safeTotalPages}
          value={inputValue}
          disabled={disabled}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={commitInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitInput();
            }
          }}
          className="h-9 w-9 rounded-md border border-black-200 bg-white text-sm leading-none font-normal text-center text-black outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-60"
        />
        <div className="text-m font-normal leading-none text-black">of {safeTotalPages}</div>
      </div>

      <button
        type="button"
        onClick={goToNext}
        disabled={rightDisabled}
        className="h-10 w-10 flex items-center justify-center cursor-pointer enabled:hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <div className="text-3xl leading-none text-gray-500">{`\u203A`}</div>
      </button>
    </div>
  );
}
