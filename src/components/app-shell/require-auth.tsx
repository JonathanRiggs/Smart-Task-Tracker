import { requirePageUserId } from "@/lib/server/auth";

/**
 * Renders its children only for signed-in users; everyone else is
 * redirected to sign in. Reads the session, so render it inside <Suspense>.
 */
export async function RequireAuth({ children }: { children: React.ReactNode }) {
  await requirePageUserId();
  return children;
}
