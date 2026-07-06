const WAVE_API_URL = "https://api.wave.com/v1/checkout/session";
const WAVE_API_KEY = process.env.WAVE_API_KEY || "";
const WAVE_SECRET = process.env.WAVE_SECRET || "";

async function createCheckoutSession({ amount, currency, description, metadata, successUrl, errorUrl }) {
  if (!WAVE_API_KEY) {
    return generateMockSession({ amount, description });
  }

  const response = await fetch(WAVE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WAVE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: currency || "XOF",
      description,
      error_url: errorUrl,
      success_url: successUrl,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error(`Wave API error: ${response.status}`);
  }

  return response.json();
}

function verifyWebhookSignature(body, signature) {
  if (!WAVE_SECRET) return true;
  const crypto = require("crypto");
  const expected = crypto.createHmac("sha256", WAVE_SECRET).update(JSON.stringify(body)).digest("hex");
  return signature === expected;
}

function generateMockSession({ amount, description }) {
  const id = `wave_mock_${Date.now()}`;
  return {
    id,
    url: `https://checkout.wave.com/mock/${id}?amount=${amount}&description=${encodeURIComponent(description)}`,
    mock: true,
  };
}

module.exports = { createCheckoutSession, verifyWebhookSignature };
