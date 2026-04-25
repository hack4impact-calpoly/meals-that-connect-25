import { Pencil } from "lucide-react";

export default function EditPermissionsButton() {
  return (
    <button className="inline-flex items-center rounded-lg px-3 py-2.5 gap-2 bg-white border-2 border-radish-900 text-base font-bold text-radish-900 text-nonwrap cursor-pointer">
      Edit Permissions
      <Pencil size={15} />
    </button>
  );
}
