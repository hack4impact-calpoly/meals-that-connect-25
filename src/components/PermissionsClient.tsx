"use client";

import { useState, useMemo } from "react";
import SearchBarClient from "@/components/SearchbarClient";
import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";
import { UserPerms } from "@/components/IndividualPermission";

interface PermissionsClientProps {
  users: UserPerms[];
}

export default function PermissionsClient({ users }: PermissionsClientProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const parts = user.name.toLowerCase().split(" ");
      return parts.some((part) => part.includes(query)) || user.name.toLowerCase().includes(query);
    });
  }, [search, users]);

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-5">
        <SearchBarClient placeholder="Search a user" onSearch={setSearch} />
        <SortPermissionsButton align="right" />
      </div>
      <PermissionsDisplay users={filteredUsers} editing={true} />
    </div>
  );
}
