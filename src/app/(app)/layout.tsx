import { Suspense } from "react";
import { AppHeader } from "@/components/app-shell/app-header";
import { RequireAuth } from "@/components/app-shell/require-auth";
import { Sidebar } from "@/components/app-shell/sidebar";
import Loading from "./loading";

/**
 * Shell for every authenticated page (Inbox, Today, Upcoming, Projects).
 * The `(app)` folder is a route group: it adds no URL segment.
 *
 * The header and sidebar frame render immediately; page content waits for
 * the auth check, and signed-out visitors are redirected to sign in.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="columns is-gapless app-shell__body">
        <aside className="column is-narrow app-shell__sidebar">
          <Sidebar />
        </aside>
        <main className="column section app-shell__main">
          <Suspense fallback={<Loading />}>
            <RequireAuth>{children}</RequireAuth>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
