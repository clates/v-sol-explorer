# AGENTS Instructions

## Overview
Virginia SOL Explorer is a React + TypeScript application built with Vite.  It helps homeschool families track student progress through Virginia's Standards of Learning.

## Directory Structure
- `/src` – application source code.
  - `/components` – reusable UI components (e.g., `ExportDataModal`, `SubjectStandardDisplay`).
  - `/context` – React context providers for global state (e.g., `ProfileContext`).
  - `/hooks` – custom hooks (e.g., `useStandardsData`).
  - `/assets` – client-side images and static assets.
  - Top-level files such as `App.tsx`, `main.tsx`, and style sheets define the main UI.
- `/public` – static assets served as-is, including SOL JSON files in `/public/standards`.
- `.github/workflows` – CI configuration.
- Project configuration files: `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`.

## Development Setup
- Install dependencies with `bun install`.
- Start the development server with `bun run dev`.
- Create a production build with `bun run build` and preview via `bun run preview`.

## Development Guidelines
1. **TypeScript & React**
   - Use TypeScript everywhere; avoid `any` when possible.
   - Write components as React functional components with hooks.
2. **File Organization & Naming**
   - Components belong in `src/components` and use `PascalCase` file names.
   - Hooks live in `src/hooks` and use `camelCase` names prefixed with `use`.
   - Context providers reside in `src/context`.
   - Static assets belong in `src/assets` or `public` as appropriate.
3. **Styling**
   - Prefer Tailwind CSS utility classes; minimize inline styles.
4. **Data Files**
   - Files in `public/standards` must remain valid JSON and use snake_case file names.
5. **Quality Checks**
   - Run `bun run lint` before committing to ensure code quality.
   - Keep the working tree clean and commit with descriptive messages.
6. **General Practices**
   - Do not commit build artifacts or dependencies.
   - Update relevant documentation when adding features or changing structure.

