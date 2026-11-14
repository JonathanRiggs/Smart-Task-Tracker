import type { NextRequest } from "next/server";
import { updateProjectSchema } from "@/lib/schemas/project";
import { requireUserId } from "@/lib/server/auth";
import { readJson, withErrorHandling } from "@/lib/server/http";
import {
  deleteProject,
  getProject,
  updateProject,
} from "@/lib/server/projects";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/projects/:id */
export const GET = withErrorHandling(
  async (_request: NextRequest, { params }: Ctx) => {
    const userId = await requireUserId();
    const { id } = await params;
    const project = await getProject(userId, id);
    return Response.json({ project });
  },
);

/** PATCH /api/projects/:id — partial update */
export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: Ctx) => {
    const userId = await requireUserId();
    const { id } = await params;
    const data = updateProjectSchema.parse(await readJson(request));
    const project = await updateProject(userId, id, data);
    return Response.json({ project });
  },
);

/** DELETE /api/projects/:id — tasks in the project are kept, unassigned */
export const DELETE = withErrorHandling(
  async (_request: NextRequest, { params }: Ctx) => {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteProject(userId, id);
    return new Response(null, { status: 204 });
  },
);
