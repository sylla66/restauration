const prisma = require("../config/prisma");
const paymentService = require("../services/paymentService");

async function initiate(req, res, next) {
  try {
    const { orderId, method, successUrl, errorUrl } = req.body;

    const result = await paymentService.initiatePayment({
      orderId,
      method,
      userId: req.user?.id,
      successUrl,
      errorUrl,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function confirmOnDelivery(req, res, next) {
  try {
    const { orderId } = req.body;

    const payment = await paymentService.confirmCashOnDelivery({
      orderId,
      userId: req.user?.id,
    });

    res.json({ payment, message: "Paiement confirmé" });
  } catch (err) {
    next(err);
  }
}

async function webhook(req, res, next) {
  try {
    const signature = req.headers["x-wave-signature"] || "";
    const result = await paymentService.handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function listByOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ payments });
  } catch (err) {
    next(err);
  }
}

module.exports = { initiate, confirmOnDelivery, webhook, listByOrder };
