"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

axios.defaults.baseURL = "http://localhost:3000";

export default function ProfilPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [witze, setWitze] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likesReceived, setLikesReceived] = useState(0);
  const [rang, setRang] = useState('🥉 Neuling');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("email");
    const savedUsername = localStorage.getItem("username");
    if (!token) {
      router.push("/login");
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (savedUsername) setUsername(savedUsername);
    loadProfile();  // 🔥 Vollständiges Profile laden!
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/witze/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setWitze(data.witze);
      setLikesReceived(data.likesReceived);
      setRang(data.rang);
      setUsername(data.username);  // 🔥 Live Username!
      setEmail(data.email);        // 🔥 Live Email!
    } finally {
      setLoading(false);
    }
  };


  const deleteWitz = async (id: number) => {
    if (!confirm("Witz wirklich löschen?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`/witze/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProfile();  // 🔥 Neu laden nach Delete!
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Profil Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white mb-1">
                  @{username}
                </h1>
                <p className="text-gray-400 text-sm">{email}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all text-sm font-medium"
            >
              ← Zurück zur Home
            </button>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-3xl font-black text-white">{witze.length}</p>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-medium">
              Witze gepostet
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">👍</span>
            </div>
            <p className="text-3xl font-black text-white">{likesReceived}</p>  {/* 🔥 Live! */}
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-medium">
              Likes erhalten
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-black text-white">{rang}</p>  {/* 🔥 Live! */}
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-medium">
              Rang
            </p>
          </div>
        </div>

        {/* Meine Witze */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">📝 Meine Witze</h2>
            <button
              onClick={() => router.push("/post")}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all text-sm"
            >
              ➕ Neuer Witz
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"></div>
            </div>
          )}

          {!loading && witze.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-500">📝</span>
              </div>
              <p className="text-gray-400 text-lg mb-2">Noch keine Witze</p>
              <p className="text-gray-500 text-sm mb-6">
                Deine Witze erscheinen hier.
              </p>
              <button
                onClick={() => router.push("/post")}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Ersten Witz posten
              </button>
            </div>
          )}

          <div className="space-y-3">
            {witze.map((w: any) => (
              <div
                key={w.id}
                className="group p-5 bg-gray-800/50 hover:bg-gray-750/50 border border-gray-700/50 rounded-2xl transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-100 text-lg leading-relaxed">
                      "{w.text}"
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>#{w.id}</span>
                      <span>•</span>
                      <span>{new Date(w.createdAt).toLocaleString("de-DE")}</span>
                      {w.kategorie && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {w.kategorie.emoji} {w.kategorie.name}
                          </span>
                        </>
                      )}
                      {/* 🔥 Likes anzeigen (nicht likbar!) */}
                      <div className="ml-auto flex items-center gap-1 text-red-400">
                        <span className="font-bold">{w.likes ?? 0}</span>
                        <span>👍</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWitz(w.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 font-bold text-sm rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    🗑️ Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
