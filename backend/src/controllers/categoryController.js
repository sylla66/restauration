const prisma = require("../config/prisma");

async function list(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { menuItems: true } } },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { menuItems: { where: { isAvailable: true }, orderBy: { name: "asc" } } },
    });
    if (!category) {
      return res.status(404).json({ error: "Catégorie introuvable" });
    }
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, sortOrder } = req.body;
    const restaurantId = req.restaurantId || req.body.restaurantId;
    const category = await prisma.category.create({
      data: { name, sortOrder: sortOrder ?? 0, restaurantId },
    });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Catégorie introuvable" });
    if (req.user.role === "GERANT" && existing.restaurantId !== req.user.managedRestaurantId) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const { name, sortOrder } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, sortOrder },
    });
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Catégorie introuvable" });
    if (req.user.role === "GERANT" && existing.restaurantId !== req.user.managedRestaurantId) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: "Catégorie supprimée" });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
