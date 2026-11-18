import { Suspense } from "react";
import { NavLink } from "./nav-link";
import { SidebarErrorBoundary } from "./sidebar-error-boundary";
import { SidebarProjects } from "./sidebar-projects";

const views = [
  { href: "/inbox", label: "Inbox" },
  { href: "/today", label: "Today" },
  { href: "/upcoming", label: "Upcoming" },
] as const;

export function Sidebar() {
  return (
    <nav className="menu p-4" aria-label="Sidebar">
      <ul className="menu-list">
        {views.map((view) => (
          <li key={view.href}>
            <NavLink href={view.href}>{view.label}</NavLink>
          </li>
        ))}
      </ul>

      <p className="menu-label">
        <NavLink href="/projects" exact>
          Projects
        </NavLink>
      </p>
      {/* The project list hits the database: stream it in, and keep a
          failure here from taking down the whole shell. */}
      <SidebarErrorBoundary>
        <Suspense
          fallback={<p className="has-text-grey is-size-7">Loading…</p>}
        >
          <SidebarProjects />
        </Suspense>
      </SidebarErrorBoundary>
    </nav>
  );
}
