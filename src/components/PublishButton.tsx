import React from "react";

type PublishButtonProps<TPayload> = {
  payload: TPayload;
  onSuccess?: (created: any) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function PublishButton<TPayload>({ payload, onSuccess, onError, disabled }: PublishButtonProps<TPayload>) {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={async () => {
        try {
          setIsLoading(true);

          const res = await fetch("/api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `Publish failed (${res.status})`);
          }

          const created = await res.json().catch(() => ({}));
          onSuccess?.(created);
        } catch (e: any) {
          onError?.(e?.message ?? "Publish failed");
        } finally {
          setIsLoading(false);
        }
      }}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #111",
        fontWeight: 700,
      }}
    >
      {isLoading ? "Publishing..." : "Publish"}
    </button>
  );
}
