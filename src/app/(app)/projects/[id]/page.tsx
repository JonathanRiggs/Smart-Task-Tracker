import { notFound } from "next/navigation";
import { Suspense } from "react";
import TaskList from "@/components/card-comp/task-list";
import { taskFilterSchema } from "@/lib/schemas/task";
import { requirePageUserId } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/http";
import { getProject } from "@/lib/server/projects";
import { listTasks } from "@/lib/server/tasks";
import Loading from "../../loading";

type Params = PageProps<"/projects/[id]">["params"];

/**
 * No async work at the top level: params and the uncached DB queries are
 * read inside <Suspense> so client navigations between projects are instant.
 *
 * Note: the (app) layout already streams, so notFound() here renders the
 * not-found UI (with noindex) rather than an HTTP 404 status.
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

  // Fetch the project and its tasks in parallel.
  const [project, tasks] = await Promise.all([
    getProject(userId, id).catch((error) => {
      if (error instanceof HttpError && error.status === 404) notFound();
      throw error;
    }),
    listTasks(userId, filter.data),
  ]);

  return (
    <>
      <h1 className="title">{project.name}</h1>
      <p className="subtitle is-6">
        {project._count.tasks} {project._count.tasks === 1 ? "task" : "tasks"}
      </p>
      <TaskList tasks={tasks} emptyMessage="No tasks in this project yet." />
    </>
  );
}
