"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useClerk, useUser, SignInButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { UserRole } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  const [role, setRole] = useState<UserRole | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function getUserRole() {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        } else {
          console.error("Failed to fetch user role");
        }
      } catch (error) {
        setUserRole(null);
      }
    }
    getUserRole();
  }, []);

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

  useEffect(() => {
    if (!drawerOpen) return; // only attach when mobile drawer is open
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [drawerOpen]);

  const allNavLinks = [
    { href: "/", label: "Dashboard", authOnly: true },
    { href: "/menuPlanning", label: "Menu Planning" },
    { href: "/recipe", label: "Recipes" },
    { href: "/permissions", label: "Permissions", authOnly: true, adminOnly: true },
  ];

  const navLinks = allNavLinks
    .filter((link) => !link.authOnly || isSignedIn)
    .filter((link) => !link.adminOnly || role === "Admin");

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : (user?.emailAddresses[0]?.emailAddress ?? "User");

  return (
    <nav className="flex items-center justify-between border-b bg-white border-medium-gray px-6 py-4">
      <Link href="/">
        <Image src="/MTC_logo.png" alt="MTC logo" width={120} height={120} priority className="w-24 h-auto" />
      </Link>

      <div className="ml-auto mr-20 hidden md:flex items-center gap-10">
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

      {isSignedIn ? (
        <div className="relative hidden md:block" ref={dropdownRef}>
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
                onClick={() => {
                  setUserRole(null);
                  signOut({ redirectUrl: "/sign-in" });
                }}
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-pepper hover:bg-light-gray transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative hidden md:block" ref={dropdownRef}>
          <SignInButton mode="modal">
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg border border-medium-gray px-4 py-2 hover:bg-light-gray transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </SignInButton>
        </div>
      )}

      {/* Hamburger Icon for mobile */}
      <button className="md:hidden ml-auto" onClick={() => setDrawerOpen(true)}>
        <Menu size={28} />
      </button>

      {/* Mobile Menu Drawer */}
      <div className="fixed inset-0 z-50 flex pointer-events-none">
        {/* Overlay */}
        {drawerOpen && (
          <div
            className={`fixed inset-0 bg-black opacity-30 ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`ml-auto w-50 bg-white h-full shadow-lg p-6 relative z-50 flex flex-col transition-transform duration-300 ease-in-out
            ${drawerOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"}`}
        >
          <button className="absolute top-4 right-4" onClick={() => setDrawerOpen(false)}>
            <X size={28} />
          </button>
          <nav className="flex flex-col gap-6 mt-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium ${pathname === link.href ? "text-radish-900" : "text-pepper"}`}
                onClick={() => setDrawerOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isSignedIn ? (
            <div className="mt-auto flex flex-col gap-2" ref={mobileDropdownRef}>
              <button
                onClick={() => setMobileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-medium-gray px-2 py-2 hover:bg-light-gray transition-colors"
              >
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={30}
                    height={30}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-medium-gray" />
                )}
                <div className="flex flex-col text-left">
                  <span className="font-medium text-xs text-pepper">{displayName}</span>
                  <span className="text-[0.625rem] text-radish-900">{role ?? "..."}</span>
                </div>
              </button>
              {mobileDropdownOpen && (
                <div className="absolute bottom-20 mt-2 w-20 rounded-lg border border-medium-gray bg-white shadow-md z-50">
                  <button
                    onClick={() => {
                      setUserRole(null);
                      signOut({ redirectUrl: "/sign-in" });
                      setDrawerOpen(false);
                      setMobileDropdownOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-xs font-medium text-pepper hover:bg-light-gray transition-colors"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-2" ref={mobileDropdownRef}>
              <SignInButton mode="modal">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full rounded-lg px-3 py-2 text-xs font-medium text-pepper border border-medium-gray hover:bg-light-gray transition-colors"
                >
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
