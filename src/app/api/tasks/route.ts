import type { NextRequest } from "next/server";
import { createTaskSchema, taskFilterSchema } from "@/lib/schemas/task";
import { requireUserId } from "@/lib/server/auth";
import {
  readJson,
  searchParamsToObject,
  withErrorHandling,
} from "@/lib/server/http";
import { createTask, listTasks } from "@/lib/server/tasks";

/** GET /api/tasks?status=TODO&priority=HIGH&q=...&sortBy=dueAt&sortOrder=asc */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId();
  const filter = taskFilterSchema.parse(
    searchParamsToObject(request.nextUrl.searchParams),
  );
  const tasks = await listTasks(userId, filter);
  return Response.json({ tasks });
});

/** POST /api/tasks */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId();
  const data = createTaskSchema.parse(await readJson(request));
  const task = await createTask(userId, data);
  return Response.json({ task }, { status: 201 });
});
