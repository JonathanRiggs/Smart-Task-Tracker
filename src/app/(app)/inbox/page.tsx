import { Suspense } from "react";
import TaskList from "@/components/card-comp/task-list";
import { taskFilterSchema } from "@/lib/schemas/task";
import { requirePageUserId } from "@/lib/server/auth";
import { listTasks } from "@/lib/server/tasks";
import Loading from "../loading";

/**
 * The heading renders instantly; the uncached DB work (auth user row +
 * task query) streams in behind its own <Suspense> boundary.
 */
export default function InboxPage() {
  return (
    <div className="container">
      <h1 className="title">Inbox</h1>
      <p className="subtitle is-6">Tasks that aren&apos;t in a project yet.</p>
      <Suspense fallback={<Loading />}>
        <InboxTasks />
      </Suspense>
    </div>
  );
}

async function InboxTasks() {
  const userId = await requirePageUserId();
  const tasks = await listTasks(
    userId,
    taskFilterSchema.parse({ projectId: "none" }),
  );
  return <TaskList tasks={tasks} emptyMessage="No tasks in your inbox." />;
}
