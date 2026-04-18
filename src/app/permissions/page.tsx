import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";
import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";

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
      <div className="flex justify-end p-5">
        <SortPermissionsButton align="right" />
      </div>
      <div className="p-5">
        <PermissionsDisplay users={users} editing={true} />
      </div>
    </main>
  );
}
