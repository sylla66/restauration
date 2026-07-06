const prisma = require("../config/prisma");

async function sales(req, res, next) {
  try {
    const { period, restaurantId } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "day":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const where = {
      status: "DELIVERED",
      createdAt: { gte: startDate },
    };
    if (restaurantId) where.restaurantId = restaurantId;

    const orders = await prisma.order.findMany({
      where,
      select: { total: true, deliveryFee: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalDeliveryFees = orders.reduce((sum, o) => sum + o.deliveryFee, 0);
    const orderCount = orders.length;

    const dailyMap = {};
    orders.forEach((o) => {
      const day = o.createdAt.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + o.total;
    });

    const dailyBreakdown = Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    res.json({
      period: period || "day",
      totalRevenue,
      totalDeliveryFees,
      orderCount,
      averageOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0,
      dailyBreakdown,
    });
  } catch (err) {
    next(err);
  }
}

async function topItems(req, res, next) {
  try {
    const { period, restaurantId, limit } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const where = {
      order: { status: { not: "CANCELLED" }, createdAt: { gte: startDate } },
    };
    if (restaurantId) where.menuItem = { restaurantId };

    const items = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where,
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: parseInt(limit) || 10,
    });

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true, categoryId: true },
    });
    const menuItemMap = Object.fromEntries(menuItems.map((m) => [m.id, m]));

    const topItems = items.map((item) => ({
      menuItemId: item.menuItemId,
      name: menuItemMap[item.menuItemId]?.name || "Inconnu",
      totalSold: item._sum.quantity,
      totalRevenue: item._sum.totalPrice,
    }));

    res.json({ topItems });
  } catch (err) {
    next(err);
  }
}

async function channelDistribution(req, res, next) {
  try {
    const { restaurantId, period } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const where = { createdAt: { gte: startDate } };
    if (restaurantId) where.restaurantId = restaurantId;

    const orders = await prisma.order.findMany({
      where,
      select: { channel: true, subType: true, total: true, status: true },
    });

    const channels = {};
    let totalOrders = orders.length;
    let totalRevenue = 0;

    orders.forEach((o) => {
      if (o.status !== "CANCELLED") totalRevenue += o.total;
      const key = o.channel === "ON_SITE" ? "Sur place" : o.subType === "DELIVERY" ? "Livraison" : "Retrait";
      channels[key] = channels[key] || { count: 0, revenue: 0 };
      channels[key].count++;
      if (o.status !== "CANCELLED") channels[key].revenue += o.total;
    });

    const distribution = Object.entries(channels).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      percentage: totalOrders > 0 ? Math.round((data.count / totalOrders) * 100) : 0,
    }));

    res.json({ distribution, totalOrders, totalRevenue });
  } catch (err) {
    next(err);
  }
}

async function cancellationRate(req, res, next) {
  try {
    const { restaurantId, period } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const where = { createdAt: { gte: startDate } };
    if (restaurantId) where.restaurantId = restaurantId;

    const total = await prisma.order.count({ where });
    const cancelled = await prisma.order.count({ where: { ...where, status: "CANCELLED" } });

    res.json({
      period: period || "day",
      totalOrders: total,
      cancelledOrders: cancelled,
      rate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    });
  } catch (err) {
    next(err);
  }
}

async function deliveryTimes(req, res, next) {
  try {
    const { restaurantId, period } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const where = {
      status: "delivered",
      deliveredAt: { not: null },
      createdAt: { gte: startDate },
      order: { status: "DELIVERED" },
    };
    if (restaurantId) where.order = { ...where.order, restaurantId };

    const deliveries = await prisma.delivery.findMany({
      where,
      select: { createdAt: true, deliveredAt: true },
    });

    const times = deliveries
      .map((d) => (d.deliveredAt.getTime() - d.createdAt.getTime()) / 60000)
      .filter((t) => t > 0);

    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    res.json({
      period: period || "day",
      totalDeliveries: times.length,
      averageDeliveryTimeMin: avgTime,
      fastestMin: times.length > 0 ? Math.round(Math.min(...times)) : 0,
      slowestMin: times.length > 0 ? Math.round(Math.max(...times)) : 0,
    });
  } catch (err) {
    next(err);
  }
}

async function exportCSV(req, res, next) {
  try {
    const { startDate, endDate, restaurantId } = req.query;

    const where = {
      createdAt: {
        gte: startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0)),
        lte: endDate ? new Date(endDate) : new Date(),
      },
    };
    if (restaurantId) where.restaurantId = restaurantId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: { select: { name: true } } } },
        user: { select: { name: true, phone: true } },
        payments: { select: { method: true, status: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const header = "Numéro,Date,Canal,Sous-type,Statut,Client,Téléphone,Plats,Total (FCFA),Paiement,Méthode";
    const rows = orders.map((o) => {
      const items = o.items.map((i) => `${i.menuItem.name} x${i.quantity}`).join("; ");
      const payment = o.payments.find((p) => p.status === "SUCCEEDED") || o.payments[0] || {};
      return [
        o.orderNumber,
        o.createdAt.toISOString(),
        o.channel,
        o.subType || "-",
        o.status,
        o.user?.name || "Invité",
        o.user?.phone || "-",
        `"${items}"`,
        o.total,
        payment.status || "-",
        payment.method || "-",
      ].join(",");
    });

    const csv = `${header}\n${rows.join("\n")}`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=orders_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { sales, topItems, channelDistribution, cancellationRate, deliveryTimes, exportCSV };
