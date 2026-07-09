const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function list(req, res, next) {
  try {
    const where = { isActive: true };
    if (req.query.mine === "true" && req.user) {
      where.ownerId = req.user.id;
    }
    if (req.user?.role === "GERANT" && req.user.managedRestaurantId) {
      where.id = req.user.managedRestaurantId;
    }
    const restaurants = await prisma.restaurant.findMany({
      where,
      select: { id: true, name: true, address: true, phone: true, logo: true, deliveryRadius: true, deliveryZones: true, ownerId: true },
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
          include: { menuItems: { orderBy: { name: "asc" } } },
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
      data: { name, address, phone, email, logo, deliveryRadius, deliveryZones, ownerId: req.user?.id },
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
    await prisma.complaint.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.updateMany({ where: { managedRestaurantId: { not: null } }, data: { managedRestaurantId: null } });
    await prisma.restaurant.deleteMany();

    const hash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
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

    const resto1 = await prisma.restaurant.create({
      data: {
        name: "Le Dakar Gourmet",
        address: "123 Avenue de la République, Dakar",
        phone: "+221 77 123 45 67",
        email: "contact@dakargourmet.sn",
        deliveryRadius: 10,
        ownerId: admin.id,
        deliveryZones: ["Dakar Plateau", "Gueule Tapée", "Fann", "Mermoz", "Sacré Cœur", "Point E", "Ouakam", "Ngor"],
      },
    });

    const resto2 = await prisma.restaurant.create({
      data: {
        name: "Chez Mama Africa",
        address: "45 Rue de la Liberté, Dakar",
        phone: "+221 77 987 65 43",
        deliveryRadius: 8,
        ownerId: admin.id,
        deliveryZones: ["Médina", "Colobane", "HLM", "Grand Dakar", "Fass"],
      },
    });

    const r1cat1 = await prisma.category.create({ data: { name: "Plats Principaux", sortOrder: 1, restaurantId: resto1.id } });
    const r1cat2 = await prisma.category.create({ data: { name: "Grillades", sortOrder: 2, restaurantId: resto1.id } });
    const r1cat3 = await prisma.category.create({ data: { name: "Boissons", sortOrder: 3, restaurantId: resto1.id } });
    const r1cat4 = await prisma.category.create({ data: { name: "Desserts", sortOrder: 4, restaurantId: resto1.id } });

    const r2cat1 = await prisma.category.create({ data: { name: "Spécialités", sortOrder: 1, restaurantId: resto2.id } });
    const r2cat2 = await prisma.category.create({ data: { name: "Sandwichs", sortOrder: 2, restaurantId: resto2.id } });
    const r2cat3 = await prisma.category.create({ data: { name: "Boissons", sortOrder: 3, restaurantId: resto2.id } });

    await prisma.menuItem.createMany({
      data: [
        { name: "Thiébou Dieune", description: "Riz au poisson, légumes frais", price: 3500, image: "https://placehold.co/400x300/e67e22/white?text=Thi%C3%A9bou+Dieune", categoryId: r1cat1.id, restaurantId: resto1.id },
        { name: "Mafé", description: "Riz à la sauce arachide, viande", price: 3000, image: "https://placehold.co/400x300/d35400/white?text=Maf%C3%A9", categoryId: r1cat1.id, restaurantId: resto1.id },
        { name: "Yassa Poulet", description: "Poulet mariné, oignons, riz", price: 3200, image: "https://placehold.co/400x300/2ecc71/white?text=Yassa+Poulet", categoryId: r1cat1.id, restaurantId: resto1.id },
        { name: "Brochettes de Bœuf", description: "4 brochettes, sauce", price: 2500, image: "https://placehold.co/400x300/8e44ad/white?text=Brochettes", categoryId: r1cat2.id, restaurantId: resto1.id },
        { name: "Poulet Braisé", description: "Poulet braisé, frites", price: 4000, image: "https://placehold.co/400x300/e74c3c/white?text=Poulet+Brais%C3%A9", categoryId: r1cat2.id, restaurantId: resto1.id },
        { name: "Bissap", description: "Jus de fleur d'hibiscus frais", price: 500, image: "https://placehold.co/400x300/e91e63/white?text=Bissap", categoryId: r1cat3.id, restaurantId: resto1.id },
        { name: "Jus de Baobab", description: "Jus de pain de singe", price: 500, image: "https://placehold.co/400x300/9b59b6/white?text=Baobab", categoryId: r1cat3.id, restaurantId: resto1.id },
        { name: "Thiakry", description: "Semoule de mil, lait caillé, vanille", price: 1500, image: "https://placehold.co/400x300/f1c40f/333?text=Thiakry", categoryId: r1cat4.id, restaurantId: resto1.id },
        { name: "Fruit de la passion", description: "Jus de fruit de la passion frais", price: 500, image: "https://placehold.co/400x300/ff9800/white?text=Fruit+Passion", categoryId: r1cat3.id, restaurantId: resto1.id },
        { name: "Dibi Haoussa", description: "Mouton grillé, oignons, moutarde", price: 4500, image: "https://placehold.co/400x300/1abc9c/white?text=Dibi+Haoussa", categoryId: r2cat1.id, restaurantId: resto2.id },
        { name: "Soupe Kandia", description: "Soupe de poisson au gombo", price: 2500, image: "https://placehold.co/400x300/3498db/white?text=Soupe+Kandia", categoryId: r2cat1.id, restaurantId: resto2.id },
        { name: "Riz Gras", description: "Riz gras à la viande", price: 2800, image: "https://placehold.co/400x300/f39c12/white?text=Riz+Gras", categoryId: r2cat1.id, restaurantId: resto2.id },
        { name: "Sandwich Bifteck", description: "Bifteck, frites, sauce", price: 2000, image: "https://placehold.co/400x300/16a085/white?text=Sandwich+Bifteck", categoryId: r2cat2.id, restaurantId: resto2.id },
        { name: "Sandwich Dinde", description: "Dinde, salade, frites", price: 2200, image: "https://placehold.co/400x300/27ae60/white?text=Sandwich+Dinde", categoryId: r2cat2.id, restaurantId: resto2.id },
        { name: "Jus de Bissap", description: "Bissap maison", price: 400, image: "https://placehold.co/400x300/e91e63/white?text=Jus+Bissap", categoryId: r2cat3.id, restaurantId: resto2.id },
        { name: "Jus de Gingembre", description: "Gingembre frais", price: 400, image: "https://placehold.co/400x300/f1c40f/333?text=Gingembre", categoryId: r2cat3.id, restaurantId: resto2.id },
      ],
    });

    res.status(201).json({
      restaurants: [
        { name: resto1.name, categories: 4, items: 9 },
        { name: resto2.name, categories: 3, items: 6 },
      ],
    });
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
