- Next.js 16 app bootstrapped with create-next-app, so running npm run dev starts Turbopack-powered SSR/ISR pages at localhost:3000
  (README.md:1).
- package.json declares dev, build, start, lint/format helpers, pm2 deployment flows for local/dev/prod, and a Sentry sourcemap step, so
  releases are handled via npm run deploy:\* followed by pm2 + Sentry CLI (package.json:8, package.json:16, package.json:20).
- Dependencies span modern React 19, Next 16, MUI 7 (core/icons/lab), rich editors (TinyMCE), drag-and-drop (@dnd-kit), Zustand, and Sentry
  tooling, reflecting an internal operations dashboard with charts, scheduling, and forms (package.json:31, package.json:35, package.json:48,
  package.json:51, package.json:62).
- \_app.js boots Sentry, wraps every page in the shared MUI theme, conditionally hides the dynamically loaded header for auth routes, and
  injects the Inter/Roboto font.className for consistent typography (pages/\_app.js:1-59; src/theme.js:1-97).
- \_document.js sets the document locale to Russian, wires in Yandex Maps + heatmap scripts, and pulls Dropzone’s stylesheet from the CDN so
  those widgets are available globally (pages/\_document.js:1-35).
- scripts/copy-tinymce.js copies TinyMCE’s oxide skin from node_modules into public/tinymce/... after installs so the editor skin is served
  statically, with extra permission handling for Windows (scripts/copy-tinymce.js:1-48).
- The default page (pages/index.js) mostly renders an empty container but sets up permissive CORS headers via getServerSideProps, which is
  useful for the many internal AJAX-heavy routes that follow (pages/index.js:1-34).

---

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
