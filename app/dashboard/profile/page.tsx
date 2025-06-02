"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  File,
  User,
  Edit3,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bioInput, setBioInput] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, bio, role")
        .eq("id", user.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
        setBioInput(data?.bio || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSuccess("");
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBioInput(e.target.value);
    if (!profile) return;
    setProfile({ ...profile, bio: e.target.value });
    setSuccess("");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccess("");
    if (!profile) return;
    if (!e.target.files || e.target.files.length === 0) {
      setError("Please select an image file to upload.");
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();

    // Add timestamp to filename to avoid conflicts
    const timestamp = Date.now();
    const fileName = `${profile.id}_${timestamp}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError("Error uploading avatar: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      setError("Error getting public URL for avatar");
      setUploading(false);
      return;
    }

    setProfile({ ...profile, avatar_url: publicUrlData.publicUrl });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: profile.id,
          name: profile.name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          role: profile.role,
          updated_at: new Date(),
        },
        { returning: "minimal" }
      );
      if (error) throw error;

      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading profile...</span>
      </div>
    );

  if (error)
    return (
      <p className="flex items-center gap-2 text-red-600">
        <AlertCircle />
        {error}
      </p>
    );

  if (!profile) return <p>No profile data found</p>;

  return (
    <div className="p-2">
      <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg border border-gray-300">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-800">
          <User />
          My Profile
        </h2>

        <div className="mb-6">
          <label className="block font-semibold mb-2 flex items-center gap-2 text-gray-700">
            Name
            <Edit3 className="w-4 h-4 text-gray-500" />
          </label>
          <input
            type="text"
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Avatar preview */}
        {profile.avatar_url && (
          <>
            <div className="mb-4 flex items-center gap-4">
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
              />
            </div>
            <div className="text-gray-600">Current Avatar</div>
          </>
        )}

        <div className="mb-6">
          <label className="block font-semibold mb-2 flex items-center gap-2 text-gray-700">
            <File />
            Upload Avatar
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {uploading && (
            <p className="flex items-center gap-2 text-gray-600 mt-1">
              <Loader2 className="animate-spin" /> Uploading...
            </p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2 flex items-center gap-2 text-gray-700">
              <Edit3 />
              Bio
            </label>
            <textarea
              name="bio"
              value={bioInput}
              onChange={handleBioChange}
              rows={6}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Write something about yourself..."
            />
          </div>
        </div>

        <p className="mb-6 text-gray-600">
          <strong>Role:</strong> {profile.role}
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <CheckCircle />
              Save Changes
            </>
          )}
        </button>

        {success && (
          <p className="mt-4 flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle />
            {success}
          </p>
        )}
      </div>
    </div>
  );
}
