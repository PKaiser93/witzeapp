"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

axios.defaults.baseURL = "http://localhost:3000";

export default function PostPage() {
  const router = useRouter();
  const [kategorien, setKategorien] = useState([]);
  const [selectedKategorie, setSelectedKategorie] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    loadKategorien();
  }, []);

  const loadKategorien = async () => {
    try {
      const { data } = await axios.get("/kategorien");
      setKategorien(data);
      if (data.length > 0) setSelectedKategorie(data[0].id.toString());
    } catch (err) {
      console.error("Kategorien laden fehlgeschlagen:", err);
    }
  };

  const submitWitz = async () => {
    if (!text.trim() || !selectedKategorie) {
      setError("Text und Kategorie erforderlich");
      return;
    }
    setPosting(true);
    setError("");
    try {
      await axios.post("/witze", {
        text,
        kategorieId: parseInt(selectedKategorie),
      });
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Fehler beim Posten");
    } finally {
      setPosting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-black text-white">✏️ Witz posten</h1>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl">
          <div className="space-y-6">
            {/* Kategorie */}
            <div>
              <label className="block text-gray-300 font-medium mb-3">
                Kategorie
              </label>
              <select
                value={selectedKategorie}
                onChange={(e) => setSelectedKategorie(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl text-white focus:outline-none transition-all"
              >
                <option value="">Kategorie wählen...</option>
                {kategorien.map((k: any) => (
                  <option key={k.id} value={k.id}>
                    {k.emoji} {k.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Text */}
            <div>
              <label className="block text-gray-300 font-medium mb-3">
                Dein Witz
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Dein bester Witz hier..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all resize-vertical"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={submitWitz}
                disabled={!text.trim() || !selectedKategorie || posting}
                className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-40 transition-all"
              >
                {posting ? "Poste..." : "Witz posten 🚀"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
