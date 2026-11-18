import { requirePageUserId } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/projects";
import { NavLink } from "./nav-link";

export async function SidebarProjects() {
  const userId = await requirePageUserId();
  const projects = await listProjects(userId);

  if (projects.length === 0) {
    return <p className="has-text-grey is-size-7">No projects yet.</p>;
  }

  return (
    <ul className="menu-list">
      {projects.map((project) => (
        <li key={project.id}>
          <NavLink href={`/projects/${project.id}`}>
            <span
              className="project-dot"
              style={{ backgroundColor: project.color ?? "#b5b5b5" }}
              aria-hidden
            />
            {project.name}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
