"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Status, type Task } from "@/generated/prisma/browser";
import CardModal from "./card-modal";
import TaskCard from "./task-card";

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
}

/**
 * Renders a list of task cards and owns the single CardModal for them.
 * Pages (Server Components) fetch tasks and pass them in; after a mutation
 * we call router.refresh() so the server re-renders with fresh data.
 */
export default function TaskList({
  tasks,
  emptyMessage = "No tasks here yet.",
}: TaskListProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Look the task up by id so the modal shows fresh data after a refresh.
  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const close = () => {
    setSelectedId(null);
    setError(null);
  };

  async function mutate(request: () => Promise<Response>, closeAfter = false) {
    setBusy(true);
    setError(null);
    try {
      const res = await request();
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      if (closeAfter) setSelectedId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const toggleComplete = (task: Task) =>
    mutate(() =>
      fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: task.status === Status.DONE ? Status.TODO : Status.DONE,
        }),
      }),
    );

  const remove = (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    return mutate(
      () => fetch(`/api/tasks/${task.id}`, { method: "DELETE" }),
      true,
    );
  };

  return (
    <>
      {error && <div className="notification is-danger is-light">{error}</div>}

      {tasks.length === 0 ? (
        <p className="has-text-grey">{emptyMessage}</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} onSelect={(t) => setSelectedId(t.id)} />
            </li>
          ))}
        </ul>
      )}

      <CardModal
        task={selected}
        busy={busy}
        onClose={close}
        onToggleComplete={toggleComplete}
        onDelete={remove}
      />
    </>
  );
}
