/**
 * FinGrow AI - ScamShield Financial Scam Detection Service
 * Analyzes questionable loan offers, grant notifications, and investment messages
 * to safeguard micro-entrepreneurs from predatory advance-fee scams.
 */

const SCAM_PATTERNS = [
  {
    id: "upfront_fee",
    regex: /(?:pay|send|transfer|deposit|advance)\s*(?:rs\.?|inr|₹)?\s*[0-9,]+.*(?:processing fee|file charge|registration|approval fee|stamp fee|gst charge|insurance|security deposit|clearance fee|to receive|to release|to disburse)/i,
    flag: "Upfront payment request to unlock funds",
    explanation: "Legitimate lenders and government schemes NEVER demand advance processing fees via personal UPI or bank transfer before disbursing money. Any fee is deducted from the disbursed amount.",
    weight: 9
  },
  {
    id: "reverse_upfront",
    regex: /(?:processing fee|file charge|registration fee|approval fee).*(?:pay|send|transfer|deposit|upi)/i,
    flag: "Upfront fee solicited prior to disbursement",
    explanation: "Asking for money before delivering a loan or grant is the #1 hallmark of advance-fee loan scams.",
    weight: 9
  },
  {
    id: "gov_impersonation",
    regex: /(?:congratulations|approved|selected|sanctioned).*(?:government|pm\s*yojana|mudra|pmegp|rbi|ministry|sbi|grant|central subsidy)/i,
    flag: "Unverified government or institutional endorsement",
    explanation: "Government bodies like Mudra, KVIC, or DPIIT do not send direct SMS/WhatsApp approval messages promising money without formal portal application and bank KYC.",
    weight: 8
  },
  {
    id: "urgency_pressure",
    regex: /(?:today only|immediately|urgent|within\s*[0-9]+\s*(?:hours|mins|minutes)|expires shortly|limited time|act now|instant disburse)/i,
    flag: "Pressure to act immediately (Manufactured urgency)",
    explanation: "Scammers manufacture artificial urgency to prevent you from independently verifying the offer with your local bank or official portals.",
    weight: 6
  },
  {
    id: "upi_channel",
    regex: /(?:upi id|gpay|phonepe|paytm|scan qr|send to this upi|whatsapp)/i,
    flag: "Suspicious peer-to-peer payment channel",
    explanation: "Official bank loan fees and government applications are never processed via personal UPI IDs or random QR codes.",
    weight: 7
  },
  {
    id: "credentials_solicitation",
    regex: /(?:otp|pin|password|cvv|bank login|netbanking|card number)/i,
    flag: "Request for confidential financial credentials",
    explanation: "Never disclose your UPI PIN, OTP, or passwords. Genuine lenders only verify identity through official KYC documents and signed mandate forms.",
    weight: 10
  },
  {
    id: "guaranteed_no_cibil",
    regex: /(?:no cibil|no credit check|100% guaranteed|no document|instant approval.*without)/i,
    flag: "Unrealistic guarantee without credit checks",
    explanation: "No authentic financial institution offers guaranteed loans without basic verification or underwriting.",
    weight: 5
  }
];

function analyzeFinancialOffer(offerText = '') {
  if (!offerText || typeof offerText !== 'string' || offerText.trim().length === 0) {
    return {
      riskLevel: "LOW RISK",
      riskScore: 1,
      verdict: "No specific offer text provided for analysis.",
      warningIndicators: [],
      whyFlagged: ["Please submit the message text or screenshot content of the financial offer you received."],
      whatYouShouldDo: [
        "Always cross-check loan offers at your local bank branch.",
        "Check official scheme portals (e.g., mudra.org.in or kviconline.gov.in) directly."
      ],
      disclaimer: "ScamShield provides risk indicators, not a legal or official scam determination.",
      analyzedAt: new Date().toISOString()
    };
  }

  const text = offerText.trim();
  const matchedPatterns = [];
  let totalScore = 0;

  for (const item of SCAM_PATTERNS) {
    if (item.regex.test(text)) {
      matchedPatterns.push(item);
      totalScore += item.weight;
    }
  }

  // Risk classification
  let riskLevel = "LOW RISK";
  let verdict = "Potential risk appears low based on scanned text. Always verify the source.";

  if (totalScore >= 8 || matchedPatterns.some(p => p.id === 'upfront_fee' || p.id === 'reverse_upfront' || p.id === 'credentials_solicitation')) {
    riskLevel = "HIGH RISK";
    verdict = "Potential high-risk scam detected. Multiple red flags match classic advance-fee fraud patterns.";
  } else if (totalScore >= 4 || matchedPatterns.length > 0) {
    riskLevel = "CAUTION";
    verdict = "Potential risk detected. Elements of this offer require independent verification before taking any action.";
  }

  const warningIndicators = matchedPatterns.map(p => `🚩 ${p.flag}`);
  const whyFlagged = matchedPatterns.map(p => `${p.flag}: ${p.explanation}`);

  if (whyFlagged.length === 0) {
    whyFlagged.push("The analyzed text does not trigger known advance-fee or predatory loan keywords, but always ensure you are dealing directly with licensed entities.");
  }

  const whatYouShouldDo = [
    "Verify the opportunity directly through the official organization website or bank branch.",
    "Do NOT send any money, processing fee, or security deposit simply to unlock a supposed grant or loan.",
    "Never share OTPs, UPI PINs, passwords, or banking login credentials.",
    "Confirm the sender's identity through verified customer support channels, not the phone number in the message."
  ];

  if (riskLevel === "HIGH RISK") {
    whatYouShouldDo.unshift("CEASE ALL CONTACT: Do not pay any amount or reply to the sender.");
  }

  return {
    riskLevel,
    riskScore: Math.min(10, Math.max(1, totalScore || 1)),
    verdict,
    warningIndicators,
    whyFlagged,
    whatYouShouldDo,
    disclaimer: "ScamShield provides risk indicators, not a legal or official scam determination.",
    analyzedTextPreview: text.length > 120 ? text.slice(0, 120) + "..." : text,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  analyzeFinancialOffer
};