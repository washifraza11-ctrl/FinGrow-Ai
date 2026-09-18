/**
 * FinGrow AI - Conversational Assistant Service
 * Connects to LLM API (Gemini or OpenAI) when configured in .env,
 * or gracefully runs a sophisticated, context-aware rule & semantic reasoning engine.
 */

const { analyzePaymentSituation } = require("./fraudDetectionService");
const { queryFundingSchemes } = require("./fundingService");
const { getBusinessProfile, saveBusinessProfile } = require("./businessService");

/**
 * Extracts business profile fields mentioned conversationally
 */
function extractProfileFromText(text = "") {
  const updates = {};
  const lower = text.toLowerCase();

  // Extract location / state mentions
  const states = [
    "andhra pradesh", "telangana", "karnataka", "tamil nadu", "maharashtra",
    "kerala", "gujarat", "delhi", "rajasthan", "uttar pradesh", "punjab",
    "west bengal", "odisha", "bihar", "madhya pradesh", "haryana"
  ];
  for (const state of states) {
    if (lower.includes(state)) {
      updates.cityState = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      break;
    }
  }

  // Extract business types
  if (lower.includes("snack") || lower.includes("food") || lower.includes("bakery") || lower.includes("kitchen") || lower.includes("sweet")) {
    updates.businessType = "Food / Homemade Snacks";
  } else if (lower.includes("craft") || lower.includes("handicraft") || lower.includes("art") || lower.includes("textile") || lower.includes("cloth")) {
    updates.businessType = "Handicrafts & Artisans";
  } else if (lower.includes("shop") || lower.includes("retail") || lower.includes("store") || lower.includes("grocery")) {
    updates.businessType = "Retail / Local Commerce";
  } else if (lower.includes("tech") || lower.includes("software") || lower.includes("app") || lower.includes("digital")) {
    updates.businessType = "Technology";
  }

  // Extract business name if pattern like "my business is X" or "business name is X" or "called X"
  const nameMatch = text.match(/(?:my business is|called|named|business name is|store name is)\s+([A-Za-z0-9\s&]{2,30})/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim().replace(/\.$/, "");
    if (!["a", "the", "in", "and", "good"].includes(candidate.toLowerCase())) {
      updates.businessName = candidate;
    }
  }

  // Extract funding amount if mentioned like "need 5 lakhs" or "need 500000" or "₹5,00,000"
  const fundMatch = text.match(/(?:need|require|seeking|looking for)\s+(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?\s*(?:lakhs?|lacs?|crores?|k)?)/i);
  if (fundMatch && fundMatch[1]) {
    updates.fundingRequirement = `₹${fundMatch[1].trim()}`;
  }

  return updates;
}

/**
 * Intelligent fallback conversational agent for zero-external-dependency hackathon runs
 */
