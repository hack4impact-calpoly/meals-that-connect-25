"use client";

import Image from "next/image";

export type UserPerms = {
  _id: string;
  name: string;
  avatarUrl?: string;
  role: string;
};

const ROLES = ["Admin", "Dining Site Staff", "Kitchen Staff"];

export default function IndividualPermission({
  user,
  editing = false,
  isSelected,
  onSelect,
  onRoleChange,
}: {
  user: UserPerms;
  editing?: boolean;
  isSelected: boolean;
  onSelect: (user: UserPerms) => void;
  onRoleChange: (userId: string, newRole: string) => void;
}) {
  const handleRowClick = () => {
    if (editing) onSelect(user);
  };

  const roleSelect = (className = "") => (
    <select
      value={user.role}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onRoleChange(user._id, e.target.value)}
      className={`max-w-full cursor-pointer rounded-lg border-none bg-radish-100 px-3 py-2 text-sm font-medium ${className}`}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );

  const selectionCheckbox = (className = "") => (
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => {
        e.stopPropagation();
        onSelect(user);
      }}
      onClick={(e) => e.stopPropagation()}
      className={`h-5 w-5 cursor-pointer rounded accent-radish-900 ${className}`}
    />
  );

  return (
    <div
      onClick={handleRowClick}
      className={`rounded-lg border-2 bg-white p-4 shadow-sm transition-colors font-montserrat md:grid md:grid-cols-12 md:items-center md:py-5 md:pl-8 md:pr-6 ${
        isSelected && editing ? "border-radish-900" : "border-gray-200"
      } ${editing ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start gap-3 md:contents">
        {/* Avatar */}
        <div className="md:col-span-1">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-radish-500 bg-gray-100 md:h-14 md:w-14">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" fill sizes="(min-width: 768px) 56px, 48px" className="object-cover" />
            ) : null}
          </div>
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1 md:col-span-4 md:justify-self-start" title={user.name}>
          <div className="truncate text-base font-semibold md:text-xl">{user.name}</div>
          <div className="mt-2 flex min-w-0 items-center gap-2 md:hidden">
            <span className="shrink-0 text-xs font-semibold uppercase text-dark-gray">Role</span>
            {editing ? (
              roleSelect("min-w-0 flex-1")
            ) : (
              <span className="min-w-0 truncate rounded-full bg-light-gray px-3 py-1 text-sm">{user.role}</span>
            )}
          </div>
        </div>

        <div className="md:hidden">{editing ? selectionCheckbox("mt-3") : null}</div>
      </div>

      <div className="hidden md:col-span-5 md:block"></div>

      {/* Role */}
      <div className="hidden md:col-span-1 md:block">
        {editing ? (
          roleSelect("justify-self-center")
        ) : (
          <div className="justify-self-center text-center">{user.role}</div>
        )}
      </div>

      {/* Checkbox */}
      <div className="hidden md:col-span-1 md:block md:justify-self-end">
        {editing ? <div className="justify-self-center">{selectionCheckbox()}</div> : <div />}
      </div>
    </div>
  );
}
