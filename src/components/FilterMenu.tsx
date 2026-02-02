"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import React from "react";

export default function FilterMenu() {
  return (
    <div className="p-5 w-60 border">
      <div className="flex flex-row">
        <SlidersHorizontal className="mr-3 mb-3" />
        <p className="font-montserrat text-xl">Filters</p>
      </div>
      <hr className="border-0 border-t border-gray-500" />
      <FilterMenuOption />
      <FilterMenuOption />
      <FilterMenuOption />
    </div>
  );
}

function FilterMenuOption() {
  return (
    <div>
      <div className="flex flex-row justify-between py-3">
        <p className="">Another Options</p>
        <ChevronDown />
      </div>
      <hr className="border-0 border-t border-gray-500" />
    </div>
  );
}

function onClick() {
  console.log("Clicked");
}
