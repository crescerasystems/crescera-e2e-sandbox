# Agent notes for projects scaffolded from this template

This repo was generated from `crescerasystems/template-nextjs-15-prisma-resend`.
The following is true on every new generated repo:

- `prisma/schema.prisma` already contains the four NextAuth tables.
  Add project models below them — do NOT remove or rename the
  User/Account/Session/VerificationToken models; the Prisma adapter
  depends on them.
- `src/lib/auth.ts` exports the NextAuth v5 helpers. Server components
  call `await auth()` to read the session; route handlers call the
  exported `GET`/`POST` from `[...nextauth]/route.ts`.
- `src/lib/prisma.ts` exports a singleton `prisma` client.
- The repo has NOT been initialised with `npx prisma migrate dev` —
  the first generated migration is the coder's responsibility once
  the project-specific schema is added.
