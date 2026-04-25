"use client";

import { CircleX } from "lucide-react";
import { useState } from "react";

export default function DeleteUserTag({ user, onDelete }: { user: any; onDelete: () => void }) {
  return (
    <div
      onClick={onDelete}
      className="inline-flex items-center rounded-3xl bg-neutral-700 text-white py-2 px-3 gap-1 cursor-pointer"
    >
      <CircleX size={15} className="flex-shrink-0" />
      <p className="text-sm leading-none">{user.name}</p>
    </div>
  );
}
