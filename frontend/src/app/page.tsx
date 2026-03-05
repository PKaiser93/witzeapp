"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";

axios.defaults.baseURL = "http://localhost:3000";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [witze, setWitze] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWitz, setNewWitz] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    loadWitze();
  }, []);

  const loadWitze = async () => {
    setLoading(true);
    try {
      const kategorie = searchParams.get("kategorie");
      const url = kategorie ? `/witze?kategorie=${kategorie}` : "/witze";
      const { data } = await axios.get(url);
      setWitze(data);
    } finally {
      setLoading(false);
    }
  };

  const postWitz = async () => {
    if (!newWitz.trim()) return;
    await axios.post("/witze", { text: newWitz });
    setNewWitz("");
    loadWitze();
  };

  return (
    <AppLayout>
      <div className="space-y-6" suppressHydrationWarning>
        {/* Forum Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
                Forum
              </h1>
              <p className="text-gray-400 text-lg">{witze.length} Witze</p>
            </div>
            <button
              suppressHydrationWarning={true}
              onClick={() => router.push("/post")}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all w-full md:w-auto"
            >
              ➕ Neuer Witz
            </button>
          </div>
        </div>

        {/* Quick Post */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6">
          <div className="flex gap-3">
            <input
              key="quick-post-input"
              suppressHydrationWarning
              value={newWitz}
              onChange={(e) => setNewWitz(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && postWitz()}
              placeholder="Schnell einen Witz posten..."
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />
            <button
              onClick={postWitz}
              disabled={!newWitz.trim()}
              className="px-6 py-3 bg-indigo-600/50 hover:bg-indigo-500/70 text-white font-bold rounded-2xl border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Posten
            </button>
          </div>
        </div>

        {/* Witze Threads */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 md:p-8">
          <div className="space-y-4">
            {witze.map((w: any) => {
              const toggleLike = async (e: React.MouseEvent) => {
                e.stopPropagation();
                const token = localStorage.getItem("token");

                try {
                  await axios.patch(`/witze/${w.id}/like`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  loadWitze();  // ← Reload = Backend-State!
                } catch (error) {
                  console.error("Like failed:", error);
                }
              };

              return (
                <div
                  key={w.id}
                  className="group bg-gray-800/50 hover:bg-gray-750/70 border border-gray-700/50 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10"
                  onClick={() => router.push(`/witz/${w.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-indigo-400 text-lg">
                        {w.kategorie?.emoji || "📝"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-lg leading-relaxed line-clamp-2 group-hover:line-clamp-none">
                        "{w.text}"
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>@{w.author?.username || "Gast"}</span>
                        <span>•</span>
                        <span>
                          {new Date(w.createdAt).toLocaleDateString("de-DE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {w.kategorie && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-indigo-400">
                              {w.kategorie.emoji} {w.kategorie.name}
                            </span>
                          </>
                        )}

                        {/* 🔥 LIKE BUTTON 🔥 */}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={toggleLike}
                            className={`p-2 rounded-xl transition-all text-sm ${w.userLiked  // ← Backend Daten!
                              ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 shadow-red-500/25 shadow-lg"
                              : "bg-gray-700/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                              }`}
                            title="Like"
                          >
                            <span className="text-lg leading-none">♥</span>
                          </button>
                          <span className="font-bold text-white ml-1">{w.likes ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {witze.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-500">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Noch keine Witze
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Dieses Forum ist noch leer. Sei der Erste und poste einen Witz!
              </p>
              <button
                onClick={() => router.push("/post")}
                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Ersten Witz posten
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
