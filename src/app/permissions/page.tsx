import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";
import PermissionsClient from "../../components/PermissionsClient";

export default async function Permissions() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await dbConnect();
  const currentUser = await User.findOne({ clerkId: userId });

  if (!currentUser || currentUser.role !== "Admin") {
    redirect("/");
  }

  return <PermissionsClient />;
}
