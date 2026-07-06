const { request, app, BASE, cleanupDatabase } = require("./helpers");

describe("Auth", () => {
  beforeAll(async () => {
    await cleanupDatabase();
  });

  const uid = Date.now();
  const testUser = {
    name: "Moussa Diop",
    phone: `+22177111${uid}`.slice(0, 15),
    password: "secret123",
    email: `moussa${uid}@test.sn`,
  };

  it("POST /api/auth/register - crée un client", async () => {
    const res = await request(app).post(`${BASE}/auth/register`).send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.role).toBe("CLIENT");
    expect(res.body).toHaveProperty("token");
  });

  it("POST /api/auth/register - refuse email en doublon", async () => {
    const res = await request(app).post(`${BASE}/auth/register`).send(testUser);
    expect(res.status).toBe(409);
  });

  it("POST /api/auth/login - connecte avec téléphone", async () => {
    const res = await request(app).post(`${BASE}/auth/login`).send({
      phone: testUser.phone,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.user.phone).toBe(testUser.phone);
    expect(res.body).toHaveProperty("token");
  });

  it("POST /api/auth/login - refuse mauvais mot de passe", async () => {
    const res = await request(app).post(`${BASE}/auth/login`).send({
      phone: testUser.phone,
      password: "wrong",
    });
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me - retourne le profil", async () => {
    const res = await request(app).post(`${BASE}/auth/register`).send({
      name: "Test Me",
      phone: `+22177222${uid}`.slice(0, 15),
      password: "password123",
    });
    const token = res.body.token;

    const meRes = await request(app)
      .get(`${BASE}/auth/me`)
      .set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.name).toBe("Test Me");
  });

  it("GET /api/auth/me - refuse sans token", async () => {
    const res = await request(app).get(`${BASE}/auth/me`);
    expect(res.status).toBe(401);
  });
});
