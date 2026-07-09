const prisma = require("../config/prisma");

async function create(req, res, next) {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    if (order.status !== "DELIVERED") {
      return res.status(400).json({ error: "Vous pouvez uniquement noter une commande livrée" });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: "Cette commande ne vous appartient pas" });
    }

    const existing = await prisma.review.findUnique({
      where: { orderId_userId: { orderId, userId: req.user.id } },
    });
    if (existing) {
      return res.status(409).json({ error: "Vous avez déjà noté cette commande" });
    }

    const review = await prisma.review.create({
      data: { orderId, userId: req.user.id, rating, comment },
      include: { user: { select: { id: true, name: true } } },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

async function listByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        moderationStatus: "APPROVED",
        order: { restaurantId },
      },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const stats = await prisma.review.aggregate({
      where: { order: { restaurantId }, moderationStatus: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    });

    res.json({ reviews, stats: { avgRating: stats._avg.rating, count: stats._count } });
  } catch (err) {
    next(err);
  }
}

async function listPending(req, res, next) {
  try {
    const where = { moderationStatus: "PENDING" };
    if (req.user?.role === "GERANT" && req.user.managedRestaurantId) {
      where.order = { restaurantId: req.user.managedRestaurantId };
    }
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        order: { select: { id: true, orderNumber: true, restaurantId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

async function moderate(req, res, next) {
  try {
    const { moderationStatus } = req.body;

    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "Avis introuvable" });
    }

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { moderationStatus },
      include: { user: { select: { id: true, name: true } } },
    });

    res.json({ review });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listByRestaurant, listPending, moderate };
