import type { NextRequest } from "next/server";
import { updateTaskSchema } from "@/lib/schemas/task";
import { requireUserId } from "@/lib/server/auth";
import { readJson, withErrorHandling } from "@/lib/server/http";
import { deleteTask, getTask, updateTask } from "@/lib/server/tasks";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/tasks/:id */
export const GET = withErrorHandling(
  async (_request: NextRequest, { params }: Ctx) => {
    const userId = await requireUserId();
    const { id } = await params;
    const task = await getTask(userId, id);
    return Response.json({ task });
  },
);

/** PATCH /api/tasks/:id — partial update */
export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: Ctx) => {
    const userId = await requireUserId();
    const { id } = await params;
    const data = updateTaskSchema.parse(await readJson(request));
    const task = await updateTask(userId, id, data);
    return Response.json({ task });
  },
);

/** DELETE /api/tasks/:id */
export const DELETE = withErrorHandling(
  async (_request: NextRequest, { params }: Ctx) => {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteTask(userId, id);
    return new Response(null, { status: 204 });
  },
);
