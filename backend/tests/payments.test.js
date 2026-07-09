const { request, app, BASE, createAdminUser, createRestaurant, cleanupDatabase } = require("./helpers");

describe("Payments & Dashboard", () => {
  let adminToken, userToken, restaurantId, orderId;

  beforeAll(async () => {
    await cleanupDatabase();
    const admin = await createAdminUser();
    adminToken = admin.token;
    const restaurant = await createRestaurant(adminToken);
    restaurantId = restaurant.id;

    const catRes = await request(app).post(`${BASE}/categories`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Plats", restaurantId });
    const categoryId = catRes.body.category.id;
    const itemRes = await request(app).post(`${BASE}/menu-items`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Plat", price: 1500, categoryId, restaurantId });
    const menuItemId = itemRes.body.item.id;

    const userRes = await request(app).post(`${BASE}/auth/register`).send({ name: "Client", phone: "+221775550001", password: "pass123" });
    userToken = userRes.body.token;

    const orderRes = await request(app).post(`${BASE}/orders/on-site`).set("Authorization", `Bearer ${userToken}`).send({ restaurantId, items: [{ menuItemId, quantity: 2 }] });
    orderId = orderRes.body.order.id;
  });

  it("POST /api/payments/init - initie un paiement", async () => {
    const res = await request(app).post(`${BASE}/payments/init`).set("Authorization", `Bearer ${userToken}`).send({ orderId, method: "CASH" });
    expect(res.status).toBe(201);
    expect(res.body.payment).toBeDefined();
  });

  it("POST /api/payments/init - refuse sans method", async () => {
    const res = await request(app).post(`${BASE}/payments/init`).set("Authorization", `Bearer ${userToken}`).send({ orderId });
    expect(res.status).toBe(400);
  });

  it("GET /api/payments/order/:orderId - liste les paiements", async () => {
    const res = await request(app).get(`${BASE}/payments/order/${orderId}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /api/dashboard/sales - admin voit les ventes", async () => {
    const res = await request(app).get(`${BASE}/dashboard/sales?period=month`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /api/dashboard/top-items - admin voit le top plats", async () => {
    const res = await request(app).get(`${BASE}/dashboard/top-items`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.topItems).toBeDefined();
  });

  it("GET /api/dashboard/channels - admin voit la répartition", async () => {
    const res = await request(app).get(`${BASE}/dashboard/channels`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /api/dashboard/cancellations - admin voit le taux d'annulation", async () => {
    const res = await request(app).get(`${BASE}/dashboard/cancellations`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
