# Web Dashboard (SvelteKit)

Web dashboard for Claude Code Zen, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory (example)
pnpm dlx create-svelte@latest .

# create a new project in my-app (example)
pnpm dlx create-svelte@latest my-app
```

## Developing

Once you've installed dependencies with `pnpm install`, start a development server (pnpm only):

```bash
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

Note: This repository uses pnpm exclusively. Avoid npm/yarn/npx; use `pnpm` and `pnpm dlx` instead.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
