"use client";

import { useState } from "react";
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

  return (
    <div
      onClick={handleRowClick}
      className={`grid grid-cols-12 items-center rounded-lg border-2 bg-white pl-8 pr-6 py-5 shadow-sm transition-colors font-montserrat ${
        isSelected && editing ? "border-radish-900" : "border-gray-200"
      }`}
    >
      {/* Avatar */}
      <div className="col-span-1">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-radish-500 bg-gray-100 shrink-0">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="56px" className="object-cover" /> : null}
        </div>
      </div>

      {/* Name */}
      <div className="col-span-4 justify-self-start truncate font-semibold text-xl" title={user.name}>
        {user.name}
      </div>

      <div className="col-span-5"></div>

      {/* Role */}
      <div className="col-span-1">
        {editing ? (
          <select
            value={user.role}
            onChange={(e) => onRoleChange(user._id, e.target.value)}
            className="justify-self-center rounded-lg bg-radish-100 px-3 py-2 text-sm font-medium border-none cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        ) : (
          <div className="justify-self-center text-center">{user.role}</div>
        )}
      </div>

      {/* Checkbox */}
      <div className="col-span-1 justify-self-end">
        {editing ? (
          <div className="justify-self-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(user);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded cursor-pointer accent-radish-900"
            />
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
