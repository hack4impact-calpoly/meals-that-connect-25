import IndividualPermission, { UserPerms } from "./IndividualPermission";

export default function PermissionsDisplay({ users, editing = false }: { users: UserPerms[]; editing?: boolean }) {
  return (
    <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr_auto] gap-x-4 gap-y-3 pt-2 text-black font-montserrat">
      {/* Header */}
      <div className="grid grid-cols-subgrid col-start-2 col-span-4 items-center pl-6 text-sm font-semibold justify-items-center">
        <div className="justify-self-start">NAME</div>
        <div>ROLE</div>
        <div>RECIPE</div>
        <div className="text-center">MENU PLANNING</div>
      </div>
      {/* Rows */}
      {users.map((u) => (
        <IndividualPermission key={u._id} user={u} editing={editing} />
      ))}
    </div>
  );
}
