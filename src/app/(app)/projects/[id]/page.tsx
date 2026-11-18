import { notFound } from "next/navigation";
import { requirePageUserId } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/http";
import { getProject } from "@/lib/server/projects";

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const userId = await requirePageUserId();

  const project = await getProject(userId, id).catch((error) => {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  });

  return (
    <>
      <h1 className="title">{project.name}</h1>
      <p className="subtitle is-6">
        {project._count.tasks} {project._count.tasks === 1 ? "task" : "tasks"}
      </p>
    </>
  );
}