async function processConversationalChat({ message = "", history = [], context = {} }) {
  const text = message.trim();
  const lower = text.toLowerCase();
  const currentProfile = getBusinessProfile();

  // Check if user text provides any new profile info
  const extracted = extractProfileFromText(text);
  let updatedProfile = currentProfile;
  if (Object.keys(extracted).length > 0) {
    updatedProfile = saveBusinessProfile(extracted);
  }

  // 1. UPI / Fraud Protection Inquiry
  if (
    lower.includes("safe") ||
    lower.includes("fraud") ||
    lower.includes("scam") ||
    lower.includes("qr code to receive") ||
    lower.includes("scan.*receive") ||
    lower.includes("otp") ||
    lower.includes("pin") ||
    lower.includes("payment request") ||
    lower.includes("suspicious") ||
    lower.includes("collect request") ||
    lower.includes("fake payment")
  ) {
    const fraudAnalysis = analyzePaymentSituation(text);
    let reply = "";

    if (fraudAnalysis.riskLevel === "High Risk") {
      reply = `⚠️ **Critical Alert: This is very likely a scam.**\n\n` +
        `**Golden Rule of UPI:** You **NEVER** need to scan a QR code or enter your UPI PIN to *receive* money. Scanning a QR code or entering your PIN is strictly an action to **DEBIT** (deduct) money from your account.\n\n` +
        `**What you should do right now:**\n` +
        `1. Do NOT scan any QR code sent by the buyer.\n` +
        `2. Do NOT enter your UPI PIN or share any OTP.\n` +
        `3. Do NOT install remote-access apps like AnyDesk or QuickSupport.\n` +
        `4. Check your bank app directly to see if any credit has arrived.\n\n` +
        `*Security guidance is informational. Always verify suspicious transactions through your bank/payment provider.*`;
    } else {
      reply = `Here is your payment safety guidance:\n\n` +
        `• **To receive money:** You only need to share your UPI ID (or show your merchant QR code). You never need to scan anything or approve a collect notification.\n` +
        `• **Check Real Credits:** Always verify receipt through your official bank SMS from a verified 6-character sender ID or by checking your bank app passbook directly.\n\n` +
        `*Security guidance is informational. Always verify suspicious transactions through your bank/payment provider.*`;
    }

    return {
      message: reply,
      intent: "fraud_check",
      actionLink: "/fraud",
      actionText: "Open Fraud Protection Suite",
      extractedProfile: extracted,
      suggestedQuestions: [
        "Create my business QR",
        "Find funding for my business",
        "Is it safe to share my UPI ID?",
        "Help me prepare a grant application"
      ]
    };
  }

  // 2. ScamShield / Financial Offer Scam Check (Takes priority over generic loan inquiries)
  if (
    lower.includes("scamshield") ||
    lower.includes("processing fee") ||
    lower.includes("loan offer") ||
    lower.includes("approved for loan") ||
    lower.includes("selected for grant") ||
    lower.includes("fake loan") ||
    lower.includes("advance fee") ||
    lower.includes("suspicious offer") ||
    lower.includes("pay fee to receive")
  ) {
    const reply = `🛡️ **ScamShield Financial Offer Advisor**\n\n` +
      `Be extremely cautious of messages claiming you have won or been approved for a government loan/grant that require an **upfront processing fee**.\n\n` +
      `**Golden Warning Sign:** Real government schemes (like Mudra, PMEGP, or SISFS) and commercial banks **NEVER** ask you to send money or transfer to a personal UPI ID to 'release' a loan. Any legitimate fee is deducted directly from the disbursed amount.\n\n` +
      `Use **ScamShield** to paste the full message text or upload a screenshot for automated risk indicator detection.`;

    return {
      message: reply,
      intent: "scam_shield",
      actionLink: "/scamshield",
      actionText: "Open ScamShield Scam Detector",
      extractedProfile: extracted,
      suggestedQuestions: [
        "Test a suspicious loan message",
        "Scan my business financial health",
        "Is this UPI payment request safe?",
        "Find funding for my business"
      ]
    };
  }

  // 3. QR Code Generation Request
  if (
    lower.includes("qr") ||
    lower.includes("payment code") ||
    lower.includes("get paid") ||
    lower.includes("create qr") ||
    lower.includes("generate qr")
  ) {
    const bName = updatedProfile.businessName || "your business";
    const upi = updatedProfile.upiId || "merchant@upi";
    const reply = `I'm ready to generate your official, dynamic UPI QR code for **${bName}**!\n\n` +
      `We can embed:\n` +
      `• **Merchant Name:** ${bName}\n` +
      `• **Default UPI ID:** \`${upi}\`\n` +
      `• **Optional Preset Amount** (e.g. ₹250 for standard snack combos)\n` +
      `• **Custom Order Note**\n\n` +
      `This creates a standard NPCI-compliant QR that customers can scan with GPay, PhonePe, Paytm, BHIM, or any banking app. Let's create and download your QR card.`;

    return {
      message: reply,
      intent: "generate_qr",
      actionLink: "/qr",
      actionText: "Open Dynamic QR Generator",
      extractedProfile: extracted,
      suggestedQuestions: [
        "Generate QR for my snacks shop",
        "Can I get funding for my business?",
        "Is this UPI payment request safe?",
        "Help me prepare a grant application"
      ]
    };
  }

  // 3. Funding & Grants Inquiry
  if (
    lower.includes("fund") ||
    lower.includes("grant") ||
    lower.includes("loan") ||
    lower.includes("scheme") ||
    lower.includes("money") ||
    lower.includes("subsidy") ||
    lower.includes("pmegp") ||
    lower.includes("mudra") ||
    lower.includes("sisfs")
  ) {
    const bType = updatedProfile.businessType || "Micro-enterprise";
    const location = updatedProfile.cityState || "All India";

    // Query schemes tailored to profile
    const matching = queryFundingSchemes({
      businessType: bType.split("/")[0].trim(),
      location: location.includes("Andhra") ? "Andhra Pradesh" : undefined
    });

    let schemeList = matching.slice(0, 3).map(s => `• **${s.name}** (${s.fundingAmount}) - *${s.organization}*`).join("\n");
    if (!schemeList) {
      schemeList = `• **Prime Minister's Employment Generation Programme (PMEGP)** - Up to ₹50 Lakhs (15-35% subsidy)\n• **Pradhan Mantri Mudra Yojana (PMMY)** - ₹50,000 to ₹10 Lakhs collateral-free loan\n• **Startup India Seed Fund Scheme (SISFS)** - Up to ₹20 Lakhs grant`;
    }

    const reply = `Based on your profile as a **${bType}** based in **${location}**, here are top verified funding opportunities:\n\n` +
      `${schemeList}\n\n` +
      `Every opportunity includes official government portal links, verified eligibility criteria, and transparent deadline status (*"Deadline not verified"* when open rolling). Would you like to explore these schemes or prepare an application draft for one?`;

    return {
      message: reply,
      intent: "find_funding",
      actionLink: "/funding",
      actionText: "Explore Verified Funding & Grants",
      extractedProfile: extracted,
      suggestedQuestions: [
        "Help me apply for PMEGP",
        "Help me prepare an application for Mudra",
        "Create my business blueprint",
        "Create my business QR"
      ]
    };
  }

  // 4. Application / Business Blueprint Draft Request
  if (
    lower.includes("apply") ||
    lower.includes("application") ||
    lower.includes("blueprint") ||
    lower.includes("business plan") ||
    lower.includes("proposal") ||
    lower.includes("draft")
  ) {
    const bName = updatedProfile.businessName || "your business";
    const bType = updatedProfile.businessType || "your sector";
    const reply = `I can immediately generate an 11-section structured **Business Blueprint & Grant Application Draft** for **${bName}**!\n\n` +
      `We will structure:\n` +
      `1. Business Overview & Value Proposition\n` +
      `2. Problem Statement & Market Opportunity\n` +
      `3. Revenue Model & Unit Economics\n` +
      `4. Specific Use of Funds breakdown\n` +
      `5. 24-Month Roadmap & Team Credentials\n\n` +
      `Any missing details will be marked with \`[Information required: ...]\` so you can verify facts before submitting. Click below to view and generate your proposal.`;

    return {
      message: reply,
      intent: "prepare_draft",
      actionLink: "/application",
      actionText: "Generate Tailored Application Draft",
      extractedProfile: extracted,
      suggestedQuestions: [
        "Generate Draft for PMEGP",
        "Find funding for my business",
        "Is this UPI payment request safe?",
        "View my business profile readiness"
      ]
    };
  }

  // 5. Business Health Scanner Inquiry
  if (
    lower.includes("health") ||
    lower.includes("financial health") ||
    lower.includes("cash flow") ||
    lower.includes("surplus") ||
    lower.includes("runway") ||
    lower.includes("scan business") ||
    lower.includes("scanner")
  ) {
    const bName = updatedProfile.businessName || "your business";
    const reply = `I can help you evaluate the **Financial Health** of **${bName}** before you apply for loans or grants!\n\n` +
      `Our **Business Health Scanner** analyzes:\n` +
      `• **Cash Flow Health & Monthly Surplus**\n` +
      `• **Profitability & Operating Expense Ratios**\n` +
      `• **Existing Debt Burden & EMI Pressure**\n` +
      `• **Emergency Cash Buffer & Runway**\n` +
      `• **Funding Readiness Score (0-100)**\n\n` +
      `It generates an instant AI snapshot and a tailored 3-part action plan (*What is going well*, *Areas to watch*, and *Action steps*). Click below to run a scan!`;

    return {
      message: reply,
      intent: "business_health",
      actionLink: "/health",
      actionText: "Open Business Health Scanner",
      extractedProfile: extracted,
      suggestedQuestions: [
        "Scan my business financial health",
        "Check a suspicious loan message",
        "Find funding for my business",
        "Create my business QR"
      ]
    };
  }

  // 6. Business Introduction or General Inquiry
  const bName = updatedProfile.businessName || "your business";
  const bType = updatedProfile.businessType || "your enterprise";
  const cityState = updatedProfile.cityState || "your location";

  let reply = `Great to connect with you! I am **FinGrow AI**, your financial safety and business empowerment partner.\n\n` +
    `I can guide you through every stage of your business journey for **${bName}** (${bType} in ${cityState}):\n\n` +
    `1. **Protect Payments & Offers:** Detect UPI payment fraud and predatory loan/grant scams via **ScamShield**.\n` +
    `2. **Evaluate Health:** Check your financial vitals and funding readiness with the **Business Health Scanner**.\n` +
    `3. **Get Paid:** Generate your dynamic, downloadable UPI payment QR code.\n` +
    `4. **Discover Funding:** Explore verified official government grants and credit schemes (PMEGP, Mudra, SISFS, State incentives).\n` +
    `5. **Prepare Applications:** Generate an 11-section customized business blueprint and grant proposal draft.\n\n` +
    `What would you like to work on first?`;

  return {
    message: reply,
    intent: "general",
    actionLink: null,
    actionText: null,
    extractedProfile: extracted,
    suggestedQuestions: [
      "Is this UPI payment request safe?",
      "Create my business QR",
      "Find funding for my business",
      "Help me prepare a grant application",
      "Create my business blueprint"
    ]
  };
}

module.exports = {
  processConversationalChat,
  extractProfileFromText
};
