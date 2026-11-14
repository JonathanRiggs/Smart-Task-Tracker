import { z } from "zod";

/** Treat "" (from an empty form field) as null so it clears the value. */
const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const name = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be 100 characters or fewer");

// Hex color like #3b82f6 or #fff (matches <input type="color"> output).
const color = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/,
      "Color must be a hex value like #3b82f6",
    )
    .nullable(),
);

// userId comes from the session, so it is never accepted from the client.
const projectFields = z.object({ name, color });

export const createProjectSchema = projectFields.extend({
  color: color.optional(),
});

export const updateProjectSchema = projectFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type CreateProjectData = z.output<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
export type UpdateProjectData = z.output<typeof updateProjectSchema>;
