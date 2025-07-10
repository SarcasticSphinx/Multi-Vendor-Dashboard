import NextAuth, { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToMongoDB } from "@/lib/mongoose";
import User from "@/models/User.model";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        await connectToMongoDB();
        const { email, password } = credentials!;
        const user = await User.findOne({ email });

        if (!user) throw new Error("No user found");
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid credentials");

        return user;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      await connectToMongoDB();

      if (account?.provider === "google") {
        const existingUser = await User.findOne({ email: token.email });

        if (!existingUser) {

          const newUser = await User.create({
            name: token.name,
            email: token.email,
            image: token.picture,
            role: "customer",
          });

          token.role = newUser.role;
          token.id = newUser._id.toString();
        } else {
          token.role = existingUser.role;
          token.id = existingUser._id.toString();
        }
      }

      if (user) {
        token.role = user.role;
        token.id = user.id?.toString();
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
