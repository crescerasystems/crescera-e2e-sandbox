import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "./prisma";

// NextAuth v5 (beta) — exports auth() helper for server components,
// handlers for the API route, and signIn/signOut for client.
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: process.env.RESEND_FROM ?? "noreply@crescerasystems.com",
    }),
  ],
  session: { strategy: "database" },
});
