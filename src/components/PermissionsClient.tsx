"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { UserPerms } from "@/components/IndividualPermission";
import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";
import EditPermissionsButton from "@/components/EditPermissionsButton";
import PermissionsPopUp from "@/components/PermissionsPopUp";
import SearchBarClient from "@/components/SearchbarClient";
import PaginationDisplay from "@/components/PaginationDisplay";
import { SortOption, USER_ROLES, UserRole } from "@/lib/types";
import RoleToggle from "./RoleToggle";

const PAGE_SIZE = 5;

export default function PermissionsClient() {
  const { user: clerkUser } = useUser();
  const currentClerkId = clerkUser?.id;

  const [usersList, setUsersList] = useState<UserPerms[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserPerms[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Set<UserRole>>(new Set<UserRole>());
  const [sortOption, setSortOption] = useState<SortOption>("createdDate");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        setIsLoading(true);

        const parsed = search.trim();

        const params = new URLSearchParams();

        if (parsed) {
          params.append("name", parsed);
        }

        selectedRole.forEach((role) => {
          params.append("role", role);
        });

        params.append("sortBy", sortOption);
        params.append("page", currentPage.toString());
        params.append("limit", PAGE_SIZE.toString());

        const res = await fetch(`/api/users?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const result = await res.json();

        const fetched: UserPerms[] = result.data ?? [];
        const withoutSelf = currentClerkId ? fetched.filter((user) => user.clerkId !== currentClerkId) : fetched;

        setUsersList(withoutSelf);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Error fetching users:", err);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => controller.abort();
  }, [search, selectedRole, sortOption, currentPage, currentClerkId]);

  const visibleUsers = useMemo(() => {
    if (!currentClerkId) return usersList;
    return usersList.filter((user) => user.clerkId !== currentClerkId);
  }, [usersList, currentClerkId]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRole((prev) => {
      const next = new Set<UserRole>(prev);

      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }

      return next;
    });

    setCurrentPage(1);
  };

  const toggleUserSelection = (user: UserPerms) => {
    setSelectedUsers((prev) => {
      const isAlreadySelected = prev.find((u) => u._id === user._id);
      if (isAlreadySelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedUsers.map((user) => {
        return fetch(`/api/users/${user._id}`, {
          method: "DELETE",
        });
      });
      await Promise.all(deletePromises);
      const selectedIds = selectedUsers.map((u) => u._id);
      const updatedList = usersList.filter((user) => !selectedIds.includes(user._id));

      setUsersList(updatedList);
      setSelectedUsers([]);
      setIsEditing(false);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting user from calendar:", err);
    }
  };

  const handleSave = async () => {
    try {
      const updatePromises = usersList.map((user) => {
        return fetch(`/api/users/${user._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: user.role }),
        });
      });
      await Promise.all(updatePromises);

      setSelectedUsers([]);
      setIsEditing(false);
      setShowSaveModal(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Something went wrong while saving.");
    }
  };

  const handleLocalRoleChange = (userId: string, newRole: string) => {
    setUsersList((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
  };

  return (
    <main className="flex flex-col min-h-0 flex-1">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:px-10 overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold sm:text-xl">Manage Permissions</h1>
          <EditPermissionsButton
            isEditing={isEditing}
            onClick={() => {
              if (isEditing) {
                setShowSaveModal(true);
              } else {
                setIsEditing(true);
              }
            }}
          />
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <SearchBarClient placeholder="Search a user" onSearch={handleSearch} />{" "}
          <SortPermissionsButton align="right" activeType={sortOption} onSortChange={handleSortChange} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <RoleToggle options={[...USER_ROLES]} selectedRoles={selectedRole} onToggle={toggleRole} />

          <PaginationDisplay
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col overflow-auto">
          <PermissionsDisplay
            users={visibleUsers}
            editing={isEditing}
            onSelect={toggleUserSelection}
            selectedIds={selectedUsers.map((u) => u._id)}
            onRoleChange={handleLocalRoleChange}
          />
        </div>

        {isEditing && selectedUsers.length > 0 && <div className="h-36 sm:h-24"></div>}
      </div>

      {isEditing && selectedUsers.length > 0 && (
        <div className="flex flex-col overflow-auto">
          <PermissionsPopUp
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            onBulkDelete={() => setShowDeleteModal(true)}
          />
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 rounded-base">
          <div className="relative p-4 w-full max-w-md">
            <div className="bg-white relative bg-neutral-primary-soft rounded-lg shadow-sm p-4 md:p-6">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 flex items-center justify-center cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>

              <h3 className="text-lg font-semibold text-heading">Delete user?</h3>

              <p className="text-sm text-body mt-2">This action cannot be undone.</p>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  className="px-4 py-2 rounded-lg text-white bg-dark-gray hover:bg-medium-gray cursor-pointer"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 text-white hover:bg-radish-500 bg-radish-900 rounded-lg cursor-pointer"
                  onClick={handleBulkDelete}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 rounded-base">
          <div className="relative p-4 w-full max-w-md">
            <div className="bg-white relative bg-neutral-primary-soft rounded-lg shadow-sm p-4 md:p-6">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 flex items-center justify-center cursor-pointer"
                onClick={() => setShowSaveModal(false)}
              >
                ✕
              </button>

              <h3 className="text-lg font-semibold text-heading">Save changes?</h3>

              <p className="text-sm text-body mt-2">This action cannot be undone.</p>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  className="px-4 py-2 rounded-lg text-white bg-dark-gray hover:bg-medium-gray cursor-pointer"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 text-white hover:bg-radish-500 bg-radish-900 rounded-lg cursor-pointer"
                  onClick={handleSave}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
