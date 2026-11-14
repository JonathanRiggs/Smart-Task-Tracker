import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { HttpError } from "./http";
import { prisma } from "./prisma";

/**
 * Returns the signed-in Clerk user's id, making sure a matching `User` row
 * exists so tasks can reference it. Throws a 401 if nobody is signed in.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new HttpError(401, "Unauthorized");

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (existing) return userId;

  // First request from this user: copy their profile from Clerk.
  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) throw new HttpError(400, "Your account has no email address");

  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    null;

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email, name },
    update: {},
  });
  return userId;
}
