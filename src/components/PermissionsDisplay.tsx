import IndividualPermission, { UserPerms } from "./IndividualPermission";

type Props = {
  users: UserPerms[];
  editing?: boolean;
  onSelect: (user: UserPerms) => void;
  selectedIds: string[];
  onRoleChange: (userId: string, newRole: string) => void;
};

export default function PermissionsDisplay({ users, editing = false, onSelect, selectedIds, onRoleChange }: Props) {
  return (
    <div className="flex flex-col gap-y-3 pt-2 text-black font-montserrat">
      {/* Header */}
      <div className="grid grid-cols-12 w-full items-center pl-8 pr-6 text-sm font-semibold justify-items-center">
        <div className="col-span-1"></div>

        <div className="col-span-4 justify-self-start">NAME</div>

        <div className="col-span-5"></div>

        <div className="col-span-1">ROLE</div>

        <div className="col-span-1"></div>
      </div>
      {/* Rows */}
      {users.map((u) => (
        <IndividualPermission
          key={u._id}
          user={u}
          editing={editing}
          onSelect={() => onSelect(u)}
          isSelected={selectedIds.includes(u._id)}
          onRoleChange={onRoleChange}
        />
      ))}
    </div>
  );
}
