"use client";
import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";
import uploadToCloudinary from "@/lib/cloudinary";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadToCloudinary(file);
      // console.log(url);
      if (!url) {
        toast("Image upload failed");
        return;
      }
      setImage(url);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      //specific admin role
      const role = email === "suhail.admin@gmail.com" ? "seller" : "customer";

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name, image }),
      });
      if (res.ok) {
        toast("Registration successful! Please sign in.");
        setEmail("");
        setName("");
        setImage("");
        setPassword("");
        setConfirmPassword("");
        router.push("/login");
      } else {
        const data = await res.json();
        toast(data.message || "Registration failed");
      }
    } catch {
      toast("Registration failed");
    }
    setLoading(false);
  };

  const handleGoogleRegister = () => {
    signIn("google", { callbackUrl: "/" });
    toast("Redirecting to Google...");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 border border-white">
        <div className="flex items-center mb-8">
          <span className="text-2xl font-bold bg-secondary text-white rounded mr-2 px-2 py-1">
            Logo
          </span>
          <span className="text-lg font-semibold text-[#222]">Register</span>
        </div>
        <form onSubmit={handleRegister}>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-2 mb-4 border border-gray-600 rounded bg-white focus:outline-none focus:border-secondary"
            required
          />
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Profile Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 mb-4 border border-gray-600 rounded bg-white focus:outline-none focus:border-secondary"
          />
          {image && (
            <img
              src={image}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-full mb-4"
            />
          )}
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
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-2 mb-4 border border-gray-600 rounded bg-white focus:outline-none focus:border-secondary"
            required
          />
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full p-2 border border-gray-600 rounded bg-white focus:outline-none focus:border-secondary"
            required
          />
          <p className="text-sm text-gray-500 text-right mb-6 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-secondary">
              Sign In
            </Link>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-secondary text-white font-semibold rounded hover:opacity-90 transition mb-4"
          >
            {loading ? "Registering..." : "Register with Email"}
          </button>
        </form>
        <button
          onClick={handleGoogleRegister}
          className="w-full py-2 border border-secondary text-secondary font-semibold rounded hover:bg-secondary hover:text-white transition flex items-center justify-center"
        >
          <FcGoogle className="mx-2" />
          Login with Google
        </button>
      </div>
    </div>
  );
}
