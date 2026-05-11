import { clerkClient } from "@clerk/nextjs/server";
import User from "@/database/UserSchema";

export async function GET() {
  const client = await clerkClient();
  const clerkUsers = (await client.users.getUserList()).data;

  // get all id's
  const dbUsers = await User.find({
    clerkId: { $in: clerkUsers.map((user) => user.id) },
  });

  const users = clerkUsers.map((clerkUser) => {
    // find every user to get their information we need
    const dbUser = dbUsers.find((u) => u.clerkId === clerkUser.id);

    return {
      _id: clerkUser.id,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      avatarUrl: clerkUser.imageUrl,
      role: dbUser?.role ?? "Dining Site Staff",
    };
  });
  return Response.json(users);
}
