export default function WarningQuotaMonthly() {
  return (
    <div className="group relative flex w-6 h-6 justify-center items-center rounded-md font-bold bg-red-600 text-white">
      <h1>!</h1>

      <div className="pointer-events-none invisible absolute bottom-full left-1/2 mb-2 w-40 -translate-x-1/2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="absolute left-1/2 transform -ml-1 -translate-x-1/2 mb-1 h-25 w-35 px-4 py-3 rounded-md bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="relative left-1/2 -translate-x-1/2 mb-1 h-25 w-35 px-3 py-4 rounded-md bg-rose-100 text-black text-s font-normal opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-red-600 text-lg font-bold text-white">
              !
            </div>
            <h2 className="text-xl font-semibold">Warning</h2>
          </div>
          <p className="text-md text-gray-900 leading-tight">Meal quota not met</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-t-8 border-x-transparent border-t-rose-50"></div>
        </div>
      </div>
    </div>
  );
}
