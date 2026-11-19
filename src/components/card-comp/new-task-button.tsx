"use client";

import { useCallback, useRef, useState } from "react";
import TaskFormModal, {
  type ProjectOption,
  type TaskFormDefaults,
} from "./task-form-modal";

interface NewTaskButtonProps {
  projects: ProjectOption[];
  defaults?: TaskFormDefaults;
  className?: string;
}

export default function NewTaskButton({
  projects,
  defaults,
  className = "button is-primary is-small",
}: NewTaskButtonProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Stable so the modal's Escape-key effect doesn't re-subscribe every render.
  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        New task
      </button>
      {open && (
        <TaskFormModal
          onClose={close}
          projects={projects}
          defaults={defaults}
        />
      )}
    </>
  );
}
