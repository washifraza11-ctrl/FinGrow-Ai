/**
 * FinGrow AI - Digital Payment & UPI Fraud Detection Service
 * Analyzes payment scenarios, transaction requests, and communication patterns for micro-merchants.
 */

const HIGH_RISK_PATTERNS = [
  {
    regex: /scan.*(?:qr|code).*(?:receive|get|credit|collect|accept)/i,
    flag: "Reverse QR Code Scam (Scanning a QR is strictly to SEND money, never to receive)",
    weight: 9
  },
  {
    regex: /(?:receive|get|credit).*(?:scan|scanning).*(?:qr|code)/i,
    flag: "Reverse QR Code Scam (Scanning a QR will DEBIT your account)",
    weight: 9
  },
  {
    regex: /(?:enter|share|give|provide|send).*(?:upi|mpin|pin|passcode)/i,
    flag: "PIN Solicitation (UPI PIN is ONLY entered to AUTHORIZE DEBITS, never to receive money)",
    weight: 10
  },
  {
    regex: /(?:share|give|tell|enter).*(?:otp|one time password|sms code)/i,
    flag: "OTP Compromise Attempt (Bank or payment OTP must never be disclosed to anyone)",
    weight: 9
  },
  {
    regex: /(?:install|download).*(?:anydesk|teamviewer|quicksupport|rustdesk|screen.*share|apk)/i,
    flag: "Malicious Remote Access / Unverified APK Installation",
    weight: 10
  },
  {
    regex: /(?:collect request|requesting money|requested.*rupees|requested.*rs).*(?:saying.*paying|claim.*sent)/i,
    flag: "Deceptive UPI Collect Request (Sender is asking YOU to pay them instead of paying you)",
    weight: 9
  },
  {
    regex: /(?:army|defence|military|officer|transferred).*(?:barracks|cantt|advance|booking).*(?:qr|link)/i,
    flag: "Army / Defense Personnel Impersonation Scam",
    weight: 8
  },
  {
    regex: /(?:refund|overpaid|accidental|by mistake.*extra).*(?:return|send back|qr|link)/i,
    flag: "Overpayment / Accidental Transfer Trap (Fake payment screenshot / SMS)",
    weight: 8
  }
];

const MEDIUM_RISK_PATTERNS = [
  {
    regex: /(?:click.*link|bit\.ly|tinyurl|http|web link|portal).*(?:payment|claim|approve)/i,
    flag: "Unverified Third-party Payment Link",
    weight: 6
  },
  {
    regex: /(?:urgent|immediately|within 5 minutes|account will be blocked|bank manager)/i,
    flag: "Manufactured Urgency / Authority Impersonation",
    weight: 6
  },
  {
    regex: /(?:screenshot|payment slip|sms from 10-digit).*(?:already paid|show proof)/i,
    flag: "Unconfirmed Payment (Relying on buyer screenshots instead of your bank passbook/app)",
    weight: 5
  },
  {
    regex: /(?:lottery|prize|reward|cashback|congratulations).*(?:claim|process fee)/i,
    flag: "Advance Fee / Reward Claim Bait",
    weight: 7
  }
];

function analyzePaymentSituation(scenarioText = '') {
  if (!scenarioText || typeof scenarioText !== 'string' || scenarioText.trim().length === 0) {
    return {
      riskLevel: "Low Risk",
      riskScore: 1,
      summary: "No suspicious factors identified. Please provide specific details of the payment request.",
      identifiedFlags: [],
      criticalWarnings: [
        "Never enter your UPI PIN to receive money.",
        "Always verify transactions directly in your bank statement or merchant soundbox/app."
      ],
      immediateAction: "Verify your bank balance directly before handing over goods.",
      safetyRules: getGeneralSafetyRules(),
      disclaimer: "Security guidance is informational. Always verify suspicious transactions through your bank/payment provider."
    };
  }

  const text = scenarioText.toLowerCase();
  const matchedFlags = [];
  let totalScore = 0;

  for (const item of HIGH_RISK_PATTERNS) {
    if (item.regex.test(text)) {
      matchedFlags.push(item.flag);
      totalScore += item.weight;
    }
  }

  for (const item of MEDIUM_RISK_PATTERNS) {
    if (item.regex.test(text)) {
      matchedFlags.push(item.flag);
      totalScore += item.weight;
    }
  }

  let riskLevel = "Low Risk";
  let summary = "";
  let immediateAction = "";

  if (totalScore >= 8 || matchedFlags.some(f => f.includes("Reverse QR") || f.includes("PIN") || f.includes("Remote Access"))) {
    riskLevel = "High Risk";
    summary = "CRITICAL ALERT: This scenario closely matches active UPI fraud patterns. Do NOT proceed or approve any transaction.";
    immediateAction = "STOP immediately. Do not scan any QR, do not enter your UPI PIN, do not install any app, and do not approve any collect request.";
  } else if (totalScore >= 4 || matchedFlags.length > 0) {
    riskLevel = "Review Carefully";
    summary = "CAUTION: This scenario contains suspicious elements that require independent verification before you take action.";
    immediateAction = "Check your merchant banking application directly to confirm if funds actually reached your account. Do not rely on links or buyer screenshots.";
  } else {
    riskLevel = "Low Risk";
    summary = "No immediate scam triggers detected based on common fraud patterns, but standard safety discipline must always be followed.";
    immediateAction = "Ensure the payment shows as credited in your bank account or merchant terminal before releasing products.";
  }

  return {
    riskLevel,
    riskScore: Math.min(10, Math.max(1, totalScore || 1)),
    summary,
    identifiedFlags: matchedFlags.length > 0 ? matchedFlags : ["Standard transaction inquiry - no overt red flags detected"],
    criticalWarnings: [
      "GOLDEN RULE: You NEVER need to enter your UPI PIN to RECEIVE payment.",
      "Scanning a QR code DEBITS money from your account. It never deposits money into your account.",
      "Never share OTPs, passcodes, or install screen sharing software (AnyDesk, TeamViewer).",
      "Do not trust SMS receipts from normal 10-digit mobile numbers; only trust SMS from official bank alphanumeric IDs (e.g., VM-HDFCBK, AX-SBIINB)."
    ],
    immediateAction,
    safetyRules: getGeneralSafetyRules(),
    disclaimer: "Security guidance is informational. Always verify suspicious transactions through your bank/payment provider."
  };
}

function getGeneralSafetyRules() {
  return [
    {
      title: "PIN Is Only To Pay",
      desc: "To receive money, the buyer only needs your UPI ID or QR code. No PIN entry is ever needed on your phone."
    },
    {
      title: "QR Codes Transfer Out",
      desc: "Whenever you scan a QR code with GPay/PhonePe/Paytm, money LEAVES your bank account."
    },
    {
      title: "Reject Collect Requests",
      desc: "If a notification asks you to 'Authorize ₹X payment' from someone claiming to pay you, decline immediately."
    },
    {
      title: "No Remote Access Tools",
      desc: "No bank or genuine customer will ever ask you to install AnyDesk or QuickSupport to verify payment."
    }
  ];
}

module.exports = {
  analyzePaymentSituation,
  getGeneralSafetyRules
};
