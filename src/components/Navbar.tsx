"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/menuPlanning", label: "Menu Planning" },
    { href: "/recipe", label: "Recipes" },
    { href: "/permissions", label: "Permissions" },
  ];

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <Link href="/">
        <Image src="/MTC_logo.png" alt="MTC logo" width={120} height={120} />
      </Link>

      <div className="flex items-center gap-10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 pb-1 font-medium ${
              pathname === link.href
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-gray-900 hover:text-pink-500"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-gray-700 px-4 py-2">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">Brian</span>
          <span className="text-sm text-pink-500">Admin</span>
        </div>
      </div>
    </nav>
  );
}
