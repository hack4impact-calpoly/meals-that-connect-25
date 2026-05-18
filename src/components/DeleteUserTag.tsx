"use client";

import { CircleX } from "lucide-react";
import { UserPerms } from "./IndividualPermission";

type Props = {
  user: UserPerms;
  onDelete: () => void;
};

export default function DeleteUserTag({ user, onDelete }: Props) {
  return (
    <div
      onClick={onDelete}
      className="inline-flex max-w-full cursor-pointer items-center gap-1 rounded-3xl bg-neutral-700 px-3 py-2 text-white"
    >
      <CircleX size={12} className="flex-shrink-0" />
      <p className="max-w-[9rem] truncate text-sm leading-none sm:max-w-[13rem]">{user.name}</p>
    </div>
  );
}
