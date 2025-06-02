"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

type Pitch = {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  funding_goal: number;
  tags: string[];
  profiles?: {
    name: string;
  };
};

export default function InvestorPitchList() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [interestedPitchIds, setInterestedPitchIds] = useState<Set<string>>(
    new Set()
  );
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPitches = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not authenticated");
        return;
      }

      setUserId(user.id);

      // Fetch pitches with founder's name
      const { data: pitchesData, error: pitchError } = await supabase
        .from("pitches")
        .select(
          `
          id,
          title,
          description,
          video_url,
          funding_goal,
          tags,
          profiles(name)
        `
        )
        .order("created_at", { ascending: false });

      if (pitchError) {
        console.error("Error fetching pitches:", pitchError);
        return;
      }

      setPitches(pitchesData || []);

      // Fetch current investor's expressed interests
      const { data: interestsData, error: interestsError } = await supabase
        .from("investor_interests")
        .select("pitch_id")
        .eq("investor_id", user.id);

      if (interestsError) {
        console.error("Error fetching interests:", interestsError);
        return;
      }

      const interestedIds = new Set(interestsData?.map((i) => i.pitch_id));
      setInterestedPitchIds(interestedIds);
    };

    fetchPitches();
  }, []);

  const handleExpressInterest = async (pitchId: string) => {
    if (!userId) return;

    setLoadingIds((prev) => new Set(prev).add(pitchId));

    const { error } = await supabase.from("investor_interests").insert({
      investor_id: userId,
      pitch_id: pitchId,
    });

    if (error) {
      alert("Error expressing interest: " + error.message);
    } else {
      setInterestedPitchIds((prev) => new Set(prev).add(pitchId));
    }

    setLoadingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(pitchId);
      return newSet;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-2">
      <h1 className="text-2xl font-bold mb-2">Available Pitches</h1>

      {pitches.length === 0 ? (
        <p className="text-gray-500">No pitches available.</p>
      ) : (
        <ul className="space-y-4">
          {pitches.map((pitch) => {
            const isInterested = interestedPitchIds.has(pitch.id);
            const isLoading = loadingIds.has(pitch.id);

            return (
              <li
                key={pitch.id}
                className="border border-gray-300 rounded p-4 -sm bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{pitch.title}</h2>
                    <p className="text-sm text-gray-500">
                      by {pitch.profiles?.name || "Unknown Founder"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/dashboard/investor/pitches/${pitch.id}`)
                    }
                    className="text-sm bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded text-blue-600"
                  >
                    View Pitch
                  </button>
                </div>

                <p className="mt-2 text-gray-700">{pitch.description}</p>

                {pitch.video_url && (
                  <p className="text-blue-600 text-sm mt-1">
                    <a href={pitch.video_url} target="_blank" rel="noreferrer">
                      Watch Video
                    </a>
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-1">
                  Funding Goal: ${pitch.funding_goal.toLocaleString()}
                </p>

                {pitch.tags?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Tags: {pitch.tags.join(", ")}
                  </p>
                )}

                <div className="mt-4">
                  {isInterested ? (
                    <span className="px-3 py-1 text-sm rounded bg-gray-300 text-gray-700">
                      Already Interested
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExpressInterest(pitch.id)}
                      disabled={isLoading}
                      className={`px-4 py-1 rounded text-white text-sm ${
                        isLoading
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {isLoading ? "Saving..." : "Express Interest"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
