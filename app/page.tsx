"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile role:", error);
          setRole(null);
        } else {
          setRole(profile?.role || null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 max-w-md mx-auto text-center">
      <h1 className="text-4xl font-bold">Welcome to Pitch & Fund Platform</h1>

      {user ? (
        <>
          <p className="text-lg">
            You are logged in as <strong>{role || "User"}</strong>.
          </p>

          <div className="space-x-4">
            <Link
              href={`/dashboard/${role || ""}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              View Dashboard
            </Link>

            <Link
              href="/dashboard/profile"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300 transition"
            >
              View Profile
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-lg">
            Please login or sign up to access your dashboard.
          </p>
          <Link
            href="/login"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Login / Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
