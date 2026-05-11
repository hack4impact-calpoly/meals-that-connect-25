"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBarClient from "@/components/SearchbarClient";
import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";
import PaginationDisplay from "@/components/PaginationDisplay";
import PillToggle from "@/components/PillToggle";
import { USER_ROLES, type UserRole } from "@/lib/types";
import { UserPerms } from "@/components/IndividualPermission";

interface PermissionsClientProps {
  users: UserPerms[];
}

const PAGE_SIZE = 5;

export default function PermissionsClient({ users }: PermissionsClientProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(new Set());

  /* TODO: Delete this local filtering/pagination once permissions are fetched from the API.
   * Eventually the API should receive: search, selectedRoles, currentPage, PAGE_SIZE.
   */
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = user.name.toLowerCase();
      const matchesSearch = !query || name.includes(query) || name.split(" ").some((part) => part.includes(query));

      const matchesRole = selectedRoles.size === 0 || selectedRoles.has(user.role as UserRole);

      return matchesSearch && matchesRole;
    });
  }, [search, selectedRoles, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);
  /* End temporary local filtering/pagination */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRoles]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);

      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }

      return next;
    });
  };

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center gap-3">
        <SearchBarClient placeholder="Search a user" onSearch={setSearch} />
        <SortPermissionsButton align="right" />
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <PillToggle
          options={USER_ROLES.map((role) => ({
            value: role,
            label: role,
          }))}
          selectedValues={selectedRoles}
          onToggle={toggleRole}
        />

        <PaginationDisplay
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={false}
        />
      </div>

      <PermissionsDisplay users={paginatedUsers} editing={true} />
    </div>
  );
}
