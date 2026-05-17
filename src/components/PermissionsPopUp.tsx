"use client";

import { UserPerms } from "./IndividualPermission";
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
    <div className="fixed bottom-0 left-0 z-40 flex w-full flex-col gap-3 rounded-t-3xl border-2 border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-5 lg:px-16">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <h3 className="shrink-0 font-medium">Selected:</h3>
        <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
          {selectedUsers.map((u) => (
            <DeleteUserTag key={u._id} user={u} onDelete={() => removeUser(u._id)} />
          ))}
        </div>
      </div>
      {<DeleteUserButton onClick={onBulkDelete} />}
    </div>
  );
}
