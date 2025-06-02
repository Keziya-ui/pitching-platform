"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";
import FinancialProjectionsForm from "@/app/components/FinancialProjectionsForm";

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

export default function EditPitchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // State for all pitch fields matching create form
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [marketSize, setMarketSize] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [teamBios, setTeamBios] = useState("");
  const [fundingGoal, setFundingGoal] = useState<number | "">("");
  const [currentFundingStatus, setCurrentFundingStatus] = useState<number | "">(
    ""
  );
  const [equityOffered, setEquityOffered] = useState<number | "">("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");
  const [productScreenshots, setProductScreenshots] = useState<string[]>([]);
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [financialProjections, setFinancialProjections] = useState<
    FinancialRow[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPitchDeck, setUploadingPitchDeck] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

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

  function updateTeamMember(
    index: number,
    field: keyof TeamMember,
    value: string
  ) {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // Function to upload a file
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

  // Load pitch data on mount
  useEffect(() => {
    if (!id) return;

    const fetchPitch = async () => {
      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMessage("Error loading pitch: " + error.message);
        console.error(error);
        return;
      }

      if (data) {
        setTitle(data.title || "");
        setTagline(data.tagline || "");
        setDescription(data.description || "");
        setProblem(data.problem || "");
        setSolution(data.solution || "");
        setMarketSize(data.market_size || "");
        setBusinessModel(data.business_model || "");
        setTeamMembers(Array.isArray(data.team_bios) ? data.team_bios : []);
        setFundingGoal(data.funding_goal ?? "");
        setCurrentFundingStatus(data.current_funding_status ?? "");
        setEquityOffered(data.equity_offered ?? "");
        setVideoUrl(data.video_url || "");
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : "");
        setPitchDeckUrl(data.pitch_deck_url || "");
        setProductScreenshots(data.product_screenshots || []);
        setCompanyLogoUrl(data.company_logo_url || "");
        setTeamBios(data.team_bios); // Assuming it is already an array of objects
        setFinancialProjections(data.financial_projections || []);
      }
    };

    fetchPitch();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!id) {
      setMessage("Invalid pitch ID");
      setLoading(false);
      return;
    }

    // Validate numeric fields
    if (
      fundingGoal === "" ||
      isNaN(Number(fundingGoal)) ||
      currentFundingStatus === "" ||
      isNaN(Number(currentFundingStatus)) ||
      equityOffered === "" ||
      isNaN(Number(equityOffered))
    ) {
      setMessage(
        "Please enter valid numbers for funding goal, current funding status, and equity offered"
      );
      setLoading(false);
      return;
    }

    // Validate teamBios JSON
    let parsedTeamBios = null;
    if (teamBios !== "") {
      try {
        parsedTeamBios = JSON.parse(teamBios);
      } catch (error) {
        setMessage("Team bios must be valid JSON");
        setLoading(false);
        return;
      }
    }

    // Get logged-in user id
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      setMessage("User not authenticated");
      setLoading(false);
      return;
    }
    const userId = userData.user.id;

    // Update pitch
    const { error } = await supabase
      .from("pitches")
      .update({
        title: title,
        tagline,
        description,
        problem,
        solution,
        market_size: marketSize,
        business_model: businessModel,
        team_bios: parsedTeamBios,
        funding_goal: Number(fundingGoal),
        current_funding_status: Number(currentFundingStatus),
        equity_offered: Number(equityOffered),
        video_url: videoUrl,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        pitch_deck_url: pitchDeckUrl,
        product_screenshots: productScreenshots,
        company_logo_url: companyLogoUrl,
        founder_id: userId,
        financial_projections: financialProjections,
      })
      .eq("id", id);

    if (error) {
      setMessage("Error updating pitch: " + error.message);
      setLoading(false);
      return;
    }

    setMessage("Pitch updated successfully!");
    setLoading(false);

    // Redirect to founder dashboard
    router.push("/dashboard/founder");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-3">
      <h1 className="text-2xl font-bold">Edit Pitch</h1>

      {message && (
        <div
          className={`p-3 rounded ${
            message.toLowerCase().includes("error")
              ? "bg-red-200 text-red-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Startup Name */}
        <div>
          <label htmlFor="startupName" className="block font-semibold mb-1">
            Startup Title Name
          </label>
          <input
            id="startupName"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
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

        {/* Tagline */}
        <div>
          <label htmlFor="tagline" className="block font-semibold mb-1">
            Tagline
          </label>
          <input
            id="tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-semibold mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 p-3 rounded"
            required
          />
        </div>

        {/* Problem */}
        <div>
          <label htmlFor="problem" className="block font-semibold mb-1">
            Problem
          </label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Solution */}
        <div>
          <label htmlFor="solution" className="block font-semibold mb-1">
            Solution
          </label>
          <textarea
            id="solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Market Size */}
        <div>
          <label htmlFor="marketSize" className="block font-semibold mb-1">
            Market Size
          </label>
          <input
            id="marketSize"
            type="text"
            value={marketSize}
            onChange={(e) => setMarketSize(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Business Model */}
        <div>
          <label htmlFor="businessModel" className="block font-semibold mb-1">
            Business Model
          </label>
          <input
            id="businessModel"
            type="text"
            value={businessModel}
            onChange={(e) => setBusinessModel(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Team Bios (JSON) */}
        {teamMembers.map((member, index) => (
          <div key={index} className="mb-4 p-3 border rounded space-y-2">
            <input
              type="text"
              placeholder="Name"
              value={member.name}
              onChange={(e) => updateTeamMember(index, "name", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <input
              type="text"
              placeholder="Role"
              value={member.role}
              onChange={(e) => updateTeamMember(index, "role", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <textarea
              placeholder="Bio"
              value={member.bio}
              rows={2}
              onChange={(e) => updateTeamMember(index, "bio", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <button
              type="button"
              onClick={() => removeTeamMember(index)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        {/* Funding Goal */}
        <div>
          <label htmlFor="fundingGoal" className="block font-semibold mb-1">
            Funding Goal ($)
          </label>
          <input
            id="fundingGoal"
            type="number"
            min={0}
            value={fundingGoal}
            onChange={(e) => setFundingGoal(Number(e.target.value))}
            required
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Current Funding Status */}
        <div>
          <label
            htmlFor="currentFundingStatus"
            className="block font-semibold mb-1"
          >
            Current Funding Status ($)
          </label>
          <input
            id="currentFundingStatus"
            type="number"
            min={0}
            value={currentFundingStatus}
            onChange={(e) => setCurrentFundingStatus(Number(e.target.value))}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Equity Offered */}
        <div>
          <label htmlFor="equityOffered" className="block font-semibold mb-1">
            Equity Offered (%)
          </label>
          <input
            id="equityOffered"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={equityOffered}
            onChange={(e) => setEquityOffered(Number(e.target.value))}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Video URL */}
        <div>
          <label htmlFor="videoUrl" className="block font-semibold mb-1">
            Video URL (optional)
          </label>
          <input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block font-semibold mb-1">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
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

        {/* Product Screenshots (comma separated URLs) */}
        <div>
          <label
            htmlFor="productScreenshots"
            className="block font-semibold mb-1"
          >
            Product Screenshots URLs (comma separated)
          </label>
          <input
            id="productScreenshots"
            type="text"
            value={productScreenshots.join(", ")}
            onChange={(e) =>
              setProductScreenshots(
                e.target.value
                  .split(",")
                  .map((url) => url.trim())
                  .filter((url) => url.length > 0)
              )
            }
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>

        {/* Financial Projections */}
        <div>
          <FinancialProjectionsForm
            value={financialProjections}
            onChange={setFinancialProjections}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded text-white font-semibold ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
