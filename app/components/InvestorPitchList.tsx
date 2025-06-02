"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Pitch = {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  funding_goal: number;
  tags: string[];
  founder?: { name: string };
};

export default function InvestorPitchList() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [interestedPitchIds, setInterestedPitchIds] = useState<Set<string>>(
    new Set()
  );
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const userResp = await supabase.auth.getUser();
      const user = userResp.data.user;
      if (!user) return;

      // Get investor profile
      const profileRes = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      const profile = profileRes.data;
      if (!profile) return;

      // Fetch all pitches with founder name
      const { data: pitchesData, error } = await supabase
        .from("pitches")
        .select(
          `
    id,
    title,
    description,
    video_url,
    funding_goal,
    tags,
    profiles!fk_founder (
      name
    )
  `
        )
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching pitches:", error);

      setPitches(pitchesData || []);

      // Fetch pitches this investor is interested in
      const { data: interestsData } = await supabase
        .from("investor_interests")
        .select("pitch_id")
        .eq("investor_id", profile.id);

      const interestedIds = new Set(interestsData?.map((i) => i.pitch_id));
      setInterestedPitchIds(interestedIds);
    };

    fetchData();
  }, []);

  const handleExpressInterest = async (pitchId: string) => {
    const userResp = await supabase.auth.getUser();
    const user = userResp.data.user;
    if (!user) return;

    // Get investor profile
    const profileRes = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    const profile = profileRes.data;
    if (!profile) return;

    setLoadingIds((prev) => new Set(prev).add(pitchId));

    const { error } = await supabase.from("investor_interests").insert({
      investor_id: profile.id,
      pitch_id: pitchId,
    });

    if (!error) {
      setInterestedPitchIds((prev) => new Set(prev).add(pitchId));
    } else {
      alert("Failed to express interest: " + error.message);
    }

    setLoadingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(pitchId);
      return newSet;
    });
  };

  return (
    <div>
      {pitches.length === 0 && <p>No pitches available yet.</p>}
      <ul className="space-y-4">
        {pitches.map((pitch) => {
          const isInterested = interestedPitchIds.has(pitch.id);
          const isLoading = loadingIds.has(pitch.id);

          return (
            <li key={pitch.id} className="border rounded p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{pitch.title}</h2>
                <span className="text-sm text-gray-500">
                  by {pitch.founder?.name || "Unknown Founder"}
                </span>
              </div>
              <p>{pitch.description}</p>
              {pitch.video_url && (
                <p className="text-blue-600 text-sm">
                  <a href={pitch.video_url} target="_blank" rel="noreferrer">
                    Watch Pitch Video
                  </a>
                </p>
              )}
              <p className="text-sm text-gray-500">
                Goal: ${pitch.funding_goal}
              </p>
              {pitch.tags?.length > 0 && (
                <p className="text-xs text-gray-400">
                  Tags: {pitch.tags.join(", ")}
                </p>
              )}

              <button
                disabled={isInterested || isLoading}
                onClick={() => handleExpressInterest(pitch.id)}
                className={`mt-2 px-4 py-1 rounded ${
                  isInterested
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isInterested
                  ? "Interested"
                  : isLoading
                  ? "Saving..."
                  : "Express Interest"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
