import Image from "next/image";

type UserPerms = {
  _id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  recipe: boolean;
  menuPlanning: boolean;
};

export default function PermissionsDisplay({ users }: { users: UserPerms[] }) {
  return (
    <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr] gap-x-4 gap-y-3 pt-2 text-black font-montserrat">
      {/* Header */}
      <div className="grid grid-cols-subgrid col-start-2 col-span-4 items-center pl-6 text-sm font-semibold justify-items-center">
        <div className="justify-self-start">NAME</div>
        <div>ROLE</div>
        <div>RECIPE</div>
        <div className="text-center">MENU PLANNING</div>
      </div>

      {/* Rows */}
      {users.map((u) => (
        <div
          key={u._id}
          className="grid grid-cols-subgrid col-span-5 items-center rounded-lg border border-gray-200 bg-white pl-8 py-5 shadow-sm"
        >
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-radish-900 bg-gray-100">
            {u.avatarUrl ? <Image src={u.avatarUrl} alt="" fill sizes="56px" className="object-cover" /> : null}
          </div>

          <div className="justify-self-start max-w-full truncate font-semibold text-xl" title={u.name}>
            {u.name}
          </div>

          <div className="justify-self-center text-center">{u.role}</div>
          <div className="justify-self-center text-center">{u.recipe ? "Yes" : "No"}</div>
          <div className="justify-self-center text-center">{u.menuPlanning ? "Yes" : "No"}</div>
        </div>
      ))}
    </div>
  );
}
