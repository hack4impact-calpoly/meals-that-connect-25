import { Pencil } from "lucide-react";

type Props = {
  isEditing: boolean;
  onClick: () => void;
};

export default function EditPermissionsButton({ isEditing, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded-lg px-4 py-2.5 gap-2 bg-white border-2 border-radish-900 text-base font-bold text-radish-900 text-nonwrap cursor-pointer"
    >
      {isEditing ? "Save" : "Edit Permissions"}
      {!isEditing && <Pencil size={15} />}
    </button>
  );
}
