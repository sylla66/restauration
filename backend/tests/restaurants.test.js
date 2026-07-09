const { request, app, BASE, createAdminUser, cleanupDatabase } = require("./helpers");

describe("Restaurants (delete, seed)", () => {
  let adminToken, restaurantId;

  beforeAll(async () => {
    await cleanupDatabase();
    const admin = await createAdminUser();
    adminToken = admin.token;

    const res = await request(app).post(`${BASE}/restaurants`).set("Authorization", `Bearer ${adminToken}`).send({ name: "À supprimer", address: "Dakar", phone: "+221770000099" });
    restaurantId = res.body.restaurant.id;
  });

  it("POST /api/restaurants/seed - exécute le seed", async () => {
    const res = await request(app).post(`${BASE}/restaurants/seed`);
    expect(res.status).toBe(201);
    expect(res.body.restaurants).toBeDefined();
    expect(res.body.restaurants.length).toBe(2);
  });

  it("POST /api/restaurants/seed - idempotent", async () => {
    const res = await request(app).post(`${BASE}/restaurants/seed`);
    expect(res.status).toBe(201);
    expect(res.body.restaurants).toBeDefined();
  });

  it("DELETE /api/restaurants/:id - admin supprime le restaurant seedé", async () => {
    const listRes = await request(app).get(`${BASE}/restaurants`).set("Authorization", `Bearer ${adminToken}`);
    const seedRestaurantId = listRes.body.restaurants[0].id;
    const res = await request(app).delete(`${BASE}/restaurants/${seedRestaurantId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("DELETE /api/restaurants/:id - refuse non-admin", async () => {
    const userRes = await request(app).post(`${BASE}/auth/register`).send({ name: "Client", phone: "+221779990001", password: "pass123" });
    const res = await request(app).delete(`${BASE}/restaurants/000000000000000000000000`).set("Authorization", `Bearer ${userRes.body.token}`);
    expect(res.status).toBe(403);
  });

  it("DELETE /api/restaurants/:id - 404 sur inexistant", async () => {
    const res = await request(app).delete(`${BASE}/restaurants/000000000000000000000000`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
