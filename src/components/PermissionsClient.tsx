"use client";

import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";
import { RoleValue } from "@/lib/types";
import { useState } from "react";
import CategoryToggle from "./CategoryToggle";

const roleOptions: Array<{ value: RoleValue; label: string }> = [
  { value: "Admin", label: "Admin" },
  { value: "Kitchen Staff", label: "Kitchen Staff" },
];

export default function PermissionsClient() {
  const [selectedRole, setSelectedRole] = useState<Set<RoleValue>>(new Set<RoleValue>());
  const users = [
    {
      _id: "u1",
      name: "Bryan Lai",
      role: "Admin",
      recipe: true,
      menuPlanning: true,
    },
    {
      _id: "u2",
      name: "Bryan Lai",
      role: "Dining Site Staff",
      recipe: true,
      menuPlanning: false,
    },
    {
      _id: "u3",
      name: "Bryan Lai",
      role: "Kitchen Staff",
      recipe: false,
      menuPlanning: false,
    },
  ];

  const toggleRole = (category: RoleValue) => {
    setSelectedRole((prev) => {
      const next = new Set<RoleValue>(prev);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      return next;
    });
  };

  const filteredUsers = users.filter((user) => selectedRole.size === 0 || selectedRole.has(user.role as RoleValue));

  return (
    <main>
      <div className="flex justify-between p-5">
        <CategoryToggle<RoleValue> options={roleOptions} selectedCategories={selectedRole} onToggle={toggleRole} />
        <SortPermissionsButton align="right" />
      </div>
      <div className="p-5">
        <PermissionsDisplay users={filteredUsers} editing={true} />
      </div>
    </main>
  );
}
