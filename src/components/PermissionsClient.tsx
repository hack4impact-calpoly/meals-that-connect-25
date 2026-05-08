"use client";

import { useState, useMemo, useEffect } from "react";
import { UserPerms } from "@/components/IndividualPermission";
import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";
import EditPermissionsButton from "@/components/EditPermissionsButton";
import PermissionsPopUp from "@/components/PermissionsPopUp";
import SearchBarClient from "@/components/SearchbarClient";

export default function PermissionsClient() {
  const [usersList, setUsersList] = useState<UserPerms[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserPerms[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // get all existing users
  async function getUsers(): Promise<UserPerms[]> {
    const res = await fetch(`/api/users`);
    if (!res.ok) throw new Error(`Failed to get users`);
    return res.json();
  }

  useEffect(() => {
    const loadAll = async () => {
      const users = await getUsers();
      setUsersList(users);
    };

    loadAll();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return usersList;

    return usersList.filter((user) => {
      const parts = user.name.toLowerCase().split(" ");
      return parts.some((part) => part.includes(query)) || user.name.toLowerCase().includes(query);
    });
  }, [search, usersList]);

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
    <main>
      <div className="flex flex-col py-5 gap-4 px-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Manage Permissions</h1>
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

        <div className="flex items-center gap-3 mb-5">
          <SearchBarClient placeholder="Search a user" onSearch={setSearch} /> <SortPermissionsButton align="right" />
        </div>

        <div>
          <PermissionsDisplay
            users={filteredUsers}
            editing={isEditing}
            onSelect={toggleUserSelection}
            selectedIds={selectedUsers.map((u) => u._id)}
            onRoleChange={handleLocalRoleChange}
          />
        </div>

        {isEditing && selectedUsers.length > 0 && <div className="h-20"></div>}
      </div>
      {isEditing && selectedUsers.length > 0 && (
        <PermissionsPopUp
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          onBulkDelete={() => setShowDeleteModal(true)}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 rounded-base">
          <div className="relative p-4 w-full max-w-md">
            <div className="bg-white relative bg-neutral-primary-soft rounded-lg shadow-sm p-4 md:p-6">
              {/* Close button */}
              <button
                type="button"
                className="absolute top-3 right-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 flex items-center justify-center cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>

              {/* Modal content */}
              <h3 className="text-lg font-semibold text-heading">Delete user?</h3>

              <p className="text-sm text-body mt-2">This action cannot be undone.</p>

              {/* Buttons */}
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
              {/* Close button */}
              <button
                type="button"
                className="absolute top-3 right-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 flex items-center justify-center cursor-pointer"
                onClick={() => setShowSaveModal(false)}
              >
                ✕
              </button>

              {/* Modal content */}
              <h3 className="text-lg font-semibold text-heading">Save changes?</h3>

              <p className="text-sm text-body mt-2">This action cannot be undone.</p>

              {/* Buttons */}
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
