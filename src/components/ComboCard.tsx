import Link from "next/link";
import Image from "next/image";
import React from "react";

type Combo = {
  name: string;
  image: string;
  tags: string[];
  serving: number;
};

export default function ComboCard() {
  return (
    <div className="w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <a href="#">
        <img className="rounded-base" src="/MTC_logo.png" alt="" />
      </a>
      <div>Chicken Tikka Masala</div>
      <div>wow</div>
      <div>Serves 10</div>
    </div>
  );
}
