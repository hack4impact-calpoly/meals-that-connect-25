export default function WarningQuotaMonthly() {
  return (
    <div className="group relative flex w-6 h-6 justify-center items-center rounded-md font-bold bg-red-600 text-white">
      <h1>!</h1>
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs font-normal opacity-0 group-hover:opacity-100 transition-opacity">
        Warning: Monthly quota exceeded (insert warning component here)
      </span>
    </div>
  );
}
