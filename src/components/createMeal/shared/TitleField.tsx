type Props = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function TitleField({ label, value, placeholder, onChange }: Props) {
  return (
    <div className="mt-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-montserrat font-semibold text-pepper">{label}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-pepper/20 px-3 py-2 font-montserrat text-pepper outline-none focus:border-pepper/50"
        />
      </label>
    </div>
  );
}
