"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { Pitch } from "../../types/index";
import FounderPitchList from "@/app/components/FounderPitchList";

export default function FounderDashboard() {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    const fetchPitches = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("founder_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pitches:", error.message);
        return;
      }

      setPitches(data || []);
    };

    fetchPitches();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-3 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold">Founder Dashboard</h1>
      </header>
      <Link
        href="/dashboard/founder/create"
        className="bg-blue-600 text-white px-6 py-3 rounded-md -sm hover:bg-blue-700 transition"
      >
        Create New Pitch
      </Link>

      {/* Investors Interested Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-6 border-b border-gray-300 pb-2">
          Investors Interested
        </h2>
        <Link
          href="/dashboard/founder/investors-list"
          className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 transition"
        >
          View Investors
        </Link>
      </section>

      {/* Your Pitches Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-2 border-b border-gray-300">
          Your Pitches
        </h2>

        {pitches.length === 0 ? (
          <p className="text-center text-gray-600">
            No pitches yet. Create one to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pitches.map((pitch) => (
              <div key={pitch.id}>
                <FounderPitchList pitch={pitch} showActions />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
