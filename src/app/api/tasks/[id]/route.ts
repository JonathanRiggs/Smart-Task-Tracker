import type { NextRequest } from "next/server";
import { updateTaskSchema } from "@/lib/schemas/task";
import { requireUserId } from "@/lib/server/auth";
import { errorResponse, readJson } from "@/lib/server/http";
import { deleteTask, getTask, updateTask } from "@/lib/server/tasks";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/tasks/:id */
export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const task = await getTask(userId, id);
    return Response.json({ task });
  } catch (error) {
    return errorResponse(error);
  }
}

/** PATCH /api/tasks/:id — partial update */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const data = updateTaskSchema.parse(await readJson(request));
    const task = await updateTask(userId, id, data);
    return Response.json({ task });
  } catch (error) {
    return errorResponse(error);
  }
}

/** DELETE /api/tasks/:id */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteTask(userId, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
