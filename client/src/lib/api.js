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

// Variant for multipart uploads: the browser sets the Content-Type header
// (with the boundary) itself, so we must not override it.
async function requestForm(path, formData) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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
  getItem: (id) => request(`/items/${id}`),
  createItem: (formData) => requestForm("/items", formData),
  updateItemStatus: (id, status) =>
    request(`/items/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
  // Week 3: claim flow + personal dashboard
  createClaim: (itemId, message) =>
    request(`/items/${itemId}/claims`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  getItemClaims: (itemId) => request(`/items/${itemId}/claims`),
  respondClaim: (itemId, claimId, decision) =>
    request(`/items/${itemId}/claims/${claimId}`, {
      method: "PATCH",
      body: JSON.stringify({ decision }),
    }),
  getMyItems: () => request("/me/items"),
  getMyClaims: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/me/claims${qs ? `?${qs}` : ""}`);
  },
};
