/* this is the file for the sort permissions button */
"use client";
import { useState } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ListFilter } from "lucide-react";
import CreateFilterPopUp, { CreateFilterType } from "./CreateFilterPermissionPopUp";

const FILTER_TYPES: CreateFilterType[] = [
  { id: "last-updated", label: "Last Updated" },
  { id: "created-date", label: "Created Date" },
  { id: "a-to-z", label: "A to Z" },
  { id: "z-to-a", label: "Z to A" },
];

function RecipeMenuItem({
  type,
  onSelect,
  isSelected,
}: {
  type: CreateFilterType;
  onSelect: (type: CreateFilterType) => void;
  isSelected?: boolean;
}) {
  return (
    <MenuItem>
      <button
        onClick={(e) => {
          e.preventDefault();
          onSelect(type);
        }}
        className="flex w-full items-center gap-3 px-4 py-2 text-base font-montserrat font-medium text-black"
      >
        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-radish-900`}>
          {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-radish-900" />}
        </div>
        {type.label}
      </button>
    </MenuItem>
  );
}

export default function SortPermissionsButton({ align = "right" }: { align?: "left" | "right" }) {
  const [activeType, setActiveType] = useState<CreateFilterType | null>(null);
  const isRight = align === "right";
  return (
    <>
      <Menu as="div" className="relative">
        <MenuButton className="w-10 w-fit h-10 bg-medium-gray rounded-lg flex items-center justify-center p-2.5">
          <ListFilter className="text-pepper" />
        </MenuButton>
        <MenuItems
          transition
          className={`absolute z-50 mt-4.5 w-48
                    ${isRight ? "right-0 origin-top-right" : "left-0 origin-top-left"}
                    data-closed:scale-95 data-closed:opacity-0
                    rounded-lg bg-white drop-shadow-sm drop-shadow-black/50
                    data-enter:duration-100 data-leave:duration-75

                    before:absolute before:content-['']
                    before:-top-4.5
                    before:h-5 before:w-6
                    before:bg-white
                    before:[clip-path:polygon(50%_0%,0%_100%,100%_100%)]
                    before:z-10
                    ${isRight ? "before:right-4" : "before:left-4"}
                    `}
        >
          <div className="px-4 py-2 font-montserrat font-bold text-pepper">Sort by:</div>
          <div className="relative">
            {FILTER_TYPES.map((type, index) => (
              <div key={type.id}>
                <RecipeMenuItem
                  key={type.id}
                  type={type}
                  onSelect={setActiveType}
                  isSelected={type.id === activeType?.id}
                />
              </div>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </>
  );
}
