# Record System for CHW

A responsive Community Health Worker record-management app built with React, TypeScript, TanStack Start, and Supabase.

## Run locally (Windows, macOS, or Linux)

### 1. Install prerequisites
- Git
- Node.js 22 or newer (LTS recommended) with npm
- A Supabase project (the app uses Supabase for authentication and patient data)

### 2. Clone your own working copy

```bash
git clone https://github.com/Aryan-Gautam2930/Aryan.git
cd Aryan
```

You can also use **Code → Download ZIP** on GitHub and extract it.

### 3. Install dependencies

```bash
npm install
```

The repository includes a Bun lockfile from the source environment; npm can install from package.json. If you prefer Bun, install Bun and run `bun install` instead.

### 4. Configure your local environment

Copy `.env.example` to a new file named `.env` in the project root. Put your own Supabase project's URL and publishable/anon key in that local `.env` file.

- `VITE_SUPABASE_URL`: your Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: your Supabase publishable (or legacy anon) key
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`: server-side equivalents for local SSR

Do not put a Supabase `service_role` key or any other secret in a `VITE_*` variable. Never commit your real `.env` file. The `.env.example` file is only a template; each person should keep their own local `.env`.

### 5. Set up Supabase

Create or select a Supabase project, then apply the database schema and policies from `drizzle/migrations/0000_migration.sql` using the Supabase SQL Editor (review the SQL and project-specific settings before applying). Enable email/password authentication in Supabase Auth. Ensure row-level security (RLS) is enabled and policies scope patient, visit, reminder, and profile data to the authenticated owner. Configure your local project's allowed redirect URLs in Supabase Auth for the localhost URL shown by the dev server.

### 6. Start the app

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal (usually `http://localhost:5173`). Stop the server with Ctrl+C.

## Change settings without changing the original repository

Every person should clone or download their own copy. Edit only their local `.env` file for backend credentials, or their local source/config files for UI and behavior. These changes remain on that computer unless that person deliberately commits and pushes them. Do not edit the original owner's repository unless you have write access and intentionally push changes.

To keep your local edits separate from future updates, create a branch before editing:

```bash
git switch -c my-local-customizations
```

## Useful commands

```bash
npm run dev       # local development server
npm run build     # production build
npm run preview   # preview a production build
npm run test      # run tests
npm run lint      # lint source files
```

## Data and privacy

Patient information is sensitive health data. Use fictional data while testing. Do not use this public repository to store patient records, credentials, or exports. Each installation should use its own properly secured Supabase project and reviewed RLS policies. A local copy of the frontend is not, by itself, an offline database; patient records are stored in the configured Supabase backend.

## Important status

This repository contains the application source, but a successful local build and a production deployment have not been independently verified. Follow the setup steps above and check `npm run build`; project-specific dependency or Supabase setup issues may need to be resolved for your environment.

## Technology
- React + TypeScript
- TanStack Start / Vite
- Tailwind CSS
- Supabase Auth and database
