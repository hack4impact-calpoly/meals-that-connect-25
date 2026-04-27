"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

type UserRole = "Admin" | "Dining Site Staff" | "Kitchen Staff";

export default function Navbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  const [role, setRole] = useState<UserRole | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // cync user to DB on sign-in and fetch their role
  useEffect(() => {
    if (!isSignedIn) return;

    const syncAndFetch = async () => {
      await fetch("/api/users/sync", { method: "POST" });
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setRole(data.role as UserRole);
      }
    };

    syncAndFetch();
  }, [isSignedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allNavLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/menuPlanning", label: "Menu Planning" },
    { href: "/recipe", label: "Recipes" },
    { href: "/permissions", label: "Permissions", adminOnly: true },
  ];

  const navLinks = allNavLinks.filter((link) => !link.adminOnly || role === "Admin");

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : (user?.emailAddresses[0]?.emailAddress ?? "User");

  return (
    <nav className="flex items-center justify-between border-b bg-white border-medium-gray px-6 py-4">
      <Link href="/">
        <Image src="/MTC_logo.png" alt="MTC logo" width={120} height={120} priority />
      </Link>

      <div className="ml-auto mr-20 flex items-center gap-10">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-medium ${
              pathname === link.href
                ? "text-radish-900 underline underline-offset-4"
                : "text-pepper hover:text-radish-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {isSignedIn && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-lg border border-medium-gray px-4 py-2 hover:bg-light-gray transition-colors"
          >
            {user?.imageUrl ? (
              <Image src={user.imageUrl} alt="Profile" width={40} height={40} className="rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-medium-gray" />
            )}
            <div className="flex flex-col text-left">
              <span className="font-medium text-pepper">{displayName}</span>
              <span className="text-sm text-radish-900">{role ?? "..."}</span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-medium-gray bg-white shadow-md z-50">
              <button
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-pepper hover:bg-light-gray transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
