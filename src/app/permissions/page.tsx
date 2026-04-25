import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";
import PermissionsDisplay from "@/components/PermissionsDisplay";
import SortPermissionsButton from "@/components/SortPermissionsButton";
import EditPermissionsButton from "@/components/EditPermissionsButton";
import PermissionsPopUp from "@/components/PermissionsPopUp";

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
      <div className="flex flex-col py-5 gap-4 px-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Manage Permissions</h1>
          <EditPermissionsButton />
        </div>

        <div className="flex justify-between">
          <div className="w-350 bg-white text-black border">insert search bar here</div>
          <SortPermissionsButton align="right" />
        </div>

        <div>
          <PermissionsDisplay users={users} editing={true} />
        </div>
      </div>

      <PermissionsPopUp />
    </main>
  );
}
