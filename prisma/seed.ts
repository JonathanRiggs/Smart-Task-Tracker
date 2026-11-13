import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Priority, PrismaClient, Status } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_USER_ID = "seed-user";
const DAY = 24 * 60 * 60 * 1000;

/** Date relative to now, so "overdue" / "upcoming" stay true whenever the seed runs. */
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY);

type ProjectKey = "work" | "personal" | "learning";

type SeedTask = {
  title: string;
  notes?: string;
  status?: Status;
  priority?: Priority;
  dueInDays?: number;
  completedDaysAgo?: number;
  tags?: string[];
  project?: ProjectKey;
};

const projects: Record<ProjectKey, { name: string; color: string }> = {
  work: { name: "Work", color: "#3b82f6" },
  personal: { name: "Personal", color: "#22c55e" },
  learning: { name: "Learning", color: "#a855f7" },
};

const tasks: SeedTask[] = [
  // Work — mix of overdue, today, upcoming
  {
    title: "Finish Q4 planning doc",
    notes: "Include headcount and roadmap sections.",
    status: Status.IN_PROGRESS,
    priority: Priority.URGENT,
    dueInDays: -2,
    tags: ["planning", "writing"],
    project: "work",
  },
  {
    title: "Review PR for auth refactor",
    priority: Priority.HIGH,
    dueInDays: 0,
    tags: ["code-review"],
    project: "work",
  },
  {
    title: "Prepare sprint demo",
    status: Status.TODO,
    priority: Priority.HIGH,
    dueInDays: 1,
    tags: ["meeting"],
    project: "work",
  },
  {
    title: "Update onboarding docs",
    priority: Priority.LOW,
    dueInDays: 10,
    tags: ["writing", "docs"],
    project: "work",
  },
  {
    title: "Fix flaky CI test in payments suite",
    notes: "Fails ~1 in 10 runs, likely a timing issue.",
    status: Status.IN_PROGRESS,
    priority: Priority.MEDIUM,
    dueInDays: 3,
    tags: ["bug", "ci"],
    project: "work",
  },
  {
    title: "1:1 with manager",
    priority: Priority.MEDIUM,
    dueInDays: 4,
    tags: ["meeting"],
    project: "work",
  },
  {
    title: "Ship dark mode toggle",
    status: Status.DONE,
    priority: Priority.MEDIUM,
    dueInDays: -5,
    completedDaysAgo: 6,
    tags: ["frontend"],
    project: "work",
  },
  {
    title: "Migrate logging to structured format",
    status: Status.DONE,
    priority: Priority.HIGH,
    dueInDays: -1,
    completedDaysAgo: 1,
    tags: ["backend"],
    project: "work",
  },
  {
    title: "Evaluate old analytics vendor",
    status: Status.ARCHIVED,
    priority: Priority.LOW,
    tags: ["research"],
    project: "work",
  },

  // Personal
  {
    title: "Renew passport",
    notes: "Need new photos first.",
    priority: Priority.URGENT,
    dueInDays: -7,
    tags: ["errands", "admin"],
    project: "personal",
  },
  {
    title: "Book dentist appointment",
    priority: Priority.MEDIUM,
    dueInDays: 0,
    tags: ["health"],
    project: "personal",
  },
  {
    title: "Grocery run",
    priority: Priority.LOW,
    dueInDays: 1,
    tags: ["errands"],
    project: "personal",
  },
  {
    title: "Plan weekend hike",
    status: Status.IN_PROGRESS,
    priority: Priority.LOW,
    dueInDays: 5,
    tags: ["outdoors"],
    project: "personal",
  },
  {
    title: "Pay electricity bill",
    status: Status.DONE,
    priority: Priority.HIGH,
    dueInDays: -3,
    completedDaysAgo: 4,
    tags: ["bills", "admin"],
    project: "personal",
  },
  {
    title: "Call mom",
    status: Status.DONE,
    priority: Priority.MEDIUM,
    completedDaysAgo: 2,
    tags: ["family"],
    project: "personal",
  },
  {
    title: "Sort out garage",
    priority: Priority.LOW,
    tags: ["home"],
    project: "personal",
  },

  // Learning
  {
    title: "Read Next.js 16 release notes",
    status: Status.IN_PROGRESS,
    priority: Priority.MEDIUM,
    dueInDays: 2,
    tags: ["reading", "nextjs"],
    project: "learning",
  },
  {
    title: "Complete Prisma 7 migration tutorial",
    priority: Priority.MEDIUM,
    dueInDays: 7,
    tags: ["prisma", "tutorial"],
    project: "learning",
  },
  {
    title: "Write blog post on server actions",
    priority: Priority.LOW,
    dueInDays: 21,
    tags: ["writing", "nextjs"],
    project: "learning",
  },
  {
    title: "Finish TypeScript generics course",
    status: Status.DONE,
    priority: Priority.MEDIUM,
    completedDaysAgo: 10,
    tags: ["typescript", "course"],
    project: "learning",
  },
  {
    title: "Learn Rust basics",
    status: Status.ARCHIVED,
    priority: Priority.LOW,
    tags: ["rust"],
    project: "learning",
  },

  // Inbox — no project
  {
    title: "Reply to Sam's email",
    priority: Priority.HIGH,
    dueInDays: -1,
    tags: ["email"],
  },
  {
    title: "Back up laptop",
    priority: Priority.MEDIUM,
    dueInDays: 2,
  },
  {
    title: "Look into standing desk options",
    priority: Priority.LOW,
    tags: ["research", "home"],
  },
  {
    title: "Cancel unused subscription",
    status: Status.DONE,
    priority: Priority.MEDIUM,
    completedDaysAgo: 3,
    tags: ["admin"],
  },
  { title: "Random idea: habit tracker widget" },
];

async function main() {
  // Start clean: deleting the user cascades to its projects and tasks.
  await prisma.user.deleteMany({ where: { id: SEED_USER_ID } });

  await prisma.user.create({
    data: {
      id: SEED_USER_ID,
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  const projectIds = {} as Record<ProjectKey, string>;
  for (const [key, data] of Object.entries(projects) as [
    ProjectKey,
    (typeof projects)[ProjectKey],
  ][]) {
    const project = await prisma.project.create({
      data: { ...data, userId: SEED_USER_ID },
    });
    projectIds[key] = project.id;
  }

  await prisma.task.createMany({
    data: tasks.map((t) => ({
      title: t.title,
      notes: t.notes,
      status: t.status ?? Status.TODO,
      priority: t.priority ?? Priority.MEDIUM,
      dueAt: t.dueInDays === undefined ? null : daysFromNow(t.dueInDays),
      completedAt:
        t.completedDaysAgo === undefined
          ? null
          : daysFromNow(-t.completedDaysAgo),
      tags: t.tags ?? [],
      userId: SEED_USER_ID,
      projectId: t.project ? projectIds[t.project] : null,
    })),
  });

  console.log(
    `Seeded 1 user, ${Object.keys(projects).length} projects, ${tasks.length} tasks.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
