"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDisplay, setUserDisplay] = useState("Laden...");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username");
      const email = localStorage.getItem("email") || "";
      setUserDisplay(username || email || "Laden...");
    }
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("username");
    }
    router.push("/login");
  };

  return (
    <nav className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => router.push("/")}
      >
        <span className="text-2xl">😂</span>
        <span className="text-white font-black text-xl tracking-tight">
          WitzeApp
        </span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all text-sm font-medium"
        >
          🏠 Home
        </button>
        <button
          onClick={() => router.push("/profil")}
          className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all text-sm font-medium"
        >
          👤 Profil
        </button>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl transition-all group"
        >
          <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
            {userDisplay.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span className="text-gray-300 text-sm hidden md:block max-w-[150px] truncate">
            {userDisplay}
          </span>
          <span className="text-gray-400 text-xs transition-transform group-hover:rotate-180">
            ▾
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-48 py-1 z-50 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                router.push("/profil");
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl text-sm font-medium transition-all"
            >
              👤 Mein Profil
            </button>
            <hr className="border-gray-800/50 my-1" />
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800/50 rounded-xl text-sm font-medium transition-all"
            >
              🚪 Abmelden
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
