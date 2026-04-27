import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth actif seulement si les clés sont présentes
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) throw new Error("UserNotFound");
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("WrongPassword");
        if (user.suspended) throw new Error("AccountSuspended");
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],

  callbacks: {
    // Crée le compte en base lors du premier login Google
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (existing?.suspended) return false; // bloque les comptes suspendus
        if (!existing) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: "JOBSEEKER",
              emailVerified: new Date(),
            },
          });
          await prisma.jobSeekerProfile.create({
            data: { userId: newUser.id },
          });
        }
        return true;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Après un login credentials
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      // Toujours relire le rôle et le statut depuis la base pour éviter les sessions obsolètes
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, suspended: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.suspended = dbUser.suspended;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string; suspended?: boolean }).role = token.role as string;
        (session.user as { role?: string; id?: string; suspended?: boolean }).id = token.id as string;
        (session.user as { role?: string; id?: string; suspended?: boolean }).suspended = token.suspended as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
