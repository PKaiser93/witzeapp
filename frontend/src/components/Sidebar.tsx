"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loadKategorien();
    }
  }, []);

  const loadKategorien = async () => {
    try {
      const { data } = await axios.get("/kategorien");
      setKategorien(data);
    } finally {
      setLoading(false);
    }
  };

  const kategorienList = [
    { emoji: "🔥", name: "Alle Witze", path: "/" },
    ...kategorien.map((k: any) => ({
      emoji: k.emoji,
      name: k.name,
      path: `/?kategorie=${k.name.toLowerCase().replace(/\s+/g, "-")}`,
    })),
  ];

  return (
    <aside className="w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 fixed left-0 top-16 bottom-0 overflow-y-auto hidden md:block">
      <div className="p-6 space-y-4">
        {/* Navigation */}
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2 mb-4">
          Navigation
        </p>
        {[
          { emoji: "🏠", name: "Home", path: "/" },
          { emoji: "👤", name: "Profil", path: "/profil" },
          { emoji: "✏️", name: "Witz posten", path: "/post" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group
              ${
                pathname === item.path
                  ? "bg-indigo-600/80 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50"
              }`}
          >
            <span className="text-lg">{item.emoji}</span>
            <span>{item.name}</span>
          </button>
        ))}

        <hr className="border-gray-800/50 my-6" />

        {/* Kategorien */}
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2 mb-4">
            Kategorien
          </p>
          <div className="space-y-1">
            {kategorienList.map((kat) => (
              <button
                key={kat.name}
                onClick={() => router.push(kat.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group hover:bg-gray-800/30 border border-transparent hover:border-gray-700/50
                  ${
                    pathname.includes(
                      kat.path.split("?")[1]?.split("=")[1] || "",
                    )
                      ? "text-indigo-400 bg-indigo-900/30 border-indigo-500/30 font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
              >
                <span className="text-lg">{kat.emoji}</span>
                <span className="truncate">{kat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
