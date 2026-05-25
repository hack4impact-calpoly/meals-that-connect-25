import PillToggle from "@/components/PillToggle";
import { UserRole } from "@/lib/types";

export default function RoleToggle({
  options,
  selectedRoles,
  onToggle,
}: {
  options: UserRole[];
  selectedRoles: Set<UserRole>;
  onToggle: (role: UserRole) => void;
}) {
  return (
    <PillToggle
      options={options.map((option) => ({
        value: option,
        label: option,
      }))}
      selectedValues={selectedRoles}
      onToggle={onToggle}
    />
  );
}
