import { z } from "zod";
import { Priority, Status } from "../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Treat "" (from an empty form field) as null so it clears the value. */
const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

/** Accept a single value or an array (URL search params can be either). */
const oneOrMany = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.array(schema)])
    .transform((v) => (Array.isArray(v) ? v : [v]) as z.output<T>[]);

const title = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title must be 200 characters or fewer");

const notes = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .max(5000, "Notes must be 5000 characters or fewer")
    .nullable(),
);

// Accepts Date objects, ISO strings, and <input type="date"> values.
const dueAt = z.preprocess(emptyToNull, z.coerce.date().nullable());

const tags = z
  .array(
    z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Tags cannot be empty")
      .max(30, "Tags must be 30 characters or fewer"),
  )
  .max(10, "A task can have at most 10 tags")
  .transform((list) => [...new Set(list)]);

const projectId = z.preprocess(emptyToNull, z.cuid().nullable());

// Shared fields with no defaults, so update doesn't inject them.
// userId comes from the session and completedAt is set server-side,
// so neither is accepted from the client.
const taskFields = z.object({
  title,
  notes,
  status: z.enum(Status),
  priority: z.enum(Priority),
  dueAt,
  tags,
  projectId,
});

// ---------------------------------------------------------------------------
// Create / update
// ---------------------------------------------------------------------------

export const createTaskSchema = taskFields.extend({
  notes: notes.optional(),
  status: z.enum(Status).default(Status.TODO),
  priority: z.enum(Priority).default(Priority.MEDIUM),
  dueAt: dueAt.optional(),
  tags: tags.default([]),
  projectId: projectId.optional(),
});

export const updateTaskSchema = taskFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

// ---------------------------------------------------------------------------
// Filtering (designed to parse URL search params)
// ---------------------------------------------------------------------------

export const taskSortFields = [
  "dueAt",
  "priority",
  "createdAt",
  "updatedAt",
  "title",
] as const;

export const taskFilterSchema = z
  .object({
    /** Free-text search on title/notes. */
    q: z.string().trim().max(100).optional(),
    status: oneOrMany(z.enum(Status)).optional(),
    priority: oneOrMany(z.enum(Priority)).optional(),
    /** A project id, or "none" for tasks without a project. */
    projectId: z.union([z.cuid(), z.literal("none")]).optional(),
    tag: z.string().trim().toLowerCase().max(30).optional(),
    dueAfter: z.coerce.date().optional(),
    dueBefore: z.coerce.date().optional(),
    sortBy: z.enum(taskSortFields).default("dueAt"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .refine((f) => !f.dueAfter || !f.dueBefore || f.dueAfter <= f.dueBefore, {
    message: "dueAfter must be on or before dueBefore",
    path: ["dueAfter"],
  });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Raw input (e.g. form values) before parsing. */
export type CreateTaskInput = z.input<typeof createTaskSchema>;
/** Parsed, normalized data ready for Prisma. */
export type CreateTaskData = z.output<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
export type UpdateTaskData = z.output<typeof updateTaskSchema>;
export type TaskFilterInput = z.input<typeof taskFilterSchema>;
export type TaskFilter = z.output<typeof taskFilterSchema>;
