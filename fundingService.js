/**
 * FinGrow AI - Funding & Grants Discovery Service
 * Architecture: Clean Adapter pattern separating verified repository from external fetchers.
 */

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "fundingSchemes.json");

/**
 * Loads authentic verified funding schemes from data store
 */
function loadSchemes() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content.replace(/^\uFEFF/, ''));
    }
  } catch (err) {
    console.error("Error reading funding schemes data:", err);
  }
  return [];
}

/**
 * Queries schemes with intelligent multi-dimensional filtering
 */
function queryFundingSchemes(filters = {}) {
  const allSchemes = loadSchemes();
  const { stage, businessType, location, founderCategory, minAmount, maxAmount, search } = filters;

  return allSchemes.filter(scheme => {
    // Stage filter
    if (stage && stage !== "all") {
      const matchStage = scheme.stages.some(s => s.toLowerCase().includes(stage.toLowerCase()));
      if (!matchStage) return false;
    }

    // Business type / industry filter
    if (businessType && businessType !== "all") {
      const matchType = scheme.businessTypes.some(t => 
        t.toLowerCase().includes(businessType.toLowerCase()) || 
        businessType.toLowerCase().includes(t.toLowerCase())
      );
      if (!matchType) return false;
    }

    // Location / State filter
    if (location && location !== "all") {
      const isAllIndia = scheme.location.toLowerCase().includes("all india");
      const matchLoc = scheme.location.toLowerCase().includes(location.toLowerCase());
      if (!isAllIndia && !matchLoc) return false;
    }

    // Founder category filter (e.g. Women, SC/ST)
    if (founderCategory && founderCategory !== "all") {
      const isAll = scheme.founderCategory.toLowerCase().includes("all");
      const matchCat = scheme.founderCategory.toLowerCase().includes(founderCategory.toLowerCase());
      if (!isAll && !matchCat) return false;
    }

    // Amount filtering
    if (minAmount && !isNaN(Number(minAmount))) {
      if (scheme.maxAmount < Number(minAmount)) return false;
    }
    if (maxAmount && !isNaN(Number(maxAmount))) {
      if (scheme.minAmount > Number(maxAmount)) return false;
    }

    // Keyword search
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      const matchSearch = 
        scheme.name.toLowerCase().includes(q) ||
        scheme.organization.toLowerCase().includes(q) ||
        scheme.eligibilitySummary.toLowerCase().includes(q) ||
        scheme.businessTypes.some(b => b.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    return true;
  });
}

/**
 * Retrieves a single funding opportunity by ID
 */
function getFundingSchemeById(id) {
  const allSchemes = loadSchemes();
  return allSchemes.find(s => s.id === id) || null;
}

module.exports = {
  queryFundingSchemes,
  getFundingSchemeById,
  loadSchemes
};
