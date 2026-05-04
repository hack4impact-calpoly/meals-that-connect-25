"use client";

import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton, { CreateSortType } from "@/components/SortPermissionsButton";
import { RoleValue } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import CategoryToggle from "./CategoryToggle";
import SearchBarClient from "@/components/SearchbarClient";
import { User } from "@/lib/types";

const roleOptions: Array<{ value: RoleValue; label: string }> = [
  { value: "Admin", label: "Admin" },
  { value: "Kitchen Staff", label: "Kitchen Staff" },
];

interface PermissionsClientProps {
  users: User[];
}

export default function PermissionsClient({ users }: PermissionsClientProps) {
  const [search, setSearch] = useState("");
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
    const query = search.trim().toLowerCase();

    let roleFilter = users.filter((user) => {
      return selectedRole.size === 0 || selectedRole.has(user.role as RoleValue);
    });

    if (query) {
      roleFilter = roleFilter.filter((user) => {
        const parts = user.name.toLowerCase().split(" ");
        return parts.some((part) => part.includes(query)) || user.name.toLowerCase().includes(query);
      });
    }

    if (sortType) {
      if (sortType.id === "a-to-z") {
        roleFilter.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortType.id === "z-to-a") {
        roleFilter.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortType.id === "last-updated") {
        roleFilter.sort((a, b) => new Date(b.updatedAt.$date).getTime() - new Date(a.updatedAt.$date).getTime());
      } else if (sortType.id === "created-date") {
        roleFilter.sort((a, b) => new Date(b.createdAt.$date).getTime() - new Date(a.createdAt.$date).getTime());
      }
    }

    return roleFilter;
  }, [users, search, selectedRole, sortType]);

  return (
    <main>
      <div className="flex justify-between p-5">
        <SearchBarClient placeholder="Search a user" onSearch={setSearch} />
        <SortPermissionsButton align="right" onSortChange={setSortType} />
      </div>
      <div className="px-5">
        <CategoryToggle<RoleValue> options={roleOptions} selectedCategories={selectedRole} onToggle={toggleRole} />
      </div>
      <div className="p-5">
        <PermissionsDisplay users={filteredUsers} editing={true} />
      </div>
    </main>
  );
}
