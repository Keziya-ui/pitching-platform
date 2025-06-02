"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardRedirector() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role == "founder") {
        if (window.location.pathname === "/dashboard/investor") {
          router.push("/dashboard/founder");
        }
      } else if (profile?.role === "investor") {
        if (window.location.pathname === "/dashboard/founder") {
          router.push("/dashboard/investor");
        }
      }
    };

    checkUser();
  }, [router]);

  return null;
}
