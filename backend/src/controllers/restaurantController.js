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
      return res.status(409).json({ error: "Un restaurant existe déjà", restaurant: existing });
    }

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
        { name: "Thiébou Dieune", description: "Riz au poisson, légumes frais", price: 3500, categoryId: catPlats.id, restaurantId: restaurant.id },
        { name: "Mafé", description: "Riz à la sauce arachide, viande", price: 3000, categoryId: catPlats.id, restaurantId: restaurant.id },
        { name: "Yassa Poulet", description: "Poulet mariné, oignons, riz", price: 3200, categoryId: catPlats.id, restaurantId: restaurant.id },
        { name: "Brochettes de Bœuf", description: "4 brochettes, sauce", price: 2500, categoryId: catGrill.id, restaurantId: restaurant.id },
        { name: "Poulet Braisé", description: "Poulet braisé, frites", price: 4000, categoryId: catGrill.id, restaurantId: restaurant.id },
        { name: "Bissap", description: "Jus de fleur d'hibiscus frais", price: 500, categoryId: catBoissons.id, restaurantId: restaurant.id },
        { name: "Jus de Baobab", description: "Jus de pain de singe", price: 500, categoryId: catBoissons.id, restaurantId: restaurant.id },
        { name: "Thiakry", description: "Semoule de mil, lait caillé, vanille", price: 1500, categoryId: catDesserts.id, restaurantId: restaurant.id },
        { name: "Fruit de la passion", description: "Jus de fruit de la passion frais", price: 500, categoryId: catBoissons.id, restaurantId: restaurant.id },
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

module.exports = { list, getById, create, update, seed };
