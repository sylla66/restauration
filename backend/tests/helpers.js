const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

const BASE = "/api";

async function registerUser({ name, phone, password, email } = {}) {
  const unique = Date.now();
  const res = await request(app)
    .post(`${BASE}/auth/register`)
    .send({
      name: name || `Test User ${unique}`,
      phone: phone || `+22177${unique}`.slice(0, 15),
      password: password || "password123",
      email: email || `test${unique}@test.sn`,
    });
  return res.body;
}

async function loginUser(phone, password = "password123") {
  const res = await request(app)
    .post(`${BASE}/auth/login`)
    .send({ phone, password });
  return res.body;
}

async function getAuthToken() {
  const { user, token } = await registerUser();
  return { user, token };
}

const bcrypt = require("bcryptjs");

async function createAdminUser() {
  const unique = Date.now();
  const passwordHash = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Super Admin",
      phone: `+22176${unique}`.slice(0, 15),
      email: `admin${unique}@test.sn`,
      passwordHash,
      role: "ADMIN",
    },
  });
  const { generateToken } = require("../src/middleware/auth");
  const token = generateToken(user);
  return { user, token };
}

async function createRestaurant(token) {
  const res = await request(app)
    .post(`${BASE}/restaurants`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Test Resto", address: "Dakar", phone: "+221770000001" });
  return res.body.restaurant;
}

async function cleanupDatabase() {
  await prisma.user.updateMany({ where: { managedRestaurantId: { not: null } }, data: { managedRestaurantId: null } });
  const deleteOrder = [
    "complaint", "review", "payment", "delivery", "orderItem", "order",
    "menuItem", "category", "restaurant",
  ];
  for (const c of deleteOrder) {
    await prisma[c].deleteMany();
  }
  await prisma.user.deleteMany();
}

module.exports = {
  request, app, BASE, registerUser, loginUser, getAuthToken,
  createAdminUser, createRestaurant, cleanupDatabase,
};
