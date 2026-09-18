/**
 * FinGrow AI - Dynamic UPI QR Code Generation Service
 * Compliant with NPCI Unified Payments Interface (UPI) Deep-link Standard
 */

const QRCode = require("qrcode");

/**
 * Builds the canonical UPI payment URI string
 */
function buildUpiString({ businessName, upiId, amount, note }) {
  if (!upiId || typeof upiId !== "string" || !upiId.includes("@")) {
    throw new Error("A valid UPI ID format (e.g. yourname@bank) is required");
  }

  const cleanName = (businessName || "Merchant").trim();
  const cleanUpi = upiId.trim();

  const params = new URLSearchParams();
  params.append("pa", cleanUpi);
  params.append("pn", cleanName);
  params.append("cu", "INR");

  if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
    params.append("am", Number(amount).toFixed(2));
  }

  if (note && typeof note === "string" && note.trim().length > 0) {
    params.append("tn", note.trim().slice(0, 50));
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates dynamic high-res QR code as DataURL and SVG
 */
async function generateUpiQr({ businessName, upiId, amount, note }) {
  const upiUri = buildUpiString({ businessName, upiId, amount, note });

  const qrDataUrl = await QRCode.toDataURL(upiUri, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 480,
    color: {
      dark: "#064e3b", // Deep emerald for professional fintech feel
      light: "#ffffff"
    }
  });

  const qrSvg = await QRCode.toString(upiUri, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#064e3b",
      light: "#ffffff"
    }
  });

  return {
    upiUri,
    qrDataUrl,
    qrSvg,
    businessName: businessName || "Merchant",
    upiId,
    amount: amount ? Number(amount).toFixed(2) : null,
    note: note || "",
    currency: "INR",
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  buildUpiString,
  generateUpiQr
};
