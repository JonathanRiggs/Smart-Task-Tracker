"use client";

import { Status, type Task } from "@/generated/prisma/browser";
import { formatDate, priorityTagClass } from "./task-format";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
}

export default function TaskCard({ task, onSelect }: TaskCardProps) {
  const isDone = task.status === Status.DONE;

  return (
    <button
      type="button"
      className="box task-card"
      onClick={() => onSelect(task)}
    >
      <div className="is-flex is-justify-content-space-between is-align-items-center">
        <span
          className={`has-text-weight-semibold ${isDone ? "has-text-grey-light is-line-through" : ""}`}
        >
          {task.title}
        </span>
        <span className={`tag ${priorityTagClass(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      {task.dueAt && (
        <p className="is-size-7 has-text-grey mt-1">
          Due {formatDate(task.dueAt)}
        </p>
      )}
    </button>
  );
}
