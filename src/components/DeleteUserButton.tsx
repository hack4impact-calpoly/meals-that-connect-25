import { Trash2 } from "lucide-react";

export default function DeleteUserButton() {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg bg-radish-900 p-3
                               text-base font-bold font-montserrat text-white text-nowrap"
    >
      Delete User
      <Trash2 />
    </button>
  );
}
