import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const transporter = createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT,
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in",
    verifyRequest: "/auth/verify",
  },
  providers: [
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
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    async signIn({ user }) {
      return Boolean(user.email);
    },
  },
};
