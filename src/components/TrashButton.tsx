import React from "react";

type TrashButtonProps = {
  recipeId?: string | null;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  confirm?: boolean;
};

export function TrashButton({ recipeId, onSuccess, onError, disabled, confirm = true }: TrashButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <button
      type="button"
      disabled={disabled || isLoading || !recipeId}
      onClick={async () => {
        if (!recipeId) return;

        if (confirm) {
          const ok = window.confirm("Delete this recipe? This can’t be undone.");
          if (!ok) return;
        }

        try {
          setIsLoading(true);

          const res = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `Delete failed (${res.status})`);
          }

          onSuccess?.();
        } catch (e: any) {
          onError?.(e?.message ?? "Delete failed");
        } finally {
          setIsLoading(false);
        }
      }}
      aria-label="Delete recipe"
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #b00020",
        fontWeight: 700,
      }}
    >
      {isLoading ? "Deleting..." : "🗑️"}
    </button>
  );
}
