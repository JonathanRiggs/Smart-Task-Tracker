import { notFound } from "next/navigation";
import { Suspense } from "react";
import NewTaskButton from "@/components/card-comp/new-task-button";
import TaskList from "@/components/card-comp/task-list";
import { taskFilterSchema } from "@/lib/schemas/task";
import { requirePageUserId } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/http";
import { getProject, listProjects } from "@/lib/server/projects";
import { listTasks } from "@/lib/server/tasks";
import Loading from "../../loading";

type Params = PageProps<"/projects/[id]">["params"];

/**
 * No async work at the top level: params and the uncached DB queries are
 * read inside <Suspense> so client navigations between projects are instant.
 */
export default function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: { params: Params }) {
  const { id } = await params;
  // A malformed id (e.g. /projects/abc) can't match any project.
  const filter = taskFilterSchema.safeParse({ projectId: id });
  if (!filter.success) notFound();

  const userId = await requirePageUserId();

  // Fetch the project, its tasks, and the project picker list in parallel.
  const [project, tasks, projects] = await Promise.all([
    getProject(userId, id).catch((error) => {
      if (error instanceof HttpError && error.status === 404) notFound();
      throw error;
    }),
    listTasks(userId, filter.data),
    listProjects(userId),
  ]);

  return (
    <>
      <div className="is-flex is-justify-content-space-between is-align-items-start">
        <div>
          <h1 className="title">{project.name}</h1>
          <p className="subtitle is-6">
            {project._count.tasks}{" "}
            {project._count.tasks === 1 ? "task" : "tasks"}
          </p>
        </div>
        <NewTaskButton
          className="button is-primary is-light"
          projects={projects.map(({ id, name }) => ({ id, name }))}
          defaults={{ projectId: project.id }}
        />
      </div>
      <TaskList tasks={tasks} emptyMessage="No tasks in this project yet." />
    </>
  );
}
