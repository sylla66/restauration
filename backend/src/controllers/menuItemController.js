const prisma = require("../config/prisma");

async function list(req, res, next) {
  try {
    const { categoryId, available } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (available === "true") where.isAvailable = true;

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!item) {
      return res.status(404).json({ error: "Plat introuvable" });
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description, price, image, stock, categoryId, restaurantId } = req.body;
    const item = await prisma.menuItem.create({
      data: { name, description, price, image, stock, categoryId, restaurantId },
      include: { category: { select: { id: true, name: true } } },
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, description, price, image, stock, categoryId } = req.body;
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: { name, description, price, image, stock, categoryId },
      include: { category: { select: { id: true, name: true } } },
    });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function toggleAvailability(req, res, next) {
  try {
    const existing = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "Plat introuvable" });
    }
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: { isAvailable: !existing.isAvailable },
      include: { category: { select: { id: true, name: true } } },
    });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.json({ message: "Plat supprimé" });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, toggleAvailability, remove };
