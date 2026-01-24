import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Navbar() {
  const navBarRight: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "right",
    gap: "70px",
  };

  const navBar: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    paddingRight: "70px",
    paddingLeft: "20px",
  };

  return (
    <nav style={navBar}>
      {}
      <Link href="/">
        <Image src="/MTC_logo.png" alt="MTC logo" width={150} height={150} />
      </Link>
      <div style={navBarRight}>
        <Link href="/">Dashboard</Link>
        <Link href="/menuPlanning">Menu Planning</Link>
        <Link href="/recipe">Recipe</Link>
        <Link href="/permissions">Permissions</Link>
      </div>
    </nav>
  );
}
