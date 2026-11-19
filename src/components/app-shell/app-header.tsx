import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import NewTaskButton from "@/components/card-comp/new-task-button";
import { requirePageUserId } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/projects";

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
          {/* Needs the user's projects, so it streams in like the sidebar. */}
          <Suspense fallback={null}>
            <HeaderNewTask />
          </Suspense>
        </div>
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

async function HeaderNewTask() {
  const userId = await requirePageUserId();
  const projects = await listProjects(userId);
  return (
    <NewTaskButton projects={projects.map(({ id, name }) => ({ id, name }))} />
  );
}
