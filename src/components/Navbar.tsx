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
    <nav className="flex items-center justify-between border-b border-medium-gray px-6 py-4">
      <Link href="/">
        <Image src="/MTC_logo.png" alt="MTC logo" width={120} height={120} />
      </Link>

      <div className="ml-auto mr-20 flex items-center gap-10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-medium ${
              pathname === link.href ? "text-radish-900" : "text-pepper hover:text-radish-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-medium-gray px-4 py-2">
        <div className="h-10 w-10 rounded-full bg-medium-gray"></div>
        <div className="flex flex-col">
          <span className="font-medium text-pepper">Brian</span>
          <span className="text-sm text-radish-900">Admin</span>
        </div>
      </div>
    </nav>
  );
}
