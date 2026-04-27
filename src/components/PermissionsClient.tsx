"use client";

import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton, { CreateSortType } from "@/components/SortPermissionsButton";
import { RoleValue } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import CategoryToggle from "./CategoryToggle";

const roleOptions: Array<{ value: RoleValue; label: string }> = [
  { value: "Admin", label: "Admin" },
  { value: "Kitchen Staff", label: "Kitchen Staff" },
];

export default function PermissionsClient({ users }: { users: any[] }) {
  const [selectedRole, setSelectedRole] = useState<Set<RoleValue>>(new Set<RoleValue>());
  const [sortType, setSortType] = useState<CreateSortType | null>(null);

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

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const isRole = selectedRole.size === 0 || selectedRole.has(user.role as RoleValue);
      return isRole;
    });

    if (!sortType) return filtered;

    let sorted = [...filtered];

    if (sortType.id === "a-to-z") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType.id === "z-to-a") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortType.id === "last-updated") {
      sorted.sort((a, b) => new Date(b.updatedAt.$date).getTime() - new Date(a.updatedAt.$date).getTime());
    } else if (sortType.id === "created-date") {
      sorted.sort((a, b) => new Date(b.createdAt.$date).getTime() - new Date(a.createdAt.$date).getTime());
    }

    return sorted;
  }, [users, selectedRole, sortType]);

  return (
    <main>
      <div className="flex justify-between p-5">
        <CategoryToggle<RoleValue> options={roleOptions} selectedCategories={selectedRole} onToggle={toggleRole} />
        <SortPermissionsButton align="right" onSortChange={setSortType} />
      </div>
      <div className="p-5">
        <PermissionsDisplay users={filteredUsers} editing={true} />
      </div>
    </main>
  );
}
