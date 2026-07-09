const { request, app, BASE, createAdminUser, cleanupDatabase } = require("./helpers");

describe("Users & Profile", () => {
  let adminToken, userToken, userId;

  beforeAll(async () => {
    await cleanupDatabase();
    const admin = await createAdminUser();
    adminToken = admin.token;

    const userRes = await request(app).post(`${BASE}/auth/register`).send({ name: "Alpha", phone: "+221770000111", password: "pass123", email: "alpha@test.sn" });
    userToken = userRes.body.token;
    userId = userRes.body.user.id;
  });

  it("PATCH /api/auth/me - met à jour le profil", async () => {
    const res = await request(app).patch(`${BASE}/auth/me`).set("Authorization", `Bearer ${userToken}`).send({ name: "Alpha Modifié", email: "alpha.new@test.sn" });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Alpha Modifié");
  });

  it("GET /api/users - admin liste les utilisateurs", async () => {
    const res = await request(app).get(`${BASE}/users`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
  });

  it("GET /api/users - recherche par téléphone", async () => {
    const res = await request(app).get(`${BASE}/users?search=770000111`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/users/:id/toggle - admin désactive un utilisateur", async () => {
    const res = await request(app).patch(`${BASE}/users/${userId}/toggle`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.isActive).toBe(false);
  });

  it("PATCH /api/users/:id/toggle - admin réactive", async () => {
    const res = await request(app).patch(`${BASE}/users/${userId}/toggle`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.isActive).toBe(true);
  });

  it("PATCH /api/users/:id/toggle - refuse non-admin", async () => {
    const res = await request(app).patch(`${BASE}/users/${userId}/toggle`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
