const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// lee el JWT del localStorage
// se llama en cada request que necesita autenticación
function getToken() {
  return localStorage.getItem("moodtune-token");
}

// construye los headers para requests autenticados
// si hay token agrega Authorization: Bearer <token>
// si no hay token solo agrega Content-Type
function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// llama a POST /auth/register
// no necesita token porque el usuario aún no está autenticado
export async function register(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// llama a POST /auth/login
// retorna { token, user } que guardamos en localStorage
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// llama a POST /playlists con el token en el header
// el backend mete el job a RabbitMQ y retorna el jobId
// artist es opcional por eso lleva el ?
export async function createPlaylist(
  mood: string,
  genre: string,
  artist?: string
) {
  const res = await fetch(`${API_URL}/playlists`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ mood, genre, artist }),
  });
  return res.json();
}

// obtiene una playlist específica por su jobId
// el frontend la usa para hacer polling — preguntar cada cierto tiempo
// si la playlist ya está lista (status: completed)
export async function getPlaylist(jobId: string) {
  const res = await fetch(`${API_URL}/playlists/${jobId}`, {
    headers: authHeaders(),
  });
  return res.json();
}

// obtiene todas las playlists del usuario autenticado
// se usa en el historial de playlists
export async function getPlaylists() {
  const res = await fetch(`${API_URL}/playlists`, {
    headers: authHeaders(),
  });
  return res.json();
}