import TaskList from "@/components/card-comp/task-list";
import { Status } from "@/generated/prisma/browser";
import { dayBounds } from "@/lib/dates";
import { taskFilterSchema } from "@/lib/schemas/task";
import { requirePageUserId } from "@/lib/server/auth";
import { listTasks } from "@/lib/server/tasks";

async function _TodayTasks() {
  const userId = await requirePageUserId();
  const { startOfDay, endOfToday } = dayBounds(new Date());
  const tasks = await listTasks(
    userId,
    taskFilterSchema.parse({
      dueBefore: endOfToday,
      status: [Status.TODO, Status.IN_PROGRESS],
    }),
  );
  const _overdue = tasks.filter((t) => t.dueAt && t.dueAt < startOfDay);
  const _dueToday = tasks.filter((t) => t.dueAt && t.dueAt >= startOfDay);
  return { _overdue, _dueToday };
}

export default async function TodayPage() {
  const { _overdue, _dueToday } = await _TodayTasks();
  return (
    <>
      {_overdue.length > 0 && (
        <>
          <h2 className="title is-5 has-text-danger">Overdue</h2>
          <TaskList tasks={_overdue} />
        </>
      )}
      <h2 className="title is-5">Today</h2>
      <TaskList tasks={_dueToday} emptyMessage="Nothing due today." />
    </>
  );
}
