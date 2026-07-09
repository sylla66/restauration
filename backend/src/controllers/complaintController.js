const prisma = require("../config/prisma");

async function create(req, res, next) {
  try {
    const { orderId, reason, description } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    if (order.status !== "DELIVERED") {
      return res.status(400).json({ error: "Vous pouvez uniquement réclamer pour une commande livrée" });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: "Cette commande ne vous appartient pas" });
    }

    const existing = await prisma.complaint.findFirst({
      where: { orderId, userId: req.user.id, status: { not: "DISMISSED" } },
    });
    if (existing) {
      return res.status(409).json({ error: "Vous avez déjà une réclamation ouverte pour cette commande" });
    }

    const complaint = await prisma.complaint.create({
      data: { orderId, userId: req.user.id, reason, description },
      include: {
        order: { select: { id: true, orderNumber: true } },
        user: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ complaint });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    if (req.user.role === "CLIENT") {
      where.userId = req.user.id;
    }
    if (req.user?.role === "GERANT" && req.user.managedRestaurantId) {
      where.order = { restaurantId: req.user.managedRestaurantId };
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        order: { select: { id: true, orderNumber: true, restaurantId: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ complaints });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, resolution } = req.body;

    const existing = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "Réclamation introuvable" });
    }

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status, resolution, resolvedBy: req.user.name },
      include: {
        order: { select: { id: true, orderNumber: true } },
        user: { select: { id: true, name: true } },
      },
    });

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, updateStatus };
