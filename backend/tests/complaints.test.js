const { request, app, BASE, createAdminUser, createRestaurant, cleanupDatabase } = require("./helpers");

describe("Complaints", () => {
  let adminToken, userToken, restaurantId, orderId, complaintId;

  beforeAll(async () => {
    await cleanupDatabase();
    const admin = await createAdminUser();
    adminToken = admin.token;
    const restaurant = await createRestaurant(adminToken);
    restaurantId = restaurant.id;

    const catRes = await request(app).post(`${BASE}/categories`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Plats", restaurantId });
    const categoryId = catRes.body.category.id;
    const itemRes = await request(app).post(`${BASE}/menu-items`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Plat", price: 1000, categoryId, restaurantId });
    const menuItemId = itemRes.body.item.id;

    const userRes = await request(app).post(`${BASE}/auth/register`).send({ name: "Client", phone: "+221774440001", password: "pass123" });
    userToken = userRes.body.token;

    const orderRes = await request(app).post(`${BASE}/orders/on-site`).set("Authorization", `Bearer ${userToken}`).send({ restaurantId, items: [{ menuItemId, quantity: 1 }] });
    orderId = orderRes.body.order.id;

    for (const s of ["CONFIRMED", "PREPARING", "READY", "READY_FOR_PICKUP", "DELIVERED"]) {
      await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: s });
    }

    const compRes = await request(app).post(`${BASE}/complaints`).set("Authorization", `Bearer ${userToken}`).send({ orderId, reason: "PRODUCT_ISSUE", description: "Plat froid" });
    complaintId = compRes.body.complaint?.id;
  });

  it("POST /api/complaints - crée une réclamation", async () => {
    expect(complaintId).toBeDefined();
  });

  it("POST /api/complaints - refuse sans raison", async () => {
    const res = await request(app).post(`${BASE}/complaints`).set("Authorization", `Bearer ${userToken}`).send({ orderId });
    expect(res.status).toBe(400);
  });

  it("GET /api/complaints - admin liste les réclamations", async () => {
    const res = await request(app).get(`${BASE}/complaints`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.complaints.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/complaints/:id/status - admin résout", async () => {
    if (!complaintId) return;
    const res = await request(app).patch(`${BASE}/complaints/${complaintId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "RESOLVED", resolution: "Remboursement" });
    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe("RESOLVED");
  });

  it("PATCH /api/complaints/:id/status - admin rejette", async () => {
    if (!complaintId) return;
    const res = await request(app).patch(`${BASE}/complaints/${complaintId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "DISMISSED" });
    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe("DISMISSED");
  });
});
