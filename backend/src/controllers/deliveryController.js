const prisma = require("../config/prisma");
const { getIO } = require("../config/socket");

function safeEmit(room, event, data) {
  try {
    getIO().to(room).emit(event, data);
  } catch {
    // Socket.io pas initialisé
  }
}

async function assign(req, res, next) {
  try {
    const { orderId, deliveryPersonId, estimatedTime } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    if (req.user?.role === "GERANT" && order.restaurantId !== req.user.managedRestaurantId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    if (order.channel !== "REMOTE" || order.subType !== "DELIVERY") {
      return res.status(400).json({ error: "Seules les commandes à distance avec livraison peuvent être assignées" });
    }

    if (order.delivery) {
      return res.status(409).json({ error: "Un livreur est déjà assigné à cette commande" });
    }

    const deliveryPerson = await prisma.user.findUnique({
      where: { id: deliveryPersonId },
    });
    if (!deliveryPerson || deliveryPerson.role !== "LIVREUR") {
      return res.status(400).json({ error: "Livreur introuvable" });
    }

    const delivery = await prisma.delivery.create({
      data: { orderId, deliveryPersonId, estimatedTime, status: "assigned" },
      include: { deliveryPerson: { select: { id: true, name: true, phone: true } }, order: true },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "READY_FOR_PICKUP" },
    });

    safeEmit(`order:${orderId}`, "order-status", { id: orderId, status: "READY_FOR_PICKUP" });
    safeEmit(`user:${deliveryPersonId}`, "delivery-assigned", delivery);

    res.status(201).json({ delivery });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const deliveryId = req.params.id;

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      return res.status(404).json({ error: "Livraison introuvable" });
    }

    const allowedTransitions = {
      assigned: ["picked_up"],
      picked_up: ["in_transit", "delivered"],
      in_transit: ["delivered"],
      delivered: [],
    };

    const allowed = allowedTransitions[delivery.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        error: `Transition invalide: ${delivery.status} → ${status}`,
      });
    }

    const updateData = { status };
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
      include: { deliveryPerson: { select: { id: true, name: true, phone: true } }, order: true },
    });

    const orderStatusMap = {
      picked_up: "OUT_FOR_DELIVERY",
      delivered: "DELIVERED",
    };

    if (orderStatusMap[status]) {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: orderStatusMap[status] },
      });
      safeEmit(`order:${delivery.orderId}`, "order-status", {
        id: delivery.orderId,
        status: orderStatusMap[status],
      });
    }

    res.json({ delivery: updated });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, deliveryPersonId, restaurantId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (deliveryPersonId) where.deliveryPersonId = deliveryPersonId;
    if (req.user?.role === "GERANT" && req.user.managedRestaurantId) {
      where.order = { restaurantId: req.user.managedRestaurantId };
    } else if (restaurantId) {
      where.order = { restaurantId };
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            items: { include: { menuItem: { select: { id: true, name: true } } } },
            restaurant: { select: { id: true, name: true, address: true, phone: true } },
          },
        },
        deliveryPerson: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ deliveries });
  } catch (err) {
    next(err);
  }
}

async function getMyDeliveries(req, res, next) {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: {
        deliveryPersonId: req.user.id,
      },
      include: {
        order: {
          include: {
            items: { include: { menuItem: { select: { id: true, name: true } } } },
            restaurant: { select: { id: true, name: true, address: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ deliveries });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: {
        order: {
          include: {
            items: { include: { menuItem: { select: { id: true, name: true } } } },
            restaurant: { select: { id: true, name: true, address: true, phone: true } },
          },
        },
        deliveryPerson: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!delivery) return res.status(404).json({ error: "Livraison introuvable" });
    if (req.user.role === "LIVREUR" && delivery.deliveryPersonId !== req.user.id) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    res.json({ delivery });
  } catch (err) {
    next(err);
  }
}

async function getByOrder(req, res, next) {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { orderId: req.params.orderId },
      include: {
        deliveryPerson: { select: { id: true, name: true, phone: true } },
        order: {
          select: { id: true, orderNumber: true, status: true, deliveryAddress: true },
        },
      },
    });

    if (!delivery) {
      return res.status(404).json({ error: "Aucune livraison pour cette commande" });
    }

    res.json({ delivery });
  } catch (err) {
    next(err);
  }
}

module.exports = { assign, updateStatus, list, getMyDeliveries, getByOrder, getById };
