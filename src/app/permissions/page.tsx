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

  // replace with real users
  const users = [
    {
      clerkId: "u1",
      __v: 0,
      createdAt: {
        $date: "2026-04-20T08:46:37.798Z",
      },
      email: "blai@gmail.com",
      imageUrl: "",
      lastLoginDate: {
        $date: "2026-04-27T09:27:49.730Z",
      },
      name: "Bryan Lai",
      role: "Admin",
      updatedAt: {
        $date: "2026-04-27T09:27:49.733Z",
      },
    },
    {
      clerkId: "u2",
      __v: 0,
      createdAt: {
        $date: "2026-04-21T04:07:17.556Z",
      },
      email: "blai2@gmail.com",
      imageUrl: "",
      lastLoginDate: {
        $date: "2026-04-21T04:11:13.016Z",
      },
      name: "Cryan Lai",
      role: "Kitchen Staff",
      updatedAt: {
        $date: "2026-04-21T04:11:13.016Z",
      },
    },
    {
      __v: 0,
      clerkId: "u3",
      createdAt: {
        $date: "2026-04-22T23:33:09.486Z",
      },
      email: "blai3@gmail.com",
      imageUrl: "",
      lastLoginDate: {
        $date: "2026-04-22T23:33:09.485Z",
      },
      name: "Zryan Lai",
      role: "Kitchen Staff",
      updatedAt: {
        $date: "2026-04-22T23:33:09.486Z",
      },
    },
  ];

  return (
    <main>
      <PermissionsClient users={users} />
    </main>
  );
}
