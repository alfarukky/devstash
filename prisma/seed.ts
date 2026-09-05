import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_USER_EMAIL = "demo@devstash.io";

const ITEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
] as const;

async function main() {
  console.log("Seeding database...");

  // Reset previous seed data so this script can be re-run safely.
  await prisma.itemType.deleteMany({ where: { isSystem: true } });
  await prisma.user.deleteMany({ where: { email: DEMO_USER_EMAIL } });

  const passwordHash = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  const typeIdByName = new Map<string, string>();
  for (const type of ITEM_TYPES) {
    const created = await prisma.itemType.create({
      data: { name: type.name, icon: type.icon, color: type.color, isSystem: true },
    });
    typeIdByName.set(type.name, created.id);
  }

  const snippetTypeId = typeIdByName.get("snippet")!;
  const promptTypeId = typeIdByName.get("prompt")!;
  const commandTypeId = typeIdByName.get("command")!;
  const linkTypeId = typeIdByName.get("link")!;

  const reactPatterns = await prisma.collection.create({
    data: {
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
    },
  });

  await prisma.item.createMany({
    data: [
      {
        title: "useDebounce Hook",
        description: "Debounce a fast-changing value, e.g. for search inputs",
        contentType: "text",
        language: "typescript",
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
`,
        userId: user.id,
        typeId: snippetTypeId,
        collectionId: reactPatterns.id,
      },
      {
        title: "Compound Component Pattern",
        description: "A Tabs component built with context + compound components",
        contentType: "text",
        language: "typescript",
        content: `import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs.* components must be used within <Tabs>");
  return context;
}

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabsContext.Provider>;
}

Tabs.List = function TabsList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button role="tab" aria-selected={activeTab === value} onClick={() => setActiveTab(value)}>
      {children}
    </button>
  );
};

Tabs.Panel = function TabsPanel({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
};
`,
        userId: user.id,
        typeId: snippetTypeId,
        collectionId: reactPatterns.id,
      },
      {
        title: "Array Utility Functions",
        description: "chunk, unique, and groupBy helpers",
        contentType: "text",
        language: "typescript",
        content: `export function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function groupBy<T, K extends string | number>(
  items: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return items.reduce(
    (groups, item) => {
      const groupKey = key(item);
      groups[groupKey] ??= [];
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
}
`,
        userId: user.id,
        typeId: snippetTypeId,
        collectionId: reactPatterns.id,
      },
    ],
  });

  const aiWorkflows = await prisma.collection.create({
    data: {
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
    },
  });

  await prisma.item.createMany({
    data: [
      {
        title: "Code Review Prompt",
        description: "Review a code change for correctness, security, and readability",
        contentType: "text",
        content: `Review the following code for correctness, security, and readability. For each issue found, explain the risk and suggest a specific fix. Do not rewrite the whole file — point to exact lines.

Code:
{{code}}`,
        userId: user.id,
        typeId: promptTypeId,
        collectionId: aiWorkflows.id,
      },
      {
        title: "Documentation Generator Prompt",
        description: "Generate concise docs for a function or module",
        contentType: "text",
        content: `Generate concise documentation for the following function or module. Include: a one-sentence summary, parameter descriptions, return value, and one usage example. Skip anything already obvious from the signature.

Code:
{{code}}`,
        userId: user.id,
        typeId: promptTypeId,
        collectionId: aiWorkflows.id,
      },
      {
        title: "Refactoring Assistant Prompt",
        description: "Refactor code for readability without changing behavior",
        contentType: "text",
        content: `Refactor the following code to improve readability and remove duplication, without changing its behavior. List each change you made and why. Keep the diff minimal.

Code:
{{code}}`,
        userId: user.id,
        typeId: promptTypeId,
        collectionId: aiWorkflows.id,
      },
    ],
  });

  const devOps = await prisma.collection.create({
    data: {
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  });

  await prisma.item.createMany({
    data: [
      {
        title: "Dockerfile for Next.js App",
        description: "Multi-stage production Dockerfile for a Next.js app",
        contentType: "text",
        language: "dockerfile",
        content: `FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
`,
        userId: user.id,
        typeId: snippetTypeId,
        collectionId: devOps.id,
      },
      {
        title: "Deploy to Vercel",
        description: "Deploy the current directory to production",
        contentType: "text",
        language: "bash",
        content: "vercel --prod",
        userId: user.id,
        typeId: commandTypeId,
        collectionId: devOps.id,
      },
      {
        title: "Docker Documentation",
        description: "Official Docker documentation",
        contentType: "text",
        url: "https://docs.docker.com/",
        userId: user.id,
        typeId: linkTypeId,
        collectionId: devOps.id,
      },
      {
        title: "GitHub Actions Documentation",
        description: "Official GitHub Actions documentation",
        contentType: "text",
        url: "https://docs.github.com/en/actions",
        userId: user.id,
        typeId: linkTypeId,
        collectionId: devOps.id,
      },
    ],
  });

  const terminalCommands = await prisma.collection.create({
    data: {
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
    },
  });

  await prisma.item.createMany({
    data: [
      {
        title: "Undo Last Commit (Keep Changes)",
        description: "Undo the last commit but keep the changes staged",
        contentType: "text",
        language: "bash",
        content: "git reset --soft HEAD~1",
        userId: user.id,
        typeId: commandTypeId,
        collectionId: terminalCommands.id,
      },
      {
        title: "Remove All Stopped Containers",
        description: "Clean up stopped Docker containers",
        contentType: "text",
        language: "bash",
        content: "docker container prune -f",
        userId: user.id,
        typeId: commandTypeId,
        collectionId: terminalCommands.id,
      },
      {
        title: "Find and Kill Process on a Port",
        description: "Find and kill whatever process is listening on port 3000",
        contentType: "text",
        language: "bash",
        content: "lsof -ti:3000 | xargs kill -9",
        userId: user.id,
        typeId: commandTypeId,
        collectionId: terminalCommands.id,
      },
      {
        title: "Clean Reinstall Dependencies",
        description: "Wipe node_modules and the lockfile, then reinstall",
        contentType: "text",
        language: "bash",
        content: "rm -rf node_modules package-lock.json && npm install",
        userId: user.id,
        typeId: commandTypeId,
        collectionId: terminalCommands.id,
      },
    ],
  });

  const designResources = await prisma.collection.create({
    data: {
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
    },
  });

  await prisma.item.createMany({
    data: [
      {
        title: "Tailwind CSS Documentation",
        description: "Utility-first CSS framework reference",
        contentType: "text",
        url: "https://tailwindcss.com/docs",
        userId: user.id,
        typeId: linkTypeId,
        collectionId: designResources.id,
      },
      {
        title: "shadcn/ui Components",
        description: "Composable component library built on Radix/Base UI",
        contentType: "text",
        url: "https://ui.shadcn.com/",
        userId: user.id,
        typeId: linkTypeId,
        collectionId: designResources.id,
      },
      {
        title: "Material Design 3",
        description: "Google's design system reference",
        contentType: "text",
        url: "https://m3.material.io/",
        userId: user.id,
        typeId: linkTypeId,
        collectionId: designResources.id,
      },
      {
        title: "Lucide Icons",
        description: "Open-source icon library",
        contentType: "text",
        url: "https://lucide.dev/",
        userId: user.id,
        typeId: linkTypeId,
        collectionId: designResources.id,
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
