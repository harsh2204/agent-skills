# Examples: Common Extension Patterns

Patterns for extending the scaffolded project beyond the base setup.

## Adding GitHub OAuth

### 1. Update environment

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 2. Update `src/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### 3. Client usage

```typescript
import { signIn } from "@/lib/auth-client";

// In a component
<Button onClick={() => signIn.social({ provider: "github" })}>
  Sign in with GitHub
</Button>
```

No schema changes needed — better-auth stores OAuth accounts in the existing `account` table.

---

## Adding a Protected Dashboard Layout

### `src/app/(protected)/layout.tsx`

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
```

### `src/app/(protected)/dashboard/page.tsx`

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome back, {session!.user.name}
      </p>
    </div>
  );
}
```

---

## Adding a New Database Table

Example: adding a `projects` table.

### 1. Create schema file `src/db/schema/projects.ts`

```typescript
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const projects = sqliteTable("projects", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  ownerId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

### 2. Export from barrel `src/db/schema/index.ts`

```typescript
export * from "./auth";
export * from "./projects";
```

### 3. Push to database

```bash
bunx drizzle-kit push
```

### 4. Query in a server component

```typescript
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

const userProjects = await db
  .select()
  .from(projects)
  .where(eq(projects.ownerId, session.user.id));
```

---

## Server Actions with Auth

### `src/app/(protected)/dashboard/actions.ts`

```typescript
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  await db.insert(projects).values({
    name,
    description,
    ownerId: session.user.id,
  });

  revalidatePath("/dashboard");
}
```

---

## Sign-Out Button

```typescript
"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await signOut({
          fetchOptions: {
            onSuccess: () => router.push("/sign-in"),
          },
        });
      }}
    >
      Sign Out
    </Button>
  );
}
```

---

## Adding shadcn Components

Install commonly needed components in one shot:

```bash
bunx --bun shadcn@latest add button card input label form separator avatar dropdown-menu sonner
```

For a full auth-ready UI set:

```bash
bunx --bun shadcn@latest add button card input label form tabs separator avatar dropdown-menu sheet sidebar sonner badge
```

---

## Switching to Turso (Remote SQLite)

If the project outgrows local SQLite:

### 1. Install libsql client

```bash
bun add @libsql/client
```

### 2. Update `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
  schema,
});
```

### 3. Update `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
```

### 4. Update env

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

No changes needed to schema files, auth config, or queries.
