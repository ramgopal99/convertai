import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export { handler as GET, handler as POST }