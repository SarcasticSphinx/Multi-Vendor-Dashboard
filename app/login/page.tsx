"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "seller") {
      router.push("/seller");
    } else if (session?.user?.role === "buyer") {
      router.push("/customer");
    }
  }, [session, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (!res?.ok) {
      toast("Login failed");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google");
    toast("Redirecting to Google login...");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 border border-white">
        <div className="flex items-center mb-8">
          <span className="text-2xl font-bold bg-secondary text-white rounded mr-2 px-2 py-1">
            Logo
          </span>
          <span className="text-lg font-semibold text-[#222]">Sign In</span>
        </div>
        <form onSubmit={handleEmailLogin}>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 mb-4 border border-gray-600 rounded bg-white focus:outline-none focus:border-secondary"
            required
          />
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-2  border border-gray-600 rounded bg-white focus:outline-none focus:border-secondary"
            required
          />
          <p className="text-sm text-gray-500 text-right mb-6 mt-2">
            Don&apos;t have an account?{" "}
            <Link href={"/register"} className="text-secondary">
              Register
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-secondary text-white font-semibold rounded hover:opacity-90 transition mb-4"
          >
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>
        <div className="flex items-center "></div>
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 border border-secondary text-secondary font-semibold rounded hover:bg-secondary hover:text-white transition flex items-center justify-center"
        >
          <FcGoogle className="mx-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
