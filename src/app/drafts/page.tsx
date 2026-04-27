import DraftsPageClient from "@/components/DraftsPageClient";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";

export default async function DraftsPage() {
  const { userId } = await auth();

  await dbConnect();
  const currentUser = await User.findOne({ clerkId: userId });

  return (
    <>
      <DraftsPageClient userRole={currentUser.role} />
    </>
  );
}
