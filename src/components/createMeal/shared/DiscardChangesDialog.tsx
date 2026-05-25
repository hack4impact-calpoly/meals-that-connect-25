import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmText: string;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmActionDialog({ open, title, body, confirmText, confirmDisabled, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onCancel} className="relative z-100">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold">{title}</h3>

          <p className="mt-2 text-sm text-gray-600">{body}</p>

          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg bg-gray-200 px-4 py-2" onClick={onCancel}>
              Cancel
            </button>

            <button
              className="rounded-lg bg-radish-900 px-4 py-2 text-white"
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
