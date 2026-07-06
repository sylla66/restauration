const BASE = "/api";

async function request(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur serveur");
  return data;
}

export const auth = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
};

export const restaurants = {
  list: () => request("/restaurants"),
  getById: (id) => request(`/restaurants/${id}`),
};

export const categories = {
  list: () => request("/categories"),
};

export const menuItems = {
  list: (params) => request(`/menu-items?${new URLSearchParams(params)}`),
};

export const orders = {
  createOnSite: (body) => request("/orders/on-site", { method: "POST", body: JSON.stringify(body) }),
  createRemote: (body) => request("/orders/remote", { method: "POST", body: JSON.stringify(body) }),
  list: (params) => request(`/orders?${new URLSearchParams(params)}`),
  getById: (id) => request(`/orders/${id}`),
  updateStatus: (id, status) => request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  cancel: (id) => request(`/orders/${id}/cancel`, { method: "PATCH" }),
};

export const payments = {
  init: (body) => request("/payments/init", { method: "POST", body: JSON.stringify(body) }),
  confirmDelivery: (body) => request("/payments/confirm-delivery", { method: "POST", body: JSON.stringify(body) }),
};

export const dashboard = {
  sales: (params) => request(`/dashboard/sales?${new URLSearchParams(params)}`),
  topItems: (params) => request(`/dashboard/top-items?${new URLSearchParams(params)}`),
  channels: (params) => request(`/dashboard/channels?${new URLSearchParams(params)}`),
  cancellations: (params) => request(`/dashboard/cancellations?${new URLSearchParams(params)}`),
  deliveryTimes: (params) => request(`/dashboard/delivery-times?${new URLSearchParams(params)}`),
};
