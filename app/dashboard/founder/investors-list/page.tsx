"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Loader2 } from "lucide-react";

interface Investor {
  investor_id: string;
  investor: {
    name: string;
    avatar_url: string | null;
  } | null;
}

interface PitchWithInvestors {
  id: string;
  title: string;
  investor_interests: Investor[];
}

export default function FounderInvestorsList() {
  const [pitches, setPitches] = useState<PitchWithInvestors[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPitchesWithInvestors = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("You must be logged in as a founder.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pitches")
        .select(
          `
          id,
          title,
          investor_interests (
            investor_id,
            investor:profiles (
              name,
              avatar_url
            )
          )
        `
        )
        .eq("founder_id", user.id)
        .order("title", { ascending: true });

      if (error) {
        setError("Failed to load pitches: " + error.message);
        setLoading(false);
        return;
      }

      setPitches(data || []);
      setLoading(false);
    };

    fetchPitchesWithInvestors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-600 mt-8 font-semibold text-lg">
        {error}
      </p>
    );
  }

  if (pitches.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-6">
        You haven’t created any pitches yet.
      </p>
    );
  }

  return (
    <div className="space-y-4 p-3">
      {pitches.map((pitch) => (
        <div
          key={pitch.id}
          className="bg-white rounded-xl border border-gray-300 p-4"
        >
          {/* Pitch Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {pitch.title}
            </h2>
            {/* Optional: Add pitch description, funding goal, etc. here later */}
            <p className="text-sm text-gray-500 mt-1">
              {pitch.investor_interests.length} investor
              {pitch.investor_interests.length !== 1 && "s"} interested
            </p>
          </div>

          {/* Investor List */}
          {pitch.investor_interests.length === 0 ? (
            <p className="text-gray-500 italic">
              No investors are interested yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {pitch.investor_interests.map(({ investor_id, investor }) => (
                <li
                  key={investor_id}
                  className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border -sm"
                >
                  <img
                    src={investor?.avatar_url ?? "/default-avatar.png"}
                    alt={investor?.name ?? "Investor"}
                    className="h-10 w-10 rounded-full object-cover border border-gray-300"
                  />
                  <span className="font-medium text-gray-800">
                    {investor?.name ?? "Unnamed Investor"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
