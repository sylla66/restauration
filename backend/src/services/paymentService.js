const prisma = require("../config/prisma");
const waveService = require("./waveService");

const AGGREGATOR_MODE = process.env.PAYMENT_AGGREGATOR || "wave";

async function initiatePayment({ orderId, method, userId, successUrl, errorUrl }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { restaurant: true, payments: true },
  });

  if (!order) {
    throw Object.assign(new Error("Commande introuvable"), { status: 404 });
  }

  if (order.status === "CANCELLED") {
    throw Object.assign(new Error("Impossible de payer une commande annulée"), { status: 400 });
  }

  const existingPayment = order.payments.find((p) => p.status === "SUCCEEDED");
  if (existingPayment) {
    throw Object.assign(new Error("Cette commande est déjà payée"), { status: 409 });
  }

  const payment = await prisma.payment.create({
    data: {
      orderId,
      amount: order.total,
      method,
      status: "PENDING",
      userId,
      referenceId: order.id,
      referenceModel: "Order",
    },
  });

  if (method === "WAVE") {
    const session = await waveService.createCheckoutSession({
      amount: order.total,
      currency: "XOF",
      description: `Commande ${order.orderNumber}`,
      successUrl: successUrl || `${process.env.CORS_ORIGIN}/orders/${order.id}`,
      errorUrl: errorUrl || `${process.env.CORS_ORIGIN}/orders/${order.id}/payment`,
      metadata: { orderId: order.id, paymentId: payment.id },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: session.id, metadata: { ...session, ...(payment.metadata || {}) } },
    });

    return { payment, checkoutUrl: session.url };
  }

  if (method === "ORANGE_MONEY") {
    if (AGGREGATOR_MODE === "paydunya") {
      const session = await createPayDunyaSession({ order, payment });
      return { payment, checkoutUrl: session.url };
    }
    return { payment, message: "Redirection vers Orange Money", checkoutUrl: null };
  }

  if (method === "CASH" || method === "MOBILE_MONEY") {
    return { payment, checkoutUrl: null };
  }

  throw Object.assign(new Error("Méthode de paiement non supportée"), { status: 400 });
}

async function confirmPayment({ paymentId, transactionId }) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    throw Object.assign(new Error("Paiement introuvable"), { status: 404 });
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "SUCCEEDED",
      transactionId: transactionId || payment.transactionId,
      paidAt: new Date(),
    },
  });

  await updateOrderAfterPayment(payment.orderId);

  return updated;
}

async function confirmCashOnDelivery({ orderId, userId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });

  if (!order) {
    throw Object.assign(new Error("Commande introuvable"), { status: 404 });
  }

  let payment = order.payments.find((p) => p.method === "CASH" || p.method === "MOBILE_MONEY");

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        method: "CASH",
        status: "SUCCEEDED",
        userId,
        referenceId: order.id,
        referenceModel: "Order",
        paidAt: new Date(),
      },
    });
  } else {
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCEEDED", paidAt: new Date() },
    });
  }

  await updateOrderAfterPayment(orderId);

  return payment;
}

async function handleWebhook(payload, signature) {
  const valid = waveService.verifyWebhookSignature(payload, signature);
  if (!valid) {
    throw Object.assign(new Error("Signature webhook invalide"), { status: 401 });
  }

  const event = typeof payload === "string" ? JSON.parse(payload) : payload;

  if (event.type === "checkout.session.completed") {
    const { paymentId } = event.data.metadata || {};
    if (paymentId) {
      return confirmPayment({ paymentId, transactionId: event.data.id });
    }
  }

  return { received: true };
}

async function updateOrderAfterPayment(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order && order.status === "PENDING") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    });
  }
}

async function createPayDunyaSession({ order, payment }) {
  return {
    id: `pd_${Date.now()}`,
    url: `https://paydunya.com/mock/${payment.id}`,
  };
}

module.exports = { initiatePayment, confirmPayment, confirmCashOnDelivery, handleWebhook };
