import { useUser } from "@clerk/nextjs";
import IndividualPermission, { UserPerms } from "./IndividualPermission";

type Props = {
  users: UserPerms[];
  editing?: boolean;
  onSelect: (user: UserPerms) => void;
  selectedIds: string[];
  onRoleChange: (userId: string, newRole: string) => void;
};

export default function PermissionsDisplay({ users, editing = false, onSelect, selectedIds, onRoleChange }: Props) {
  const { user: currentUser } = useUser();
  const otherUsers = users.filter((u) => u._id !== currentUser?.id);

  return (
    <div className="flex flex-col gap-y-3 pt-2 text-black font-montserrat">
      {/* Header */}
      <div className="hidden w-full grid-cols-12 items-center pl-8 pr-6 text-sm font-semibold justify-items-center md:grid">
        <div className="col-span-1"></div>

        <div className="col-span-4 justify-self-start">NAME</div>

        <div className="col-span-5"></div>

        <div className="col-span-1">ROLE</div>

        <div className="col-span-1"></div>
      </div>
      {/* Rows */}
      {otherUsers.length > 0 ? (
        otherUsers.map((u) => (
          <IndividualPermission
            key={u._id}
            user={u}
            editing={editing}
            onSelect={() => onSelect(u)}
            isSelected={selectedIds.includes(u._id)}
            onRoleChange={onRoleChange}
          />
        ))
      ) : (
        <div className="rounded-lg border border-medium-gray bg-white px-4 py-6 text-center text-sm text-pepper">
          No users found.
        </div>
      )}
    </div>
  );
}
