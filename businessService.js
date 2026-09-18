/**
 * FinGrow AI - Business Profile Management & Readiness Scoring
 * Provides persistent local JSON storage with optional MongoDB hook.
 */

const fs = require("fs");
const path = require("path");

const STORAGE_FILE = path.join(__dirname, "..", "data", "storage.json");

// Default starter profile (Demo Mode profile: GreenBite Snacks)
const DEFAULT_PROFILE = {
  id: "demo-user-1",
  name: "Arun Varma",
  businessName: "GreenBite Snacks",
  businessType: "Food / Homemade Snacks",
  cityState: "Vijayawada, Andhra Pradesh",
  businessStage: "Early Stage",
  productsServices: "Millet-based healthy savory snacks, roasted spiced nuts, and preservative-free regional sweets.",
  targetCustomers: "Health-conscious urban households, local retail stores, and online marketplace shoppers.",
  revenueModel: "Direct-to-consumer online sales, local retail shelf placement, and custom corporate gift boxes.",
  currentTraction: "Generating ₹85,000 monthly revenue across 25 local grocery outlets and 300+ monthly direct orders.",
  fundingRequirement: "₹5,00,000",
  fundingPurpose: "Procurement of an industrial rotary dehydrator, nitrogen flushing packaging machine, and FSSAI premium lab certification.",
  upiId: "greenbitesnacks@upi",
  teamInfo: "Arun Varma (Founder, Operations & Recipes, 4 yrs culinary experience), Lakshmi Varma (Supply Chain & Packaging).",
  updatedAt: new Date().toISOString()
};

function readStorage() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, "utf-8");
      return JSON.parse(data.replace(/^\uFEFF/, ''));
    }
  } catch (err) {
    console.error("Error reading storage file, initializing default:", err);
  }

  const initial = { profile: DEFAULT_PROFILE, chats: [] };
  writeStorage(initial);
  return initial;
}

function writeStorage(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving storage:", err);
  }
}

function calculateReadiness(profile = {}) {
  const fields = [
    { key: "businessName", weight: 15 },
    { key: "businessType", weight: 10 },
    { key: "cityState", weight: 10 },
    { key: "businessStage", weight: 10 },
    { key: "productsServices", weight: 15 },
    { key: "targetCustomers", weight: 10 },
    { key: "revenueModel", weight: 10 },
    { key: "fundingRequirement", weight: 10 },
    { key: "fundingPurpose", weight: 10 }
  ];

  let score = 0;
  fields.forEach(f => {
    if (profile[f.key] && typeof profile[f.key] === "string" && profile[f.key].trim().length > 1) {
      score += f.weight;
    }
  });

  return Math.min(100, score);
}

function getBusinessProfile() {
  const data = readStorage();
  const profile = data.profile || DEFAULT_PROFILE;
  return {
    ...profile,
    readinessScore: calculateReadiness(profile)
  };
}

function saveBusinessProfile(updates) {
  const data = readStorage();
  const current = data.profile || DEFAULT_PROFILE;
  const updated = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  data.profile = updated;
  writeStorage(data);
  return {
    ...updated,
    readinessScore: calculateReadiness(updated)
  };
}

function resetToDemoProfile() {
  const data = readStorage();
  data.profile = { ...DEFAULT_PROFILE, updatedAt: new Date().toISOString() };
  writeStorage(data);
  return {
    ...data.profile,
    readinessScore: calculateReadiness(data.profile)
  };
}

module.exports = {
  getBusinessProfile,
  saveBusinessProfile,
  resetToDemoProfile,
  calculateReadiness,
  DEFAULT_PROFILE
};
