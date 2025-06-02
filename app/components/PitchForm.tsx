"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import FinancialProjectionsForm from "../components/FinancialProjectionsForm";

type FinancialRow = {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
};

type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export default function CreatePitchPage() {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [marketSize, setMarketSize] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [teamBios, setTeamBios] = useState("");
  const [fundingGoal, setFundingGoal] = useState(0);
  const [currentFundingStatus, setCurrentFundingStatus] = useState(0);
  const [equityOffered, setEquityOffered] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [productScreenshots, setProductScreenshots] = useState<string[]>([]);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");
  const [financialProjections, setFinancialProjections] = useState<
    FinancialRow[]
  >([]);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPitchDeck, setUploadingPitchDeck] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", role: "", bio: "" },
  ]);

  // Handle change for each field of a team member
  const handleTeamMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  // Add new blank team member
  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", role: "", bio: "" }]);
  };

  // Remove team member by index
  const removeTeamMember = (index: number) => {
    const updated = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updated);
  };

  async function uploadFile(
    file: File,
    folder: string
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      if (folder === "company-logos") setUploadingLogo(true);
      if (folder === "pitch-decks") setUploadingPitchDeck(true);

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(fileName, file);

      if (folder === "company-logos") setUploadingLogo(false);
      if (folder === "pitch-decks") setUploadingPitchDeck(false);

      if (error) {
        alert("Upload error: " + error.message);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      alert("Upload failed: " + error.message);
      setUploadingLogo(false);
      setUploadingPitchDeck(false);
      return null;
    }
  }

  const handleCompanyLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = await uploadFile(file, "company-logos");
    if (url) setCompanyLogoUrl(url);
  };

  const handlePitchDeckChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    const url = await uploadFile(file, "pitch-decks");
    if (url) setPitchDeckUrl(url);
  };

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("Not authenticated");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      alert("Profile not found for this user");
      return;
    }

    try {
      const { data: pitchInsertData, error: insertError } = await supabase
        .from("pitches")
        .insert({
          title: title,
          tagline,
          description,
          problem,
          solution,
          market_size: marketSize,
          business_model: businessModel,
          team_bios: teamBios,
          funding_goal: fundingGoal,
          current_funding_status: currentFundingStatus,
          equity_offered: equityOffered,
          video_url: videoUrl,
          tags: tags.split(",").map((t) => t.trim()),
          pitch_deck_url: pitchDeckUrl,
          product_screenshots: productScreenshots,
          company_logo_url: companyLogoUrl,
          founder_id: user.id,
          financial_projections: financialProjections,
        })
        .select("id")
        .single();

      if (insertError || !pitchInsertData) {
        alert("Error creating pitch: " + insertError?.message);
        return;
      }

      alert("Pitch created successfully!");
      // optionally reset form here
    } catch (error: any) {
      alert("Failed to create pitch: " + error.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create a New Pitch</h1>

      <div>
        <label className="block font-semibold mb-1" htmlFor="startupName">
          Startup Title Name
        </label>
        <input
          id="startupName"
          type="text"
          placeholder="Startup Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      {/* Company Logo Upload */}
      <div>
        <label className="block font-semibold mb-1" htmlFor="companyLogoFile">
          Upload Company Logo
        </label>
        <input
          id="companyLogoFile"
          type="file"
          accept="image/*"
          onChange={handleCompanyLogoChange}
          className="w-full border border-gray-300 p-3 rounded"
        />
        {uploadingLogo && (
          <p className="text-sm text-gray-500">Uploading logo...</p>
        )}
        {companyLogoUrl && (
          <img
            src={companyLogoUrl}
            alt="Company Logo Preview"
            className="mt-2 h-20 object-contain"
          />
        )}
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          type="text"
          placeholder="Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Description"
          value={description}
          rows={5}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="problem">
          Problem
        </label>
        <textarea
          id="problem"
          placeholder="Problem"
          value={problem}
          rows={3}
          onChange={(e) => setProblem(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="solution">
          Solution
        </label>
        <textarea
          id="solution"
          placeholder="Solution"
          value={solution}
          rows={3}
          onChange={(e) => setSolution(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      {/* Pitch Deck Upload */}
      <div>
        <label className="block font-semibold mb-1" htmlFor="pitchDeckFile">
          Upload Pitch Deck (PDF)
        </label>
        <input
          id="pitchDeckFile"
          type="file"
          accept="application/pdf"
          onChange={handlePitchDeckChange}
          className="w-full border border-gray-300 p-3 rounded"
        />
        {uploadingPitchDeck && (
          <p className="text-sm text-gray-500">Uploading pitch deck...</p>
        )}
        {pitchDeckUrl && (
          <a
            href={pitchDeckUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-blue-600 underline"
          >
            View Uploaded Pitch Deck
          </a>
        )}
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="marketSize">
          Market Size
        </label>
        <input
          id="marketSize"
          type="text"
          placeholder="Market Size"
          value={marketSize}
          onChange={(e) => setMarketSize(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="businessModel">
          Business Model
        </label>
        <input
          id="businessModel"
          type="text"
          placeholder="Business Model"
          value={businessModel}
          onChange={(e) => setBusinessModel(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Team Members</label>
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="mb-4 p-3 border rounded border-gray-300 relative"
          >
            <input
              type="text"
              placeholder="Name"
              value={member.name}
              onChange={(e) =>
                handleTeamMemberChange(index, "name", e.target.value)
              }
              className="mb-2 w-full border border-gray-300 p-2 rounded"
            />
            <input
              type="text"
              placeholder="Role"
              value={member.role}
              onChange={(e) =>
                handleTeamMemberChange(index, "role", e.target.value)
              }
              className="mb-2 w-full border border-gray-300 p-2 rounded"
            />
            <textarea
              placeholder="Bio"
              value={member.bio}
              rows={2}
              onChange={(e) =>
                handleTeamMemberChange(index, "bio", e.target.value)
              }
              className="w-full border border-gray-300 p-2 rounded"
            />
            {teamMembers.length > 1 && (
              <button
                type="button"
                onClick={() => removeTeamMember(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addTeamMember}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          + Add Team Member
        </button>
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="fundingGoal">
          Funding Goal
        </label>
        <input
          id="fundingGoal"
          type="number"
          placeholder="Funding Goal"
          value={fundingGoal}
          onChange={(e) => setFundingGoal(parseFloat(e.target.value))}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label
          className="block font-semibold mb-1"
          htmlFor="currentFundingStatus"
        >
          Current Funding Status
        </label>
        <input
          id="currentFundingStatus"
          type="number"
          placeholder="Current Funding Status"
          value={currentFundingStatus}
          onChange={(e) => setCurrentFundingStatus(parseFloat(e.target.value))}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="equityOffered">
          Equity Offered (%)
        </label>
        <input
          id="equityOffered"
          type="number"
          placeholder="Equity Offered (%)"
          value={equityOffered}
          onChange={(e) => setEquityOffered(parseFloat(e.target.value))}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="videoUrl">
          Video URL (optional)
        </label>
        <input
          id="videoUrl"
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="tags">
          Tags (comma separated)
        </label>
        <input
          id="tags"
          type="text"
          placeholder="e.g. tech, healthcare, AI"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      {/* Product Screenshots Input - Optional, adjust as needed */}
      <div>
        <label
          className="block font-semibold mb-1"
          htmlFor="productScreenshots"
        >
          Product Screenshots URLs (comma separated)
        </label>
        <input
          id="productScreenshots"
          type="text"
          placeholder="https://example.com/screenshot1.png, https://example.com/screenshot2.png"
          value={productScreenshots.join(", ")}
          onChange={(e) =>
            setProductScreenshots(
              e.target.value.split(",").map((s) => s.trim())
            )
          }
          className="w-full border border-gray-300 p-3 rounded"
        />
      </div>

      {/* Financial Projections Form */}
      <FinancialProjectionsForm onChange={setFinancialProjections} />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Pitch
      </button>
    </div>
  );
}
