import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL; // ✅ Use env variable

// Example API call
export async function getHello(): Promise<{ message: string }> {
  const res = await axios.get<{ message: string }>(`${API_BASE}/api/hello`);
  return res.data;
}
