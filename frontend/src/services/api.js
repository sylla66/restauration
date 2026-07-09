const BASE = "/api";

async function request(url, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur serveur");
  return data;
}

export const uploads = {
  file: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("/upload", { method: "POST", body: fd });
  },
};

export const auth = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  updateProfile: (body) => request("/auth/me", { method: "PATCH", body: JSON.stringify(body) }),
  registerStaff: (body) => request("/auth/register-staff", { method: "POST", body: JSON.stringify(body) }),
};

export const restaurants = {
  list: (params) => request(`/restaurants?${new URLSearchParams(params || {})}`),
  getById: (id) => request(`/restaurants/${id}`),
  create: (body) => request("/restaurants", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/restaurants/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => request(`/restaurants/${id}`, { method: "DELETE" }),
  seed: () => request("/restaurants/seed", { method: "POST" }),
};

export const categories = {
  list: () => request("/categories"),
  getById: (id) => request(`/categories/${id}`),
  create: (body) => request("/categories", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => request(`/categories/${id}`, { method: "DELETE" }),
};

export const menuItems = {
  list: (params) => request(`/menu-items?${new URLSearchParams(params)}`),
  getById: (id) => request(`/menu-items/${id}`),
  create: (body) => request("/menu-items", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/menu-items/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  toggleAvailability: (id) => request(`/menu-items/${id}/toggle`, { method: "PATCH" }),
  remove: (id) => request(`/menu-items/${id}`, { method: "DELETE" }),
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
  listByOrder: (orderId) => request(`/payments/order/${orderId}`),
};

export const deliveries = {
  list: (params) => request(`/deliveries?${new URLSearchParams(params || {})}`),
  my: () => request("/deliveries/my"),
  getById: (id) => request(`/deliveries/${id}`),
  getByOrder: (orderId) => request(`/deliveries/order/${orderId}`),
  assign: (body) => request("/deliveries/assign", { method: "POST", body: JSON.stringify(body) }),
  updateStatus: (id, status) => request(`/deliveries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export const reviews = {
  create: (body) => request("/reviews", { method: "POST", body: JSON.stringify(body) }),
  listByRestaurant: (restaurantId) => request(`/reviews/restaurant/${restaurantId}`),
  listPending: () => request("/reviews/pending"),
  moderate: (id, status) => request(`/reviews/${id}/moderate`, { method: "PATCH", body: JSON.stringify({ moderationStatus: status }) }),
};

export const complaints = {
  create: (body) => request("/complaints", { method: "POST", body: JSON.stringify(body) }),
  list: () => request("/complaints"),
  updateStatus: (id, status) => request(`/complaints/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export const users = {
  list: (params) => request(`/users?${new URLSearchParams(params)}`),
  toggleActive: (id) => request(`/users/${id}/toggle`, { method: "PATCH" }),
};

export const dashboard = {
  sales: (params) => request(`/dashboard/sales?${new URLSearchParams(params)}`),
  topItems: (params) => request(`/dashboard/top-items?${new URLSearchParams(params)}`),
  channels: (params) => request(`/dashboard/channels?${new URLSearchParams(params)}`),
  cancellations: (params) => request(`/dashboard/cancellations?${new URLSearchParams(params)}`),
  deliveryTimes: (params) => request(`/dashboard/delivery-times?${new URLSearchParams(params)}`),
};
