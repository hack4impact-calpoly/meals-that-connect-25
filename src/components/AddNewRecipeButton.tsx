"use client";

import { useState } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { Plus, Utensils, Soup, Apple, Carrot } from "lucide-react";
import CreateRecipePopUp from "./CreateRecipePopUp";
import { CATEGORY_DISPLAY, CategoryDisplayType } from "@/lib/types";

/* Dropdown options for creating a new recipe. Add/remove entries here to change
   what appears in the menu. */

function RecipeMenuItem({
  type,
  onSelect,
}: {
  type: CategoryDisplayType;
  onSelect: (type: CategoryDisplayType) => void;
}) {
  const Icon = type.icon;

  return (
    <MenuItem>
      <button
        onClick={() => onSelect(type)}
        className="flex w-full items-center gap-3 px-2 py-2 text-xl font-montserrat text-nowrap font-medium text-pepper
                   data-focus:text-radish-900"
      >
        <Icon size={32} />
        Add {type.label}
      </button>
    </MenuItem>
  );
}

export default function AddNewRecipeButton() {
  /* When a user picks a menu option we store the selected type here.
    - Null => popup is closed. 
    - Non-null => CreateRecipePopUp is open.
    The type is passed to CreateRecipePopUp so behavior can be customized based on the selected recipe type. */
  const [activeType, setActiveType] = useState<CategoryDisplayType | null>(null);

  return (
    <>
      <Menu as="div" className="relative">
        <MenuButton
          className="inline-flex items-center gap-1 md:gap-2 rounded-lg bg-radish-900 p-2 md:p-2.5
                               text-xs md:text-base font-bold font-montserrat text-white text-nowrap whitespace-nowrap"
        >
          <span className="hidden md:inline">Add New Recipe</span>
          <span className="md:hidden">New</span>
          <Plus size={18} className="md:w-5 md:h-5" strokeWidth={3} />
        </MenuButton>

        <MenuItems
          transition
          className="absolute -right-2 z-50 mt-1 origin-top-right
                    data-closed:scale-95 data-closed:opacity-0
                    rounded-lg bg-white drop-shadow-sm drop-shadow-black/50
                    data-enter:duration-100 data-leave:duration-75

                    before:absolute before:content-['']
                    before:right-4.5 before:-top-4.5
                    before:h-5 before:w-6
                    before:bg-white
                    before:[clip-path:polygon(50%_0%,0%_100%,100%_100%)]
                    before:z-10"
        >
          <div className="relative">
            {CATEGORY_DISPLAY.map((type, index) => (
              <div key={type.category} className={index !== 0 ? "border-t border-medium-gray" : ""}>
                <RecipeMenuItem type={type} onSelect={setActiveType} />
              </div>
            ))}
          </div>
        </MenuItems>
      </Menu>

      <CreateRecipePopUp
        item={null}
        open={!!activeType}
        onClose={() => setActiveType(null)}
        recipeType={activeType}
        editMode={false}
      />
    </>
  );
}
