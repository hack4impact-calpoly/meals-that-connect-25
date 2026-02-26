"use client";

import { useState } from "react";
import Image from "next/image";

export type UserPerms = {
  _id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  recipe: boolean;
  menuPlanning: boolean;
};

const ROLES = ["Admin", "Dining Site Staff", "Kitchen Staff"];

export default function IndividualPermission({ user, editing = false }: { user: UserPerms; editing?: boolean }) {
  const [selected, setSelected] = useState(false);
  const [role, setRole] = useState(user.role);
  const [recipe, setRecipe] = useState(user.recipe);
  const [menuPlanning, setMenuPlanning] = useState(user.menuPlanning);
  return (
    <div
      className={`grid grid-cols-subgrid col-span-6 items-center rounded-lg border-2 bg-white pl-8 pr-6 py-5 shadow-sm transition-colors font-montserrat ${
        selected ? "border-radish-900" : "border-gray-200"
      }`}
    >
      {/* Avatar */}
      <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-radish-500 bg-gray-100 shrink-0">
        {user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="56px" className="object-cover" /> : null}
      </div>
      {/* Name */}
      <div className="justify-self-start max-w-full truncate font-semibold text-xl" title={user.name}>
        {user.name}
      </div>
      {/* Role */}
      {editing ? (
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="justify-self-center rounded-lg bg-radish-100 px-3 py-2 text-sm font-medium border-none cursor-pointer"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      ) : (
        <div className="justify-self-center text-center">{role}</div>
      )}
      {/* Recipe */}
      {editing ? (
        <select
          value={recipe ? "Yes" : "No"}
          onChange={(e) => setRecipe(e.target.value === "Yes")}
          className="justify-self-center rounded-lg bg-medium-gray px-3 py-2 text-sm font-medium border-none cursor-pointer"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ) : (
        <div className="justify-self-center text-center">{recipe ? "Yes" : "No"}</div>
      )}
      {/* Menu Planning */}
      {editing ? (
        <select
          value={menuPlanning ? "Yes" : "No"}
          onChange={(e) => setMenuPlanning(e.target.value === "Yes")}
          className="justify-self-center rounded-lg bg-medium-gray px-3 py-2 text-sm font-medium border-none cursor-pointer"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ) : (
        <div className="justify-self-center text-center">{menuPlanning ? "Yes" : "No"}</div>
      )}
      {/* Checkbox */}
      {editing ? (
        <div className="justify-self-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => setSelected(e.target.checked)}
            className="h-5 w-5 rounded cursor-pointer accent-radish-900"
          />
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
