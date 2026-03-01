"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import type { LucideIcon } from "lucide-react";

export type CreateFilterType = {
  id: string;
  label: string;
};

type CreateFilterPopUpProps = {
  open: boolean;
  onClose: () => void;
  filterType: CreateFilterType | null;
};

export default function CreateFilterPopUp({ open, onClose, filterType }: CreateFilterPopUpProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50
                   data-closed:opacity-0
                   data-enter:duration-200
                   data-leave:duration-150"
      />

      {/* Centered Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-lg bg-white p-6
                     data-closed:scale-95 data-closed:opacity-0
                     data-enter:duration-200
                     data-leave:duration-150"
        >
          <div className="mt-4 text-base font-montserrat text-pepper">This is a dummy CreateRecipePopUp.</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
