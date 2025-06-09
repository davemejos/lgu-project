import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo credentials for immediate access
        if (credentials.email === 'demo@admin.com' && credentials.password === 'demo123') {
          return {
            id: '1',
            email: 'demo@admin.com',
            name: 'Demo Admin',
          }
        }

        // Also allow any user from the database with demo123 password
        if (credentials.password === 'demo123') {
          try {
            const user = await db.findUserByEmail(credentials.email)
            if (user) {
              return {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
              }
            }
          } catch {
            // Continue to normal auth flow
          }
        }

        try {
          const user = await db.findUserByEmail(credentials.email)

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
