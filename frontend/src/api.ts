import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

export async function shorten(url: string) {
  const res = await api.post("/shorten", { url });
  return res.data;
}

export async function listLinks() {
  const res = await api.get("/links");
  return res.data;
}

export default api;
