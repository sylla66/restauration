const { request, app, BASE, createAdminUser, createRestaurant, cleanupDatabase } = require("./helpers");

describe("Menu (Categories + MenuItems)", () => {
  let adminToken, restaurantId, categoryId, menuItemId;

  beforeAll(async () => {
    await cleanupDatabase();
    const admin = await createAdminUser();
    adminToken = admin.token;
    const restaurant = await createRestaurant(adminToken);
    restaurantId = restaurant.id;
  });

  it("POST /api/categories - crée une catégorie", async () => {
    const res = await request(app)
      .post(`${BASE}/categories`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Plats", restaurantId });
    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe("Plats");
    categoryId = res.body.category.id;
  });

  it("GET /api/categories - liste les catégories", async () => {
    const res = await request(app).get(`${BASE}/categories`);
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/menu-items - crée un plat", async () => {
    const res = await request(app)
      .post(`${BASE}/menu-items`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Thiébou Dieune",
        price: 3500,
        categoryId,
        restaurantId,
      });
    expect(res.status).toBe(201);
    expect(res.body.item.name).toBe("Thiébou Dieune");
    menuItemId = res.body.item.id;
  });

  it("GET /api/menu-items - liste les plats", async () => {
    const res = await request(app).get(`${BASE}/menu-items`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/menu-items/:id/toggle - bascule disponibilité", async () => {
    const res = await request(app)
      .patch(`${BASE}/menu-items/${menuItemId}/toggle`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.item.isAvailable).toBe(false);
  });

  it("POST /api/menu-items - refuse sans auth", async () => {
    const res = await request(app)
      .post(`${BASE}/menu-items`)
      .send({ name: "Sans auth", price: 1000, categoryId, restaurantId });
    expect(res.status).toBe(401);
  });
});
