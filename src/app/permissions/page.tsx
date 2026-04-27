import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";
import PermissionsClient from "@/components/PermissionsClient";

export default async function Permissions() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await dbConnect();
  const currentUser = await User.findOne({ clerkId: userId });

  if (!currentUser || currentUser.role !== "Admin") {
    redirect("/");
  }

  const users = [
    {
      _id: "u1",
      name: "Bryan Lai",
      role: "Admin",
      recipe: true,
      menuPlanning: true,
    },
    {
      _id: "u2",
      name: "Bryan Lai",
      role: "Dining Site Staff",
      recipe: true,
      menuPlanning: false,
    },
    {
      _id: "u3",
      name: "Bryan Lai",
      role: "Kitchen Staff",
      recipe: false,
      menuPlanning: false,
    },
  ];

  return (
    <main>
      <PermissionsClient users={users} />
    </main>
  );
}
