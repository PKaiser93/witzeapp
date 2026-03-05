"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
