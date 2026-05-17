export default function CurrentDateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-md border-2 border-radish-900 px-3 py-1 text-sm font-semibold text-radish-900 sm:px-4 sm:text-base"
    >
      Today
    </button>
  );
}
