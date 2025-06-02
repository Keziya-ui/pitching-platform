"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Message {
  id: string;
  pitch_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function PitchChat({
  pitchId,
  userId,
  otherUserId,
}: {
  pitchId: string;
  userId: string;
  otherUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(pitch_id.eq.${pitchId},sender_id.eq.${userId}),and(pitch_id.eq.${pitchId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Realtime subscription to new messages
    const channel = supabase
      .channel(`messages-pitch-${pitchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `pitch_id=eq.${pitchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pitchId, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const { error } = await supabase.from("messages").insert([
      {
        pitch_id: pitchId,
        sender_id: userId,
        receiver_id: otherUserId,
        content: newMessage.trim(),
      },
    ]);

    if (!error) {
      setNewMessage("");
    } else {
      alert("Failed to send message: " + error.message);
    }
  };

  return (
    <div className="border rounded p-4 max-w-md mx-auto flex flex-col h-[400px]">
      <div className="flex-grow overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded ${
              msg.sender_id === userId
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 self-start"
            } max-w-[70%]`}
          >
            {msg.content}
            <div className="text-xs mt-1 text-gray-700 text-right">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          className="flex-grow border rounded px-3 py-2"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          disabled={newMessage.trim() === ""}
        >
          Send
        </button>
      </div>
    </div>
  );
}
