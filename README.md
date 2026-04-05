# Student Opportunity Finder

## Project Structure

```
apps/
  admin-portal/      # Next.js — Admin dashboard
  organizer-portal/  # Next.js — Organizer dashboard
  student-app/       # React Native (Expo) — Student mobile app
packages/
  # Shared code (auth helpers, Supabase client, types, etc.)
tools/
  scraper/           # Python scraper
```

---

## Prerequisites

- Node.js 18+
- npm 10+

Install all dependencies from the root (do this once after cloning):

```bash
npm install
```

---

## Running Individual Apps

### Admin Portal

```bash
npm run dev -w admin-portal
```

Runs on `http://localhost:3000`

---

### Organizer Portal

```bash
npm run dev -w organizer-portal
```

Runs on `http://localhost:3001`

> If both admin and organizer are running at the same time, Next.js will automatically pick the next available port.

---

### Student App (React Native)

> The student-app is currently being migrated to React Native (Expo). Instructions will be updated once set up.

---

## Running Everything at Once

```bash
npm run dev
```

This starts all apps in parallel via Turborepo.

---

## Adding Dependencies

To a specific app:

```bash
npm install <package> -w admin-portal
npm install <package> -w organizer-portal
npm install <package> -w student-app
```

To the entire repo (dev tooling):

```bash
npm install <package> -D
```

---

## Shared Code

Shared utilities (e.g. Supabase client, auth helpers, TypeScript types) live in `packages/`.

To use a shared package in an app:
1. Create a folder under `packages/` with its own `package.json` (e.g. `"name": "@repo/lib"`)
2. Add `"@repo/lib": "*"` to the app's `package.json` dependencies
3. Run `npm install` from the root

---

## Notes

- Always run `npm install` from the **root**, not inside individual app folders.
- The `student-app` will be replaced with an Expo project — do not build on top of the current Next.js scaffold there.
