const prisma = require("../config/prisma");
const { getIO } = require("../config/socket");
const { generateOrderNumber } = require("../utils/orderNumber");

function safeEmit(room, event, data) {
  try {
    getIO().to(room).emit(event, data);
  } catch {
    // Socket.io pas initialisé (tests ou démarrage)
  }
}

const DELIVERY_FEE = 1000;

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["READY_FOR_PICKUP", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  READY_FOR_PICKUP: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

async function createOnSite(req, res, next) {
  try {
    const { restaurantId, items, notes } = req.body;

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ error: "Un ou plusieurs plats sont introuvables" });
    }

    const unavailable = menuItems.filter((m) => !m.isAvailable);
    if (unavailable.length > 0) {
      return res.status(400).json({
        error: `Plats indisponibles : ${unavailable.map((m) => m.name).join(", ")}`,
      });
    }

    const itemMap = Object.fromEntries(menuItems.map((m) => [m.id, m]));
    let subtotal = 0;

    const orderItemsData = items.map((item) => {
      const menuItem = itemMap[item.menuItemId];
      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
      };
    });

    const orderNumber = generateOrderNumber("ON_SITE");

    const order = await prisma.order.create({
      data: {
        orderNumber,
        channel: "ON_SITE",
        status: "PENDING",
        userId: req.user?.id,
        restaurantId,
        subtotal,
        deliveryFee: 0,
        total: subtotal,
        notes,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
      },
    });

    safeEmit(`restaurant:${restaurantId}`, "new-order", order);

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

async function createRemote(req, res, next) {
  try {
    const { restaurantId, subType, items, deliveryAddress, deliveryNeighborhood, scheduledAt, notes } = req.body;

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant || !restaurant.isActive) {
      return res.status(400).json({ error: "Restaurant introuvable ou fermé" });
    }

    if (subType === "DELIVERY" && restaurant.deliveryZones) {
      const zones = restaurant.deliveryZones;
      const neighborhood = deliveryNeighborhood || deliveryAddress || "";
      const inZone = zones.some((z) => neighborhood.toLowerCase().includes(z.toLowerCase()));
      if (!inZone) {
        return res.status(400).json({
          error: `Adresse hors zone de livraison. Zones couvertes : ${zones.join(", ")}`,
        });
      }
    }

    if (scheduledAt && new Date(scheduledAt) <= new Date()) {
      return res.status(400).json({ error: "Le créneau doit être dans le futur" });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, restaurantId },
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ error: "Un ou plusieurs plats sont introuvables" });
    }

    const unavailable = menuItems.filter((m) => !m.isAvailable);
    if (unavailable.length > 0) {
      return res.status(400).json({
        error: `Plats indisponibles : ${unavailable.map((m) => m.name).join(", ")}`,
      });
    }

    const itemMap = Object.fromEntries(menuItems.map((m) => [m.id, m]));
    let subtotal = 0;

    const orderItemsData = items.map((item) => {
      const menuItem = itemMap[item.menuItemId];
      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
      };
    });

    const deliveryFee = subType === "DELIVERY" ? DELIVERY_FEE : 0;
    const orderNumber = generateOrderNumber("REMOTE");

    const order = await prisma.order.create({
      data: {
        orderNumber,
        channel: "REMOTE",
        subType,
        status: "PENDING",
        userId: req.user?.id,
        restaurantId,
        deliveryAddress: subType === "DELIVERY" ? deliveryAddress : null,
        deliveryFee,
        subtotal,
        total: subtotal + deliveryFee,
        scheduledAt: scheduledAt || null,
        notes,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        restaurant: { select: { id: true, name: true, deliveryZones: true } },
      },
    });

    safeEmit(`restaurant:${restaurantId}`, "new-order", order);

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, channel, restaurantId, search, page, limit } = req.query;
    const where = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (restaurantId) where.restaurantId = restaurantId;
    if (req.query.userId) where.userId = req.query.userId;

    if (req.user?.role === "CLIENT") {
      where.userId = req.user.id;
    }
    if (req.user?.role === "GERANT" && req.user.managedRestaurantId) {
      where.restaurantId = req.user.managedRestaurantId;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
          restaurant: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, phone: true } },
          delivery: { include: { deliveryPerson: { select: { id: true, name: true, phone: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: pageNum, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        restaurant: { select: { id: true, name: true } },
        payments: true,
        delivery: true,
      },
    });
    if (!order) {
      return res.status(404).json({ error: "Commande introuvable" });
    }
    if (req.user?.role === "GERANT" && order.restaurantId !== req.user.managedRestaurantId) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "Commande introuvable" });
    }
    if (req.user?.role === "GERANT" && existing.restaurantId !== req.user.managedRestaurantId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const allowed = VALID_TRANSITIONS[existing.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        error: `Transition invalide: ${existing.status} → ${status}`,
      });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        restaurant: { select: { id: true, name: true } },
      },
    });

    safeEmit(`order:${order.id}`, "order-status", { id: order.id, status: order.status });

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    if (existing.status === "DELIVERED" || existing.status === "CANCELLED") {
      return res.status(400).json({ error: "Impossible d'annuler cette commande" });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
      include: { items: { include: { menuItem: { select: { id: true, name: true } } } } },
    });

    safeEmit(`order:${order.id}`, "order-status", { id: order.id, status: "CANCELLED" });

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOnSite, createRemote, list, getById, updateStatus, cancel };
