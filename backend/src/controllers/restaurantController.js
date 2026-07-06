const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function list(req, res, next) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: { id: true, name: true, address: true, phone: true, logo: true, deliveryRadius: true, deliveryZones: true },
    });
    res.json({ restaurants });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      include: {
        categories: {
          include: { menuItems: { where: { isAvailable: true }, orderBy: { name: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant introuvable" });
    }
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, address, phone, email, logo, deliveryRadius, deliveryZones } = req.body;
    const restaurant = await prisma.restaurant.create({
      data: { name, address, phone, email, logo, deliveryRadius, deliveryZones },
    });
    res.status(201).json({ restaurant });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, address, phone, email, logo, deliveryRadius, deliveryZones, isActive } = req.body;
    const restaurant = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: { name, address, phone, email, logo, deliveryRadius, deliveryZones, isActive },
    });
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

async function seed(req, res, next) {
  try {
    const existing = await prisma.restaurant.findFirst();
    if (existing) {
      await prisma.restaurant.delete({ where: { id: existing.id } });
    }

    const hash = await bcrypt.hash("admin123", 10);
    await prisma.user.upsert({
      where: { phone: "77 000 00 01" },
      update: {},
      create: { name: "Admin", phone: "77 000 00 01", passwordHash: hash, role: "ADMIN" },
    });
    await prisma.user.upsert({
      where: { phone: "77 000 00 02" },
      update: {},
      create: { name: "Client Test", phone: "77 000 00 02", passwordHash: hash, role: "CLIENT" },
    });
    await prisma.user.upsert({
      where: { phone: "77 000 00 03" },
      update: {},
      create: { name: "Livreur Test", phone: "77 000 00 03", passwordHash: hash, role: "LIVREUR" },
    });

    const restaurant = await prisma.restaurant.create({
      data: {
        name: "Le Dakar Gourmet",
        address: "123 Avenue de la République, Dakar",
        phone: "+221 77 123 45 67",
        email: "contact@dakargourmet.sn",
        deliveryRadius: 10,
        deliveryZones: ["Dakar Plateau", "Gueule Tapée", "Fann", "Mermoz", "Sacré Cœur", "Point E", "Ouakam", "Ngor"],
      },
    });

    const catPlats = await prisma.category.create({
      data: { name: "Plats Principaux", sortOrder: 1, restaurantId: restaurant.id },
    });
    const catGrill = await prisma.category.create({
      data: { name: "Grillades", sortOrder: 2, restaurantId: restaurant.id },
    });
    const catBoissons = await prisma.category.create({
      data: { name: "Boissons", sortOrder: 3, restaurantId: restaurant.id },
    });
    const catDesserts = await prisma.category.create({
      data: { name: "Desserts", sortOrder: 4, restaurantId: restaurant.id },
    });

    await prisma.menuItem.createMany({
      data: [
        { name: "Thiébou Dieune", description: "Riz au poisson, légumes frais", price: 3500, image: "https://placehold.co/400x300/e67e22/white?text=Thi%C3%A9bou+Dieune", categoryId: catPlats.id, restaurantId: restaurant.id },
        { name: "Mafé", description: "Riz à la sauce arachide, viande", price: 3000, image: "https://placehold.co/400x300/d35400/white?text=Maf%C3%A9", categoryId: catPlats.id, restaurantId: restaurant.id },
        { name: "Yassa Poulet", description: "Poulet mariné, oignons, riz", price: 3200, image: "https://placehold.co/400x300/2ecc71/white?text=Yassa+Poulet", categoryId: catPlats.id, restaurantId: restaurant.id },
        { name: "Brochettes de Bœuf", description: "4 brochettes, sauce", price: 2500, image: "https://placehold.co/400x300/8e44ad/white?text=Brochettes", categoryId: catGrill.id, restaurantId: restaurant.id },
        { name: "Poulet Braisé", description: "Poulet braisé, frites", price: 4000, image: "https://placehold.co/400x300/e74c3c/white?text=Poulet+Brais%C3%A9", categoryId: catGrill.id, restaurantId: restaurant.id },
        { name: "Bissap", description: "Jus de fleur d'hibiscus frais", price: 500, image: "https://placehold.co/400x300/e91e63/white?text=Bissap", categoryId: catBoissons.id, restaurantId: restaurant.id },
        { name: "Jus de Baobab", description: "Jus de pain de singe", price: 500, image: "https://placehold.co/400x300/9b59b6/white?text=Baobab", categoryId: catBoissons.id, restaurantId: restaurant.id },
        { name: "Thiakry", description: "Semoule de mil, lait caillé, vanille", price: 1500, image: "https://placehold.co/400x300/f1c40f/333?text=Thiakry", categoryId: catDesserts.id, restaurantId: restaurant.id },
        { name: "Fruit de la passion", description: "Jus de fruit de la passion frais", price: 500, image: "https://placehold.co/400x300/ff9800/white?text=Fruit+Passion", categoryId: catBoissons.id, restaurantId: restaurant.id },
      ],
    });

    const full = await prisma.restaurant.findUnique({
      where: { id: restaurant.id },
      include: { categories: { include: { menuItems: true }, orderBy: { sortOrder: "asc" } } },
    });

    res.status(201).json({ restaurant: full });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.restaurant.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, seed, remove };
