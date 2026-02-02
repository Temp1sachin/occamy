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
        // Extract role from Auth0 custom claim (single string, not array)
        const auth0Role = profile['https://occamy-field-ops/role'];
        const roleFromAuth0 = typeof auth0Role === 'string' ? auth0Role : 'OFFICER';

        // Look up or create user in database
        let dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        // If user doesn't exist, create with role from Auth0
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || profile.email,
              username: profile.email.split('@')[0],
              password: '', // Auth0 handles password
              role: roleFromAuth0, // Use single string role
            },
          });
        }

        // Return user object with role as string
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role, // ADMIN | OFFICER (string)
          username: dbUser.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // String: ADMIN | OFFICER
        token.email = user.email;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string; // String: ADMIN | OFFICER
        (session.user as any).email = token.email;
        (session.user as any).username = token.username;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
