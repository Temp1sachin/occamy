import { NextAuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER_BASE_URL!,

      async profile(profile) {
        // Farmer users created via OTP have placeholder emails
        // Check if this is a farmer
        const isFarmer = profile.email?.includes('occamy-field-ops.local');

        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!user && !isFarmer) {
          user = await prisma.user.create({
            data: {
              email: profile.email!,
              name: profile.name || profile.email!,
              username: profile.email!.split('@')[0],
              role: 'OFFICER', // Default to OFFICER, will be updated in assign-role endpoint
            },
          });
        }

        return {
          id: user?.id,
          email: user?.email,
          name: user?.name,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // On every token refresh, read role from database
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).role = token.role; // Include role in session
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
