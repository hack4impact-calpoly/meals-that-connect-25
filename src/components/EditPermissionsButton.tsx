import { Pencil } from "lucide-react";

type Props = {
  isEditing: boolean;
  onClick: () => void;
};

export default function EditPermissionsButton({ isEditing, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 text-nowrap rounded-lg border-2 border-radish-900 bg-white px-3 py-2 text-sm font-bold text-radish-900 sm:w-auto sm:px-4 sm:py-2.5 sm:text-base"
    >
      {isEditing ? "Save Changes" : "Edit Permissions"}
      {!isEditing && <Pencil size={15} />}
    </button>
  );
}
