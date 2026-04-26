"use client";

import { UserPerms } from "./IndividualPermission";
import { useState } from "react";
import DeleteUserButton from "./DeleteUserButton";
import DeleteUserTag from "./DeleteUserTag";

type Props = {
  selectedUsers: UserPerms[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<UserPerms[]>>;
  onBulkDelete: () => void;
};

export default function PermissionsPopUp({ selectedUsers, setSelectedUsers, onBulkDelete }: Props) {
  const removeUser = (id: string) => {
    const updatedList = selectedUsers.filter((user) => user._id !== id);
    setSelectedUsers(updatedList);
  };
  return (
    <div className="fixed flex items-center justify-between bottom-0 w-full px-15 h-25 bg-white shadow-sm rounded-t-3xl border-gray-200 border-2">
      <div className="flex items-center gap-2">
        <h3>Selected:</h3>
        {selectedUsers.map((u) => (
          <DeleteUserTag key={u._id} user={u} onDelete={() => removeUser(u._id)} />
        ))}
      </div>
      <DeleteUserButton onClick={onBulkDelete} />
    </div>
  );
}
