export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-4xl">🔧</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Wartung</h1>
        <p className="text-gray-400 text-lg mb-2">
          Die WitzeApp wird gerade gewartet.
        </p>
        <p className="text-gray-500 text-sm">
          Bitte versuche es später erneut.
        </p>
      </div>
    </main>
  );
}
