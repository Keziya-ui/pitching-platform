"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PitchDetailsChart from "@/app/components/PitchDetailsChart";

interface InvestorInterest {
  investor_id: string;
  status: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

interface FinancialProjection {
  year: number;
  revenue: number;
  expenses: number;
}

interface PitchDetail {
  id: string;
  title: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  market_size: string;
  business_model: string;
  team_bios: string;
  funding_goal: number;
  current_funding_status: number;
  equity_offered: number;
  video_url: string;
  tags: string[];
  pitch_deck_url: string;
  product_screenshots: string[];
  company_logo_url: string;
  founder_id: string;
  financial_projections: FinancialProjection[];
  profiles: {
    name: string;
    avatar_url: string | null;
  };
  investor_interests: InvestorInterest[];
}

export default function PitchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pitchId = params?.id;

  const [pitch, setPitch] = useState<PitchDetail | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interestStatus, setInterestStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchPitch = async () => {
      if (!pitchId) {
        setError("Invalid pitch ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("Please login to view this page");
        setLoading(false);
        return;
      }
      setUser(userData.user);

      const { data, error } = await supabase
        .from("pitches")
        .select(
          `
          id,
          title,
          tagline,
          description,
          problem,
          solution,
          market_size,
          business_model,
          team_bios,
          funding_goal,
          current_funding_status,
          equity_offered,
          video_url,
          tags,
          pitch_deck_url,
          product_screenshots,
          company_logo_url,
          founder_id,
          financial_projections,
          profiles (
            name,
            avatar_url
          ),
          investor_interests (
            investor_id,
            status,
            profiles (
              name,
              avatar_url
            )
          )
        `
        )
        .eq("id", pitchId)
        .single();

      if (error || !data) {
        setError(error?.message || "Pitch not found");
        setLoading(false);
        return;
      }

      setPitch(data);

      // Investor interest check
      if (data.investor_interests) {
        const interest = data.investor_interests.find(
          (i: InvestorInterest) => i.investor_id === userData.user.id
        );
        setInterestStatus(interest?.status || null);
      }

      setLoading(false);
    };

    fetchPitch();
  }, [pitchId]);

  const toggleInterest = async () => {
    if (!user || !pitch) return;

    if (interestStatus) {
      const { error } = await supabase
        .from("investor_interests")
        .delete()
        .eq("pitch_id", pitch.id)
        .eq("investor_id", user.id);

      if (error) alert("Error withdrawing interest: " + error.message);
      else setInterestStatus(null);
    } else {
      const { error } = await supabase.from("investor_interests").insert([
        {
          pitch_id: pitch.id,
          investor_id: user.id,
          status: "interested",
        },
      ]);

      if (error) alert("Error expressing interest: " + error.message);
      else setInterestStatus("interested");
    }
  };

  const updateInterestStatus = async (
    investorId: string,
    newStatus: string
  ) => {
    if (!pitch) return;

    const { error } = await supabase
      .from("investor_interests")
      .update({ status: newStatus })
      .eq("pitch_id", pitch.id)
      .eq("investor_id", investorId);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      setPitch((prev) => {
        if (!prev) return prev;
        const updatedInterests = prev.investor_interests.map((i) =>
          i.investor_id === investorId ? { ...i, status: newStatus } : i
        );
        return { ...prev, investor_interests: updatedInterests };
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!pitch) return <p>Pitch not found</p>;

  const isFounder = user?.id === pitch.founder_id;

  const projectionsWithProfit = (pitch.financial_projections || []).map(
    (p) => ({
      ...p,
      profit: p.revenue - p.expenses,
    })
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 space-y-3">
      {/* Header */}
      <div className="flex items-center border border-gray-300 rounded-md p-2 gap-4">
        <img
          src={pitch.company_logo_url || "/default-logo.png"}
          alt="Company Logo"
          className="w-16 h-16 rounded-full border border-gray-300 object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">{pitch.title}</h1>
          <p className="text-gray-500">{pitch.tagline}</p>
        </div>
      </div>

      {/* Description */}
      <div className="border border-gray-300 rounded-md p-6">
        <p className="text-lg text-gray-700">{pitch.description}</p>
      </div>

      {/* Key Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-300 rounded-md p-3 space-y-2">
          <Detail label="Problem" value={pitch.problem} />
          <Detail label="Solution" value={pitch.solution} />
          <Detail label="Market Size" value={pitch.market_size} />
          <Detail label="Business Model" value={pitch.business_model} />
        </div>
        <div className="border border-gray-300 rounded-md p-6 space-y-2">
          <Detail
            label="Funding Goal"
            value={`$${pitch.funding_goal.toLocaleString()}`}
          />
          <Detail
            label="Current Funding"
            value={`$${pitch.current_funding_status}`}
          />
          <Detail label="Equity Offered" value={`${pitch.equity_offered}%`} />
          <Detail label="Tags" value={pitch.tags.join(", ")} />
        </div>
      </div>

      {/* Team */}
      {pitch.team_bios &&
        Array.isArray(pitch.team_bios) &&
        pitch.team_bios.map((member, index) => (
          <div
            className="flex items-center border border-gray-300 rounded-md p-3"
            key={index}
          >
            <img
              src={member.avatar_url || "/default-avatar.png"}
              alt="Team Member Avatar"
              className="w-16 h-16 rounded-full border border-gray-300 object-cover"
            />
            <div className="p-1">
              <h4 className="text-lg font-semibold">{member.name}</h4>
              <p className="text-gray-600">
                <strong>Role: </strong>
                {member.role}
              </p>
              <p className="text-gray-600">
                <strong>Experience:</strong>
                {member.experience}
              </p>
            </div>
          </div>
        ))}

      {/* Pitch Video */}
      {pitch.video_url && (
        <div className="border border-gray-300 rounded-md p-3">
          <h2 className="text-xl font-semibold mb-2">Pitch Video</h2>
          <iframe
            src={pitch.video_url}
            className="w-full h-64 rounded border"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Pitch Deck */}
      {pitch.pitch_deck_url && (
        <div className="border border-gray-300 rounded-md p-6">
          <a
            href={pitch.pitch_deck_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium underline"
          >
            View Pitch Deck
          </a>
        </div>
      )}

      {/* Product Screenshots */}
      {pitch.product_screenshots?.length > 0 && (
        <div className="border border-gray-300 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">Product Screenshots</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pitch.product_screenshots.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Screenshot ${idx + 1}`}
                className="w-full h-auto rounded-lg border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Financial Chart */}
      {projectionsWithProfit.length > 0 && (
        <div className="border border-gray-300 rounded-md p-3">
          <PitchDetailsChart projections={projectionsWithProfit} />
        </div>
      )}

      {/* Investor Section */}
      <div className="bg-white rounded-lg p-3">
        {isFounder ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Investor Interests</h2>
            {pitch.investor_interests.length === 0 ? (
              <p className="text-gray-600">
                No investors have shown interest yet.
              </p>
            ) : (
              <div className="space-y-4">
                {pitch.investor_interests.map((interest) => {
                  const isFinal = ["accepted", "rejected"].includes(
                    interest.status
                  );
                  return (
                    <div
                      key={interest.investor_id}
                      className="flex justify-between items-center p-4 border border-gray-300 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            interest.profiles.avatar_url ||
                            "/default-avatar.png"
                          }
                          className="w-10 h-10 rounded-full"
                          alt={interest.profiles.name}
                        />
                        <p>{interest.profiles.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            interest.status === "accepted"
                              ? "text-green-600"
                              : interest.status === "rejected"
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {interest.status}
                        </span>

                        {!isFinal ? (
                          <>
                            <button
                              onClick={() =>
                                updateInterestStatus(
                                  interest.investor_id,
                                  "accepted"
                                )
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                updateInterestStatus(
                                  interest.investor_id,
                                  "rejected"
                                )
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="italic text-sm text-gray-400 ml-2">
                            Already {interest.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-700 text-sm">
              Your interest status:{" "}
              <span className="font-semibold">
                {interestStatus || "Not expressed"}
              </span>
            </p>
            <button
              onClick={toggleInterest}
              className="mt-3 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            >
              {interestStatus ? "Withdraw Interest" : "Express Interest"}
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Reusable detail item
  function Detail({ label, value }: { label: string; value: string }) {
    return (
      <p>
        <span className="font-semibold text-gray-800">{label}:</span>{" "}
        <span className="text-gray-700">{value}</span>
      </p>
    );
  }
}
