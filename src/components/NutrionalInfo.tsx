function NutritionalInfo({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-[92px] rounded-lg border border-pepper/20 bg-white px-2 py-2">
      <div className="flex items-center justify-center gap-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="--"
          className="w-8 bg-transparent text-center text-sm font-montserrat font-semibold text-pepper outline-none"
        />
        <span className="text-sm font-montserrat font-semibold text-pepper/70">{unit}</span>
      </div>

      <div className="mt-1 text-center text-xs font-montserrat font-semibold text-pepper/80">{label}</div>
    </div>
  );
}
export default NutritionalInfo;
