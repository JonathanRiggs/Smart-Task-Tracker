import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

export function AppHeader() {
  return (
    <nav className="navbar has-shadow" aria-label="main navigation">
      <div className="navbar-brand">
        <Link href="/inbox" className="navbar-item has-text-weight-bold">
          Smart Task Tracker
        </Link>
      </div>
      <div className="navbar-end">
        <div className="navbar-item">
          {/* UserButton reads the session, so it streams in under Suspense. */}
          <Suspense fallback={<span className="user-menu-placeholder" />}>
            <UserButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
