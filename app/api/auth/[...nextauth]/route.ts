import NextAuth, { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToMongoDB } from "@/lib/mongoose";
import User from "@/models/User.model";
import Customer from "@/models/Customer.model";

const authOptions: NextAuthOptions = {
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
        return user.toObject();
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      await connectToMongoDB();

      if (user) {
        token.id = user.id?.toString();
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image || "";
      }

      if (account?.provider === "google" && !user) {
        const existingUser = await User.findOne({ email: token.email });

        if (!existingUser) {
          const newUser = await User.create({
            name: token.name,
            email: token.email,
            image: token.picture,
            role: "customer",
          });

          if (newUser.role === "customer") {
            try {
              await Customer.create({
                user: newUser._id,
                firstName: newUser.name?.split(" ")[0] || "",
                lastName: newUser.name?.split(" ")[1] || "",
              });
            } catch (error) {
              console.error("Error creating customer profile:", error);
              await User.findByIdAndDelete(newUser._id);
              return {};
            }
          }
          token.role = newUser.role;
          token.id = newUser._id.toString();
          token.image = newUser.image;
          token.email = newUser.email;
          token.name = newUser.name;
        } else {
          token.role = existingUser.role;
          token.id = existingUser._id.toString();
          token.image = existingUser.image;
          token.email = existingUser.email;
          token.name = existingUser.name;
        }
      }

      if (trigger === "update" && session?.user?.image !== undefined) {
        token.image = session.user.image;
      }
      if (trigger === "update" && session?.user?.name !== undefined) {
        token.name = session.user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
