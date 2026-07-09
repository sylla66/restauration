const { request, app, BASE, createAdminUser, createRestaurant, cleanupDatabase } = require("./helpers");

describe("Reviews", () => {
  let adminToken, userToken, restaurantId, orderId;

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

    const userRes = await request(app).post(`${BASE}/auth/register`).send({ name: "Client", phone: "+221773330001", password: "pass123" });
    userToken = userRes.body.token;

    const orderRes = await request(app).post(`${BASE}/orders/on-site`).set("Authorization", `Bearer ${userToken}`).send({ restaurantId, items: [{ menuItemId, quantity: 1 }] });
    orderId = orderRes.body.order.id;

    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "CONFIRMED" });
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "PREPARING" });
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "READY" });
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "READY_FOR_PICKUP" });
    await request(app).patch(`${BASE}/orders/${orderId}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "DELIVERED" });
  });

  it("POST /api/reviews - crée un avis", async () => {
    const res = await request(app).post(`${BASE}/reviews`).set("Authorization", `Bearer ${userToken}`).send({ orderId, rating: 5, comment: "Excellent !" });
    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(5);
  });

  it("POST /api/reviews - refuse note invalide", async () => {
    const res = await request(app).post(`${BASE}/reviews`).set("Authorization", `Bearer ${userToken}`).send({ orderId, rating: 6 });
    expect(res.status).toBe(400);
  });

  it("GET /api/reviews/restaurant/:restaurantId - liste les avis", async () => {
    const res = await request(app).get(`${BASE}/reviews/restaurant/${restaurantId}`);
    expect(res.status).toBe(200);
  });

  it("GET /api/reviews/pending - admin voit avis en attente", async () => {
    const res = await request(app).get(`${BASE}/reviews/pending`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toBeDefined();
  });

  it("PATCH /api/reviews/:id/moderate - admin modère", async () => {
    const listRes = await request(app).get(`${BASE}/reviews/pending`).set("Authorization", `Bearer ${adminToken}`);
    const reviewId = listRes.body.reviews[0]?.id;
    if (!reviewId) return;
    const res = await request(app).patch(`${BASE}/reviews/${reviewId}/moderate`).set("Authorization", `Bearer ${adminToken}`).send({ moderationStatus: "APPROVED" });
    expect(res.status).toBe(200);
    expect(res.body.review.moderationStatus).toBe("APPROVED");
  });
});
