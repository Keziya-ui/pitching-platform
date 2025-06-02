"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function PitchDetail() {
  const router = useRouter();
  const params = useParams();
  const pitchId = Array.isArray(params.id) ? params.id[0] : params.id || "";

  const [pitch, setPitch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interestStatus, setInterestStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!pitchId) return;

    const fetchPitch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pitches")
        .select(`*, founder:profiles(name)`)
        .eq("id", pitchId)
        .single();

      if (error || !data) {
        setError("Pitch not found");
        setLoading(false);
        return;
      }
      setPitch(data);
      setLoading(false);
    };

    const fetchInterestStatus = async () => {
      const user = supabase.auth.user();
      if (!user) return;

      const { data, error } = await supabase
        .from("investor_interest")
        .select("status")
        .eq("pitch_id", pitchId)
        .eq("investor_id", user.id)
        .single();

      if (!error && data) {
        setInterestStatus(data.status);
      }
    };

    fetchPitch();
    fetchInterestStatus();
  }, [pitchId]);

  const handleExpressInterest = async () => {
    setActionLoading(true);
    const user = supabase.auth.user();
    if (!user) {
      setError("You must be logged in to express interest.");
      setActionLoading(false);
      return;
    }

    // Check if interest already exists
    const { data: existing, error: existingError } = await supabase
      .from("investor_interest")
      .select("id")
      .eq("pitch_id", pitchId)
      .eq("investor_id", user.id)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      setError("Error checking interest: " + existingError.message);
      setActionLoading(false);
      return;
    }

    if (existing) {
      // Already interested - maybe implement withdraw feature here
      setError("You have already expressed interest in this pitch.");
      setActionLoading(false);
      return;
    }

    // Insert new interest
    const { error } = await supabase.from("investor_interest").insert({
      pitch_id: pitchId,
      investor_id: user.id,
      status: "interested",
    });

    if (error) {
      setError("Error expressing interest: " + error.message);
    } else {
      setInterestStatus("interested");
      setError("");
    }
    setActionLoading(false);
  };

  if (loading) return <p>Loading pitch details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!pitch) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{pitch.title}</h1>
      <p className="mb-4">{pitch.description}</p>
      {pitch.video_url && (
        <div className="mb-4">
          <iframe
            width="560"
            height="315"
            src={pitch.video_url}
            title="Pitch Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <p>
        <strong>Founder:</strong> {pitch.founder?.name || "Unknown"}
      </p>
      <p>
        <strong>Funding Goal:</strong> ${pitch.funding_goal?.toLocaleString()}
      </p>
      <p>
        <strong>Tags:</strong> {(pitch.tags ?? []).join(", ")}
      </p>

      {interestStatus === "interested" ? (
        <p className="mt-4 text-green-700 font-semibold">
          You have expressed interest in this pitch.
        </p>
      ) : (
        <button
          onClick={handleExpressInterest}
          disabled={actionLoading}
          className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {actionLoading ? "Processing..." : "Express Interest"}
        </button>
      )}
    </div>
  );
}
