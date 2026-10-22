// Small fetch wrapper for the CampusKhoj API.
// In development, Vite proxies "/api" to the Express server (see vite.config.js).

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("campuskhoj_token");
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  getItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/items${qs ? `?${qs}` : ""}`);
  },
};
