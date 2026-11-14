import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { Status } from "@/generated/prisma/enums";
import type {
  CreateTaskData,
  TaskFilter,
  UpdateTaskData,
} from "@/lib/schemas/task";
import { HttpError } from "./http";
import { prisma } from "./prisma";

const notFound = () => new HttpError(404, "Task not found");

/** Make sure a project id (if given) belongs to this user. */
async function assertProjectOwned(userId: string, projectId?: string | null) {
  if (!projectId) return;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) throw new HttpError(400, "Project not found");
}

function buildWhere(userId: string, f: TaskFilter): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { userId };

  if (f.q) {
    where.OR = [
      { title: { contains: f.q, mode: "insensitive" } },
      { notes: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.status) where.status = { in: f.status };
  if (f.priority) where.priority = { in: f.priority };
  if (f.projectId) {
    where.projectId = f.projectId === "none" ? null : f.projectId;
  }
  if (f.tag) where.tags = { has: f.tag };
  if (f.dueAfter || f.dueBefore) {
    where.dueAt = { gte: f.dueAfter, lte: f.dueBefore };
  }
  return where;
}

function buildOrderBy(f: TaskFilter): Prisma.TaskOrderByWithRelationInput[] {
  // dueAt is optional; keep tasks without a due date at the end either way.
  const primary: Prisma.TaskOrderByWithRelationInput =
    f.sortBy === "dueAt"
      ? { dueAt: { sort: f.sortOrder, nulls: "last" } }
      : { [f.sortBy]: f.sortOrder };
  // Tie-breaker so results have a stable order.
  return [primary, { createdAt: "desc" }];
}

export function listTasks(userId: string, filter: TaskFilter) {
  return prisma.task.findMany({
    where: buildWhere(userId, filter),
    orderBy: buildOrderBy(filter),
  });
}

export async function getTask(userId: string, id: string) {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) throw notFound();
  return task;
}

export async function createTask(userId: string, data: CreateTaskData) {
  await assertProjectOwned(userId, data.projectId);
  return prisma.task.create({
    data: {
      ...data,
      userId,
      completedAt: data.status === Status.DONE ? new Date() : null,
    },
  });
}

export async function updateTask(
  userId: string,
  id: string,
  data: UpdateTaskData,
) {
  const existing = await getTask(userId, id);
  await assertProjectOwned(userId, data.projectId);

  // Keep completedAt in sync with status transitions.
  let completedAt: Date | null | undefined;
  if (data.status && data.status !== existing.status) {
    completedAt = data.status === Status.DONE ? new Date() : null;
  }

  return prisma.task.update({
    where: { id: existing.id },
    data: { ...data, completedAt },
  });
}

export async function deleteTask(userId: string, id: string) {
  const { count } = await prisma.task.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound();
}
