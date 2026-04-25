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
  const [selectedUsers, setSelectedUsers] = useState<UserPerms[]>([]);

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

  return (
    <main>
      <div className="flex flex-col py-5 gap-4 px-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Manage Permissions</h1>
          <EditPermissionsButton />
        </div>

        <div className="flex justify-between">
          <div className="w-350 bg-white text-black border">insert search bar here</div>
          <SortPermissionsButton align="right" />
        </div>

        <div>
          <PermissionsDisplay
            users={allUsers}
            editing={true}
            onSelect={toggleUserSelection}
            selectedIds={selectedUsers.map((u) => u._id)}
          />
        </div>
      </div>

      <PermissionsPopUp selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
    </main>
  );
}
