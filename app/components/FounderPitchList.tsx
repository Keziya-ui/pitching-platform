"use client";

import Link from "next/link";
import { Pitch } from "../types/index";
import { supabase } from "../../lib/supabaseClient";
import { Pencil, Trash2 } from "lucide-react";

export default function FounderPitchList({
  pitch,
  showActions = false,
}: {
  pitch: Pitch;
  showActions?: boolean;
}) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this pitch?")) {
      const { error } = await supabase
        .from("pitches")
        .delete()
        .eq("id", pitch.id);
      if (error) alert("Failed to delete pitch: " + error.message);
      else window.location.reload();
    }
  };

  // Example handleEdit function, you can adapt navigation logic to your routing
  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/founder/edit/${id}`;
  };

  return (
    <div className="border border-gray-300 rounded p-4 -sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{pitch.title}</h2>
        {showActions && (
          <div className="flex gap-3">
            <button
              onClick={() => handleEdit(pitch.id)}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <Pencil size={16} /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-2">{pitch.description}</p>

      {pitch.video_url && (
        <a
          href={pitch.video_url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 text-sm underline block mt-1"
        >
          Watch Video
        </a>
      )}

      <p className="text-sm mt-2">
        Funding Goal: ${pitch.funding_goal?.toLocaleString()}
      </p>

      {pitch.tags?.length > 0 && (
        <p className="text-xs mt-1 text-gray-400">
          Tags: {pitch.tags.join(", ")}
        </p>
      )}

      <Link
        href={`/dashboard/founder/pitches/${pitch.id}`}
        className="mt-3 inline-block text-blue-600 bg-blue-200 hover:bg-blue-300 py-2 px-2 rounded-md"
      >
        View Pitch Details
      </Link>
    </div>
  );
}
