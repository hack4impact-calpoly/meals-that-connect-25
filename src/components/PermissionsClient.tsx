"use client";

import { useState } from "react";
import { UserPerms } from "@/components/IndividualPermission";
import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";
import EditPermissionsButton from "@/components/EditPermissionsButton";
import PermissionsPopUp from "@/components/PermissionsPopUp";

type Props = {
  allUsers: UserPerms[];
};

export default function PermissionsClient({ allUsers }: Props) {
  const [usersList, setUsersList] = useState<UserPerms[]>(allUsers);
  const [selectedUsers, setSelectedUsers] = useState<UserPerms[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleBulkDelete = () => {
    const selectedIds = selectedUsers.map((u) => u._id);
    const updatedList = usersList.filter((user) => !selectedIds.includes(user._id));

    setUsersList(updatedList);
    setSelectedUsers([]);
    setIsEditing(false);
    setShowDeleteModal(false);
  };

  return (
    <main>
      <div className="flex flex-col py-5 gap-4 px-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Manage Permissions</h1>
          <EditPermissionsButton
            isEditing={isEditing}
            onClick={() => {
              if (isEditing) setSelectedUsers([]);
              setIsEditing(!isEditing);
            }}
          />
        </div>

        <div className="flex justify-between">
          <div className="w-350 bg-white text-black border">insert search bar here</div>
          <SortPermissionsButton align="right" />
        </div>

        <div>
          <PermissionsDisplay
            users={usersList}
            editing={isEditing}
            onSelect={toggleUserSelection}
            selectedIds={selectedUsers.map((u) => u._id)}
          />
        </div>
      </div>
      {isEditing && (
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
    </main>
  );
}
