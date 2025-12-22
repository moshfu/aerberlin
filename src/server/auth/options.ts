import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createTransport } from "nodemailer";
import { serverConfig } from "@/server/config";
import { prisma } from "@/lib/prisma";

const useMockAuth = serverConfig.useMockAuth;
const adminEmail = serverConfig.adminEmail;
const adminPasswordHash = serverConfig.adminPasswordHash;

const MAX_LOGIN_FAILURES = 5;
const LOGIN_BLOCK_MS = 60_000;

const loginFailures = new Map<string, { attempts: number; blockedUntil?: number }>();

const now = () => Date.now();

const isBlocked = (key: string) => {
  const entry = loginFailures.get(key);
  if (!entry?.blockedUntil) {
    return false;
  }
  if (entry.blockedUntil > now()) {
    return true;
  }
  loginFailures.delete(key);
  return false;
};

const noteFailure = (key: string) => {
  const entry = loginFailures.get(key) ?? { attempts: 0 };
  entry.attempts += 1;
  if (entry.attempts >= MAX_LOGIN_FAILURES) {
    entry.blockedUntil = now() + LOGIN_BLOCK_MS;
  }
  loginFailures.set(key, entry);
};

const resetFailures = (key: string) => {
  loginFailures.delete(key);
};

const throttleError = () =>
  new Error("Too many failed attempts. Please wait a minute before trying again.");

const transporter = createTransport({
  host: serverConfig.emailServerHost,
  port: serverConfig.emailServerPort,
  auth: {
    user: serverConfig.emailServerUser,
    pass: serverConfig.emailServerPassword,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: useMockAuth ? undefined : PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: serverConfig.nextAuthSecret,
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
          console.warn("[auth] Missing credentials payload");
          return null;
        }

        const throttleKey = credentials.email.toLowerCase();
        if (isBlocked(throttleKey)) {
          throw throttleError();
        }

        const matchesEmail = credentials.email === adminEmail;
        if (!matchesEmail) {
          noteFailure(throttleKey);
          console.warn("[auth] Email mismatch", { email: credentials.email, expected: adminEmail });
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, adminPasswordHash);
        if (!valid) {
          noteFailure(throttleKey);
          return null;
        }

        resetFailures(throttleKey);

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
      from: serverConfig.emailServerUser,
      sendVerificationRequest: async ({ identifier, url }) => {
        await transporter.sendMail({
          to: identifier,
          from: `aer berlin access <${serverConfig.emailServerUser}>`,
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
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        const base = new URL(baseUrl);
        // Ensure we stay on our host; fall back to base if cross-origin is attempted.
        if (target.origin !== base.origin) return baseUrl;
        // Force locale prefix (only "en" today) when missing.
        const pathname = target.pathname.startsWith("/en/") ? target.pathname : `/en${target.pathname}`;
        target.pathname = pathname.replace(/\/\/+/g, "/");
        return target.toString();
      } catch {
        return baseUrl;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? Role.MEMBER;
      }
      return token;
    },
  },
};
