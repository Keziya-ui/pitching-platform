"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Mail, Lock, User, Loader2, Briefcase } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"founder" | "investor">("founder");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .insert({ id: data.user.id, name, role })
        .single();

      setMessage("Check your email to confirm your account.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl -lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create an Account
        </h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          Join as a founder or investor
        </p>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Briefcase
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "founder" | "investor")
              }
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="founder">Founder</option>
              <option value="investor">Investor</option>
            </select>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Registering..." : "Register"}
          </button>

          {message && (
            <p className="text-sm text-center text-gray-700">{message}</p>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
