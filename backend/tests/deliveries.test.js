const { request, app, BASE, createAdminUser, createRestaurant, cleanupDatabase } = require("./helpers");
const prisma = require("../src/config/prisma");

describe("Deliveries", () => {
  let adminToken, userToken, livreurToken, restaurantId, menuItemId, orderId, livreurId, deliveryId;

  beforeAll(async () => {
    await cleanupDatabase();
    const admin = await createAdminUser();
    adminToken = admin.token;
    const restaurant = await createRestaurant(adminToken);
    restaurantId = restaurant.id;

    const catRes = await request(app).post(`${BASE}/categories`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Plats", restaurantId });
    const categoryId = catRes.body.category.id;
    const itemRes = await request(app).post(`${BASE}/menu-items`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Plat Test", price: 2000, categoryId, restaurantId });
    const menuItemId = itemRes.body.item.id;

    const userRes = await request(app).post(`${BASE}/auth/register`).send({ name: "Client", phone: "+221771000001", password: "pass123" });
    userToken = userRes.body.token;

    const livreurRes = await request(app).post(`${BASE}/auth/register`).send({ name: "Livreur", phone: "+221772000001", password: "pass123" });
    livreurId = livreurRes.body.user.id;
    await prisma.user.update({ where: { id: livreurId }, data: { role: "LIVREUR" } });
    const loginRes = await request(app).post(`${BASE}/auth/login`).send({ phone: "+221772000001", password: "pass123" });
    livreurToken = loginRes.body.token;

    const orderRes = await request(app).post(`${BASE}/orders/remote`).set("Authorization", `Bearer ${userToken}`).send({ restaurantId, subType: "DELIVERY", items: [{ menuItemId, quantity: 1 }], deliveryAddress: "123 Rue Plateau" });
    orderId = orderRes.body.order.id;

    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "CONFIRMED" });
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "PREPARING" });
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "READY" });
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "READY_FOR_PICKUP" });

    const assignRes = await request(app).post(`${BASE}/deliveries/assign`).set("Authorization", `Bearer ${adminToken}`).send({ orderId, deliveryPersonId: livreurId });
    deliveryId = assignRes.body.delivery?.id;
  });

  it("GET /api/deliveries - admin liste les livraisons", async () => {
    const res = await request(app).get(`${BASE}/deliveries`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.deliveries).toBeDefined();
  });

  it("POST /api/deliveries/assign - admin assigne un livreur", async () => {
    expect(deliveryId).toBeDefined();
  });

  it("GET /api/deliveries/my - livreur voit ses livraisons", async () => {
    const res = await request(app).get(`${BASE}/deliveries/my`).set("Authorization", `Bearer ${livreurToken}`);
    expect(res.status).toBe(200);
    expect(res.body.deliveries.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/deliveries/:id/status - livreur passe picked_up", async () => {
    if (!deliveryId) return;
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "OUT_FOR_DELIVERY" });
    const res = await request(app).patch(`${BASE}/deliveries/${deliveryId}/status`).set("Authorization", `Bearer ${livreurToken}`).send({ status: "picked_up" });
    expect(res.status).toBe(200);
  });

  it("PATCH /api/deliveries/:id/status - livreur livre delivered", async () => {
    if (!deliveryId) return;
    const res = await request(app).patch(`${BASE}/deliveries/${deliveryId}/status`).set("Authorization", `Bearer ${livreurToken}`).send({ status: "delivered" });
    expect(res.status).toBe(200);
    expect(res.body.delivery.status).toBe("delivered");
  });

  it("GET /api/deliveries/order/:orderId - livreur voit livraison d'une commande", async () => {
    const res = await request(app).get(`${BASE}/deliveries/order/${orderId}`).set("Authorization", `Bearer ${livreurToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /api/deliveries - refuse non-admin", async () => {
    const res = await request(app).get(`${BASE}/deliveries`).set("Authorization", `Bearer ${livreurToken}`);
    expect(res.status).toBe(403);
  });
});
