"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function InvestorDashboard() {
  const [totalPitches, setTotalPitches] = useState(0);
  const [interestedCount, setInterestedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Get total pitches count
      const { count: pitchesCount, error: pitchesError } = await supabase
        .from("pitches")
        .select("*", { count: "exact", head: true });

      if (pitchesError) {
        setError("Failed to fetch pitches count: " + pitchesError.message);
        setLoading(false);
        return;
      }

      // Get count of pitches this investor is interested in
      // You can get current user id from supabase.auth.user() or session, here simplified
      const user = supabase.auth.getUser ? await supabase.auth.getUser() : null;
      const userId = user?.data?.user?.id;

      if (!userId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const { count: interestCount, error: interestError } = await supabase
        .from("investor_interests")
        .select("*", { count: "exact", head: true })
        .eq("investor_id", userId);

      if (interestError) {
        setError("Failed to fetch interests count: " + interestError.message);
        setLoading(false);
        return;
      }

      setTotalPitches(pitchesCount || 0);
      setInterestedCount(interestCount || 0);
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-3 space-y-6">
      <h1 className="text-4xl font-extrabold">Investor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-indigo-100 p-4 rounded  text-center">
          <p className="text-4xl font-bold">{totalPitches}</p>
          <p className="mt-2 font-semibold">Total Pitches</p>
        </div>
        <div className="bg-green-100 p-4 rounded  text-center">
          <p className="text-4xl font-bold">{interestedCount}</p>
          <p className="mt-2 font-semibold">Your Interested Pitches</p>
        </div>
        <div className="bg-gray-100 p-4 rounded  text-center">
          <p className="text-4xl font-bold">0</p>
          <p className="mt-2 font-semibold">Notifications</p>
        </div>
      </div>

      <nav className="flex space-x-4">
        <Link
          href="/dashboard/investor/pitches"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          View Pitches
        </Link>
        <Link
          href="/dashboard/profile"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Your Profile
        </Link>
        <Link
          href="/dashboard/messages"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Messages
        </Link>
      </nav>
    </div>
  );
}
