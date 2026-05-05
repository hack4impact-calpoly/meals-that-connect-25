import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";
import MenuPlanningClient from "@/components/menuPlanning/MenuPlanningClient";

export default async function MenuPlanning() {
  const { userId } = await auth();

  await dbConnect();
  const currentUser = await User.findOne({ clerkId: userId });
  return <MenuPlanningClient userRole={currentUser?.role ?? null} />;
}
