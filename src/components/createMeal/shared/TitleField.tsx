type Props = {
  label: string;
  value: string;
  placeholder?: string;
  error: string;
  onChange: (value: string) => void;
  setError: (value: string) => void;
};

export function TitleField({ label, value, placeholder, error, onChange, setError }: Props) {
  return (
    <div className="mt-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-montserrat font-semibold text-pepper">
          {label} <span className="text-radish-900">*</span>
        </span>

        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);

            if (error) {
              setError("");
            }
          }}
          placeholder="e.g. Chicken Alfredo"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "name-error" : undefined}
          className={`w-full rounded-md border px-3 py-2 font-montserrat text-pepper outline-none ${
            error
              ? "border-radish-900 focus:border-radish-900 focus:ring-2 focus:ring-radish-200"
              : "border-pepper/20 focus:border-pepper/50"
          }`}
        />

        {error && (
          <p id="name-error" className="text-sm font-montserrat text-radish-900">
            {error}
          </p>
        )}
      </label>
    </div>
  );
}
