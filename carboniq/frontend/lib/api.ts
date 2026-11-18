const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Rec = {
  id: number;
  source: string;
  category: string;
  amount: number;
  date: string;
};

export type Summary = {
  total: number;
  by_month: { month: string; amount: number }[];
  by_category: { category: string; amount: number }[];
};

export const CATEGORIES = ["Electricity", "Fuel", "Transport", "Waste", "Process"];

export function getToken() {
  return typeof window === "undefined" ? null : localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Check your input and try again"
    );
  }
  return body as T;
}
