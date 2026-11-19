"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent, useEffect, useId, useRef, useState } from "react";
import { Priority } from "@/generated/prisma/browser";

export interface ProjectOption {
  id: string;
  name: string;
}

export interface TaskFormDefaults {
  projectId?: string;
  /** Pre-fill the due date with the user's local "today". */
  dueToday?: boolean;
}

interface TaskFormModalProps {
  onClose: () => void;
  projects: ProjectOption[];
  defaults?: TaskFormDefaults;
}

/** Field errors as returned by the API (z.flattenError → fieldErrors). */
type FieldErrors = Partial<Record<string, string[]>>;

const pad = (n: number) => String(n).padStart(2, "0");

/** A Date as an <input type="date"> value ("YYYY-MM-DD") in local time. */
function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Due-date rule: a picked date means *local midnight* of that day.
 * "YYYY-MM-DD" alone would be parsed as UTC midnight, so append a time —
 * a date-time string without an offset is parsed in the browser's timezone.
 */
function localMidnightIso(value: string): string | null {
  return value ? new Date(`${value}T00:00`).toISOString() : null;
}

/**
 * Form for creating a task. Rendered only while open, so every open starts
 * from fresh defaults. On success it refreshes the current route so server
 * components (lists, sidebar) re-fetch.
 */
export default function TaskFormModal({
  onClose,
  projects,
  defaults = {},
}: TaskFormModalProps) {
  const router = useRouter();
  const id = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");

    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: text("title"),
          notes: text("notes"),
          priority: text("priority"),
          dueAt: localMidnightIso(text("dueAt")),
          projectId: text("projectId"),
          tags: text("tags")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      if (res.status === 400) {
        const body = await res.json().catch(() => ({}));
        setFieldErrors(body.details?.fieldErrors ?? {});
        setError(body.error ?? "Please fix the errors below.");
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const fieldError = (name: string) =>
    fieldErrors[name]?.[0] && (
      <p className="help is-danger">{fieldErrors[name]?.[0]}</p>
    );
  const danger = (name: string) => (fieldErrors[name] ? "is-danger" : "");
  const formId = `${id}-form`;

  return (
    <div className="modal is-active">
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
        aria-labelledby={`${id}-heading`}
      >
        <header className="modal-card-head">
          <p id={`${id}-heading`} className="modal-card-title">
            New task
          </p>
          <button
            type="button"
            className="delete"
            aria-label="Close"
            onClick={onClose}
          />
        </header>

        <section className="modal-card-body">
          {error && (
            <div className="notification is-danger is-light">{error}</div>
          )}

          <form id={formId} onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="label" htmlFor={`${id}-title`}>
                Title
              </label>
              <div className="control">
                <input
                  ref={titleRef}
                  id={`${id}-title`}
                  name="title"
                  className={`input ${danger("title")}`}
                  type="text"
                  maxLength={200}
                  required
                />
              </div>
              {fieldError("title")}
            </div>

            <div className="field">
              <label className="label" htmlFor={`${id}-notes`}>
                Notes
              </label>
              <div className="control">
                <textarea
                  id={`${id}-notes`}
                  name="notes"
                  className={`textarea ${danger("notes")}`}
                  maxLength={5000}
                  rows={3}
                />
              </div>
              {fieldError("notes")}
            </div>

            <div className="columns">
              <div className="column field">
                <label className="label" htmlFor={`${id}-priority`}>
                  Priority
                </label>
                <div className={`select is-fullwidth ${danger("priority")}`}>
                  <select
                    id={`${id}-priority`}
                    name="priority"
                    defaultValue={Priority.MEDIUM}
                  >
                    {Object.values(Priority).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldError("priority")}
              </div>

              <div className="column field">
                <label className="label" htmlFor={`${id}-due`}>
                  Due date
                </label>
                <div className="control">
                  <input
                    id={`${id}-due`}
                    name="dueAt"
                    className={`input ${danger("dueAt")}`}
                    type="date"
                    defaultValue={
                      defaults.dueToday ? toDateInputValue(new Date()) : ""
                    }
                  />
                </div>
                {fieldError("dueAt")}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor={`${id}-project`}>
                Project
              </label>
              <div className={`select is-fullwidth ${danger("projectId")}`}>
                <select
                  id={`${id}-project`}
                  name="projectId"
                  defaultValue={defaults.projectId ?? ""}
                >
                  <option value="">Inbox (no project)</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              {fieldError("projectId")}
            </div>

            <div className="field">
              <label className="label" htmlFor={`${id}-tags`}>
                Tags
              </label>
              <div className="control">
                <input
                  id={`${id}-tags`}
                  name="tags"
                  className={`input ${danger("tags")}`}
                  type="text"
                  placeholder="work, errands"
                />
              </div>
              <p className="help">Separate tags with commas.</p>
              {fieldError("tags")}
            </div>
          </form>
        </section>

        <footer className="modal-card-foot buttons">
          <button
            type="submit"
            form={formId}
            className={`button is-primary ${busy ? "is-loading" : ""}`}
            disabled={busy}
          >
            Create task
          </button>
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
