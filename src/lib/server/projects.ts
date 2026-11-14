import "server-only";
import type {
  CreateProjectData,
  UpdateProjectData,
} from "@/lib/schemas/project";
import { HttpError } from "./http";
import { prisma } from "./prisma";

const notFound = () => new HttpError(404, "Project not found");

// Include how many tasks each project has, handy for sidebars/lists.
const withTaskCount = { _count: { select: { tasks: true } } } as const;

export function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    include: withTaskCount,
  });
}

export async function getProject(userId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: withTaskCount,
  });
  if (!project) throw notFound();
  return project;
}

export function createProject(userId: string, data: CreateProjectData) {
  return prisma.project.create({
    data: { ...data, userId },
    include: withTaskCount,
  });
}

export async function updateProject(
  userId: string,
  id: string,
  data: UpdateProjectData,
) {
  const { count } = await prisma.project.updateMany({
    where: { id, userId },
    data,
  });
  if (count === 0) throw notFound();
  return getProject(userId, id);
}

/** Deleting a project keeps its tasks; their projectId is set to null. */
export async function deleteProject(userId: string, id: string) {
  const { count } = await prisma.project.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound();
}
