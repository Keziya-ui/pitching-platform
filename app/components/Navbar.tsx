"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();

  // Update html root class
  const updateHtmlClass = (theme: "light" | "dark") => {
    const html = window.document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  // Theme toggle handler
  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    updateHtmlClass(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Fetch user session and role
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setRole(profile?.role || null);
      } else {
        setUser(null);
        setRole(null);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 px-3 py-3 flex justify-between items-center transition-colors duration-300">
      <Link href="/">
        <p className="font-bold text-lg cursor-pointer">PitchFund</p>
      </Link>

      <div className="space-x-2 flex items-center">
        {!user && (
          <>
            <Link href="/login">
              <p className="hover:underline cursor-pointer">Login</p>
            </Link>
            <Link href="/register">
              <p className="hover:underline cursor-pointer">Register</p>
            </Link>
          </>
        )}

        {user && (
          <>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 rounded hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut size={20} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
