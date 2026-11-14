import type { NextRequest } from "next/server";
import { createProjectSchema } from "@/lib/schemas/project";
import { requireUserId } from "@/lib/server/auth";
import { readJson, withErrorHandling } from "@/lib/server/http";
import { createProject, listProjects } from "@/lib/server/projects";

/** GET /api/projects */
export const GET = withErrorHandling(async () => {
  const userId = await requireUserId();
  const projects = await listProjects(userId);
  return Response.json({ projects });
});

/** POST /api/projects */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId();
  const data = createProjectSchema.parse(await readJson(request));
  const project = await createProject(userId, data);
  return Response.json({ project }, { status: 201 });
});
