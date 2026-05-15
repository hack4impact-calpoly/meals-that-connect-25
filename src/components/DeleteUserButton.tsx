import { Trash2 } from "lucide-react";

export default function DeleteUserButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 text-nowrap rounded-lg bg-radish-900 p-3
                               font-montserrat text-sm font-bold text-white sm:w-auto sm:text-base"
    >
      Delete User
      <Trash2 size={18} />
    </button>
  );
}
