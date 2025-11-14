import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createTransport } from "nodemailer";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const useMockAuth = env.USE_MOCK_AUTH === "true";
const MOCK_ADMIN_HASH = "$2b$10$E6gTn6zkRgZNpmjDoE7Yd.8iTIQ6kGsE2wVqbodIZ6hO6PvxI6Bjq"; // "admin"

const adminEmail = env.ADMIN_EMAIL ?? (useMockAuth ? "admin@mock.local" : undefined);
const adminPasswordHash = env.ADMIN_PASSWORD_HASH ?? (useMockAuth ? MOCK_ADMIN_HASH : undefined);

if (!useMockAuth && (!adminEmail || !adminPasswordHash)) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be configured when USE_MOCK_AUTH=false");
}

const transporter = createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT,
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: useMockAuth ? undefined : PrismaAdapter(prisma),
  session: {
    strategy: useMockAuth ? "jwt" : "database",
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in",
    verifyRequest: "/auth/verify",
  },
  providers: [
    CredentialsProvider({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        if (!adminEmail || credentials.email !== adminEmail) {
          return null;
        }
        if (!adminPasswordHash) {
          return null;
        }
        const valid = await bcrypt.compare(credentials.password, adminPasswordHash);
        if (!valid) {
          return null;
        }
        if (useMockAuth) {
          return {
            id: "mock-admin",
            email: adminEmail,
            role: Role.ADMIN,
            name: "Admin",
          };
        }
        const user = await prisma.user.upsert({
          where: { email: credentials.email },
          update: {
            role: Role.ADMIN,
          },
          create: {
            email: credentials.email,
            role: Role.ADMIN,
            name: "Admin",
          },
        });
        return user;
      },
    }),
    EmailProvider({
      from: env.EMAIL_SERVER_USER,
      sendVerificationRequest: async ({ identifier, url }) => {
        await transporter.sendMail({
          to: identifier,
          from: `aer berlin access <${env.EMAIL_SERVER_USER}>`,
          subject: "Your aer berlin secure login link",
          text: `Sign in to aer berlin: ${url}`,
          html: `<p>Secure link for the aer berlin console.</p><p><a href="${url}">Sign in</a></p>`,
        });
      },
      maxAge: 60 * 60, // 1 hour
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      const role = (user?.role as Role | undefined) ?? (token?.role as Role | undefined) ?? Role.MEMBER;
      const id = user?.id ?? (token?.sub as string | undefined);
      if (session.user) {
        if (id) {
          session.user.id = id;
        }
        session.user.role = role;
      }
      return session;
    },
    async signIn({ user }) {
      return Boolean(user.email);
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? Role.MEMBER;
      }
      return token;
    },
  },
};
