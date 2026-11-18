import { Priority } from "@/generated/prisma/browser";

const PRIORITY_TAG: Record<Priority, string> = {
  [Priority.LOW]: "is-info",
  [Priority.MEDIUM]: "is-warning",
  [Priority.HIGH]: "is-danger",
  [Priority.URGENT]: "is-danger is-dark",
};

export function priorityTagClass(priority: Priority): string {
  return PRIORITY_TAG[priority] ?? "is-light";
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

/** Dates arrive as Date objects from Server Components (RSC serializes them). */
export function formatDate(value: Date | string): string {
  return dateFormat.format(new Date(value));
}
