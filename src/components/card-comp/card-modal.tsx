"use client";

import { Status, type Task } from "@/generated/prisma/browser";
import { formatDate, priorityTagClass } from "./task-format";

interface CardModalProps {
  /** The task to show, or null when the modal is closed. */
  task: Task | null;
  /** True while a toggle/delete request is in flight. */
  busy?: boolean;
  onClose: () => void;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function CardModal({
  task,
  busy = false,
  onClose,
  onToggleComplete,
  onDelete,
}: CardModalProps) {
  if (!task) return null;

  const isDone = task.status === Status.DONE;

  return (
    <div className="modal is-active">
      {/* Bulma: the background is an empty sibling of the content. */}
      <button
        type="button"
        className="modal-background"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
      >
        <header className="modal-card-head">
          <p id="card-modal-title" className="modal-card-title">
            {task.title}
          </p>
          <button
            type="button"
            className="delete"
            aria-label="Close"
            onClick={onClose}
          />
        </header>

        <section className="modal-card-body">
          <div className="tags">
            <span className={`tag ${priorityTagClass(task.priority)}`}>
              {task.priority}
            </span>
            <span className="tag is-light">{task.status}</span>
            {task.tags.map((tag) => (
              <span key={tag} className="tag is-link is-light">
                {tag}
              </span>
            ))}
          </div>

          {task.dueAt && (
            <p className="is-size-7 mb-3">Due {formatDate(task.dueAt)}</p>
          )}
          {task.completedAt && (
            <p className="is-size-7 mb-3">
              Completed {formatDate(task.completedAt)}
            </p>
          )}

          <div className="content">
            {task.notes ? (
              <p>{task.notes}</p>
            ) : (
              <p className="has-text-grey">No notes.</p>
            )}
          </div>
        </section>

        <footer className="modal-card-foot buttons">
          <button
            type="button"
            className="button is-success"
            disabled={busy}
            onClick={() => onToggleComplete(task)}
          >
            {isDone ? "Mark Incomplete" : "Mark Complete"}
          </button>
          <button
            type="button"
            className="button is-danger"
            disabled={busy}
            onClick={() => onDelete(task)}
          >
            Delete
          </button>
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
