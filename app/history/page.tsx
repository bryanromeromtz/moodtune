"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlaylists, getPlaylist } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("moodtune-token");
    const savedUser = localStorage.getItem("moodtune-user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (savedUser) setUser(JSON.parse(savedUser));
    loadPlaylists();
  }, []);

  async function loadPlaylists() {
    setLoading(true);
    const data = await getPlaylists();
    setLoading(false);
    if (!data.error) setPlaylists(data);
  }

  async function handleSelectPlaylist(jobId: string) {
    const data = await getPlaylist(jobId);
    setSelectedPlaylist(data);
  }

  function logout() {
    localStorage.clear();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-6">
      {/* header */}
      <div className="flex justify-between items-center mb-8">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <img src="/icon.png" alt="MoodTune" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-white tracking-widest">
            MoodTune
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm text-purple-400 border border-purple-500/50 rounded-lg hover:bg-purple-500/10 cursor-pointer transition-colors"
          >
            🌈 Generar vibe
          </button>
          {user && (
            <span className="text-white/50 text-sm hidden md:block">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-white/70 border border-white/20 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* lista de playlists */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">Mis playlists</h2>

          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse"
                >
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-white/10 rounded w-16" />
                    <div className="h-3 bg-white/10 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && playlists.length === 0 && (
            <p className="text-white/50 text-sm">
              No tienes playlists todavía.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {playlists.map((p: any) => (
              <button
                key={p.jobId}
                onClick={() => handleSelectPlaylist(p.jobId)}
                className={`p-4 rounded-xl text-left transition-colors cursor-pointer ${
                  selectedPlaylist?.jobId === p.jobId
                    ? "bg-purple-700/40 border border-purple-500"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <p className="text-white text-sm font-medium truncate">
                  {p.mood}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {p.genre} {p.artist && `· ${p.artist}`}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : p.status === "failed"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="text-white/30 text-xs">
                    {new Date(p.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* detalle de playlist seleccionada */}
        <div>
          {!selectedPlaylist && (
            <div className="flex items-center justify-center h-48 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-white/30 text-sm">
                Selecciona una playlist para ver las canciones
              </p>
            </div>
          )}

          {selectedPlaylist && selectedPlaylist.tracks && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h2 className="text-white font-bold text-sm mb-1 truncate">
                {selectedPlaylist.mood}
              </h2>
              <p className="text-white/50 text-xs mb-4">
                {selectedPlaylist.genre}{" "}
                {selectedPlaylist.artist && `· ${selectedPlaylist.artist}`}
              </p>
              <div className="flex flex-col gap-2">
                {selectedPlaylist.tracks.map((track: any) => (
                  <a
                    key={track.id}
                    href={track.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    {track.image && (
                      <img
                        src={track.image}
                        alt={track.album}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {track.name}
                      </p>
                      <p className="text-white/50 text-xs truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-green-400 text-xs">▶</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
