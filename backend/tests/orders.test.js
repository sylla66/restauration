const { request, app, BASE, createAdminUser, createRestaurant, cleanupDatabase } = require("./helpers");

describe("Orders", () => {
  let adminToken, userToken, restaurantId, menuItemId;

  beforeAll(async () => {
    await cleanupDatabase();

    const admin = await createAdminUser();
    adminToken = admin.token;

    const restRes = await request(app)
      .post(`${BASE}/restaurants`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Resto",
        address: "Dakar Plateau",
        phone: "+221770000001",
        deliveryRadius: 10,
        deliveryZones: ["Plateau", "Fann", "Mermoz"],
      });
    restaurantId = restRes.body.restaurant.id;

    const catRes = await request(app)
      .post(`${BASE}/categories`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Plats", restaurantId });
    const categoryId = catRes.body.category.id;

    const itemRes = await request(app)
      .post(`${BASE}/menu-items`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Yassa", price: 3000, categoryId, restaurantId });
    menuItemId = itemRes.body.item.id;

    const uid = Date.now();
    const userRes = await request(app).post(`${BASE}/auth/register`).send({
      name: "Client Test",
      phone: `+22177333${uid}`.slice(0, 15),
      password: "client123",
    });
    userToken = userRes.body.token;
  });

  it("POST /api/orders/on-site - crée commande sur place", async () => {
    const res = await request(app)
      .post(`${BASE}/orders/on-site`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        restaurantId,
        items: [{ menuItemId, quantity: 2 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.order.channel).toBe("ON_SITE");
    expect(res.body.order.total).toBe(6000);
    expect(res.body.order.status).toBe("PENDING");
  });

  it("POST /api/orders/on-site - accepte guest (sans auth)", async () => {
    const res = await request(app)
      .post(`${BASE}/orders/on-site`)
      .send({
        restaurantId,
        items: [{ menuItemId, quantity: 1 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.order.userId).toBeNull();
  });

  it("POST /api/orders/remote - crée commande livraison", async () => {
    const res = await request(app)
      .post(`${BASE}/orders/remote`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        restaurantId,
        subType: "DELIVERY",
        items: [{ menuItemId, quantity: 1 }],
        deliveryAddress: "123 Rue de Dakar, Plateau",
      });
    expect(res.status).toBe(201);
    expect(res.body.order.channel).toBe("REMOTE");
    expect(res.body.order.subType).toBe("DELIVERY");
  });

  it("POST /api/orders/remote - refuse hors zone livraison", async () => {
    const res = await request(app)
      .post(`${BASE}/orders/remote`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        restaurantId,
        subType: "DELIVERY",
        items: [{ menuItemId, quantity: 1 }],
        deliveryAddress: "Village lointain, brousse",
      });
    expect(res.status).toBe(400);
  });

  it("PATCH /api/orders/:id/status - change statut", async () => {
    const orderRes = await request(app)
      .post(`${BASE}/orders/on-site`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ restaurantId, items: [{ menuItemId, quantity: 1 }] });
    const orderId = orderRes.body.order.id;

    const res = await request(app)
      .patch(`${BASE}/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "CONFIRMED" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("CONFIRMED");
  });

  it("GET /api/orders - liste les commandes", async () => {
    const res = await request(app)
      .get(`${BASE}/orders`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/orders/:id/cancel - annule commande", async () => {
    const orderRes = await request(app)
      .post(`${BASE}/orders/on-site`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ restaurantId, items: [{ menuItemId, quantity: 1 }] });
    const orderId = orderRes.body.order.id;

    const res = await request(app)
      .patch(`${BASE}/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("CANCELLED");
  });
});
