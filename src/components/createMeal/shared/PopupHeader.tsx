import { Save, Trash2 } from "lucide-react";

type Props = {
  editMode: boolean;
  publishText: string;
  onDelete: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  disabled?: boolean;
};

export function PopupHeader({ editMode, publishText, onDelete, onSaveDraft, onPublish, disabled }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {/* only show trash option if we are editing */}
        {editMode === true && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-radish-200 bg-radish-100 text-radish-900 transition hover:bg-radish-200 disabled:cursor-not-allowed disabled:opacity-50"
            title={"Delete recipe"}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full border border-radish-200 bg-white px-4 py-2 text-sm font-semibold text-radish-900 transition hover:bg-radish-100 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Save as Draft
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-radish-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-radish-800 disabled:opacity-50"
        >
          {publishText}
        </button>
      </div>
    </div>
  );
}
