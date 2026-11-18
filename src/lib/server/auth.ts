import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { HttpError } from "./http";
import { prisma } from "./prisma";

/**
 * For API route handlers: returns the signed-in Clerk user's id, making sure
 * a matching `User` row exists so tasks can reference it. Throws a 401 if
 * nobody is signed in (turned into JSON by `withErrorHandling`).
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new HttpError(401, "Unauthorized");
  await ensureUserRow(userId);
  return userId;
}

/**
 * For pages and server components: like `requireUserId`, but redirects
 * signed-out visitors to the sign-in page instead of throwing a 401.
 *
 * Wrapped in React `cache()` so the layout's <RequireAuth> and the page
 * share one auth check + DB lookup per request.
 */
export const requirePageUserId = cache(async (): Promise<string> => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  await ensureUserRow(userId);
  return userId;
});

/** On a user's first request, copy their profile from Clerk into our DB. */
async function ensureUserRow(userId: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (existing) return;

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
}
