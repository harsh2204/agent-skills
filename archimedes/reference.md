# Reference: Full Code Templates

Detailed code for every file created during scaffolding. Use these as the canonical source when generating files.

## Database Connection — `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const sqlite = new Database(process.env.DB_FILE_NAME!);

export const db = drizzle({ client: sqlite, schema });
```

**Why `bun:sqlite`?** Bun ships with a native high-performance SQLite3 driver. No extra packages needed — just import from `bun:sqlite`.

## Drizzle Config — `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
```

## Auth Server — `src/lib/auth.ts`

### Minimal (email/password only)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

### With social providers

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

### With session cookie caching

Required for `auth.api.getSession()` to work reliably in RSCs:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
```

## Auth API Route — `src/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Auth Client — `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
```

## Session Access Patterns

### In React Server Components

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### In Server Actions

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function protectedAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // proceed with action
}
```

### In Client Components

```typescript
"use client";

import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return <div>Hello, {session.user.name}</div>;
}
```

## Sign-In Form Example

```typescript
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    await signIn.email(
      { email, password },
      {
        onSuccess: () => {
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Sign-Up Form Example

```typescript
"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    await signUp.email(
      { name, email, password },
      {
        onSuccess: () => {
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Adding Application Schemas

When adding new tables beyond auth, create separate files in `src/db/schema/`:

```typescript
// src/db/schema/posts.ts
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const posts = sqliteTable("posts", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  content: text().notNull(),
  authorId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

Then add the export to `src/db/schema/index.ts`:

```typescript
export * from "./auth";
export * from "./posts";
```

Run `bunx drizzle-kit push` to sync.

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | 32+ char encryption key | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | App base URL | `http://localhost:3000` |
| `DB_FILE_NAME` | SQLite file path | `sqlite.db` |

### Optional (for social providers)

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## `.env.local` Template

```env
# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Database
DB_FILE_NAME=sqlite.db

# OAuth (optional)
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
```

## Middleware for Route Protection (Optional)

Create `src/middleware.ts` for optimistic route protection:

```typescript
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/settings", "/profile"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
```

**Note:** This is optimistic — it checks cookie presence, not validity. Always verify the session server-side in RSCs/actions for actual authorization.

## Drizzle Studio

For visual database browsing during development:

```bash
bunx drizzle-kit studio
```

Opens at `https://local.drizzle.studio`.
