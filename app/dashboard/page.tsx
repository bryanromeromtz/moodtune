"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPlaylist } from "@/lib/api";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";


export default function DashboardPage() {
  const router = useRouter();
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("");
  const [artist, setArtist] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState<any>(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
    const token = localStorage.getItem("moodtune-token");
    const savedUser = localStorage.getItem("moodtune-user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (savedUser) setUser(JSON.parse(savedUser));

    // crear el socket.io client y guardarlo en una ref para usarlo
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002");
    socketRef.current = socket;
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  async function handleGenerate() {
    if (!mood || !genre) {
      setError("Mood y género son requeridos");
      return;
    }

    setLoading(true);
    setError("");
    setPlaylist(null);

    // creamos el job en RabbitMQ y obtenemos el jobId
    const data = await createPlaylist(mood, genre, artist || undefined);

    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // polling — preguntamos cada 2 segundos si la playlist está lista
    const jobId = data.jobId;
    // escucha el evento específico de este jobId
    socketRef.current?.on(`playlist:${jobId}`, (data) => {
      setPlaylist(data);
      setLoading(false); 
      socketRef.current?.off(`playlist:${jobId}`); // dejar de escuchar este evento para evitar fugas de memoria
    });
  }

  function handleHistory() {
    router.push("/history");
  }

  function logout() {
    localStorage.clear();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-6">
      {/* header */}
      <div className="flex justify-between items-center mb-8">
        {/* izquierda — logo y titulo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <img src="/icon.png" alt="MoodTune" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-white tracking-widest">
            MoodTune
          </h1>
        </div>

        {/* derecha — historial, email y salir */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleHistory}
            className="px-4 py-2 text-sm text-purple-400 border border-purple-500/50 rounded-lg hover:bg-purple-500/10 cursor-pointer transition-colors"
          >
            📋 Mis playlists
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

      {/* form */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">
            ¿Cómo te sientes hoy?
          </h2>

          <div className="flex flex-col gap-3">
            <textarea
              placeholder="Describe tu estado de ánimo... (ej: melancólico y nostálgico, feliz y con energía)"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              rows={3}
              className="px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white text-sm outline-none placeholder:text-white/40 resize-none"
            />
            <input
              type="text"
              placeholder="Género (ej: indie, reggaeton, jazz, rock)"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white text-sm outline-none placeholder:text-white/40"
            />
            <input
              type="text"
              placeholder="Artista de referencia (opcional)"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white text-sm outline-none placeholder:text-white/40"
            />
          </div>

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-lg text-white font-bold text-sm transition-colors cursor-pointer ${
              loading
                ? "bg-purple-900 cursor-not-allowed"
                : "bg-purple-700 hover:bg-purple-600"
            }`}
          >
            {loading ? "Generando playlist..." : "🎵 Generar Playlist"}
          </button>
          {loading && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-1/3 mb-4" />
                <div className="flex flex-col gap-3">
                {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 bg-white/10 rounded-lg" />
                    <div className="flex-1">
                        <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>

        {/* playlist resultado */}
        {playlist && playlist.tracks && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-2">Tu playlist</h2>
            <p className="text-white/50 text-sm mb-4">
              Mood: {playlist.mood} · {playlist.genre}
              {playlist.artist && ` · ${playlist.artist}`}
            </p>

            <div className="flex flex-col gap-3">
              {playlist.tracks.map((track: any) => (
                <div
                  key={track.id}
                  className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {track.image && (
                      <img
                        src={track.image}
                        alt={track.album}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {track.name}
                      </p>
                      <p className="text-white/50 text-xs truncate">
                        {track.artist} · {track.album}
                      </p>
                    </div>
                    <a
                      href={track.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 text-xs hover:text-green-300"
                    >
                      Abrir en Spotify
                    </a>
                  </div>

                  {/* preview de 30 segundos */}
                  {track.preview_url ? (
                    <audio
                      controls
                      src={track.preview_url}
                      className="w-full h-8"
                    />
                  ) : (
                    <p className="text-white/30 text-xs">
                      Preview no disponible
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
