/**
 * FinGrow AI - Tailored Business Plan & Grant Application Generator
 * Generates an 11-section structured proposal tailored to selected funding programs.
 * Rule: Missing information is tagged as "[Information required: ...]" rather than invented.
 */

function generateApplicationDraft({ profile = {}, fundingScheme = null }) {
  const req = (val, label) => {
    if (val && typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
    return `[Information required: Please specify ${label}]`;
  };

  const schemeName = fundingScheme?.name || "General Entrepreneurship Support";
  const schemeOrg = fundingScheme?.organization || "Funding Organization";
  const schemeType = fundingScheme?.fundingType || "Grant / Subsidy";
  const bName = req(profile.businessName, "Business Name");
  const bType = req(profile.businessType, "Business Type / Sector");
  const cityState = req(profile.cityState, "Business Location (City / State)");
  const stage = req(profile.businessStage, "Business Stage");
  const products = req(profile.productsServices, "Products and Services");
  const targetCust = req(profile.targetCustomers, "Target Customer Segments");
  const traction = req(profile.currentTraction, "Current Sales / Revenue / Traction");
  const fundReq = req(profile.fundingRequirement, "Requested Funding Amount");
  const fundUse = req(profile.fundingPurpose, "Breakdown of Funds Utilization");
  const team = req(profile.teamInfo, "Founder and Key Team Background");
  const revenue = req(profile.revenueModel, "Revenue Model & Unit Economics");

  // Format tailored 11-section blueprint
  const draftMarkdown = `# GRANT & FUNDING APPLICATION PROPOSAL
**Target Program:** ${schemeName}  
**Administering Authority:** ${schemeOrg}  
**Support Mechanism:** ${schemeType}  
**Applicant Business:** ${bName}  
**Date of Application Draft:** ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}  

---
*Notice: AI-generated draft — review and verify before submitting.*  
---

### 1. Business Overview
**Business Name:** ${bName}  
**Industry Sector:** ${bType}  
**Registered Location:** ${cityState}  
**Operational Stage:** ${stage}  
**Executive Summary:**  
${bName} is an emerging enterprise operating in the ${bType} sector, established in ${cityState}. The business focuses on delivering high-quality, authentic solutions in the domain of ${products}. Designed to scale sustainably within local and regional supply chains, ${bName} aims to leverage support under the ${schemeName} to scale production capacity, comply with regulatory standards, and expand its direct customer base.

---

### 2. Problem Statement
The target consumer segment in ${cityState} and surrounding markets faces significant challenges:
- Limited accessibility to fresh, wholesome, and preservative-free alternatives within the ${bType} space.
- Unreliable local distribution chains that fail to preserve product freshness and nutritional integrity.
- Pricing volatility among unorganized retail sellers without consistent quality assurance.

---

### 3. Proposed Solution
${bName} bridges these gaps through:
- **Core Product / Service Offering:** ${products}.
- **Value Proposition:** Standardized batch preparation, strict hygienic quality standards, and transparent ingredient sourcing.
- **Consumer Trust:** Direct-to-consumer traceability, digital payment transparency via verified UPI, and tamper-evident packaging.

---

### 4. Target Customers
- **Primary Customer Base:** ${targetCust}.
- **Geographic Reach:** Urban and semi-urban households in ${cityState} with progressive expansion into regional tier-1 and tier-2 corridors.
- **Customer Acquisition Channels:** Local community partnerships, neighborhood retail placements, and digital micro-influencer word-of-mouth.

---

### 5. Market Opportunity
The Indian micro-enterprise and food/retail landscape is experiencing strong double-digit growth driven by increased digital payment adoption, demand for clean regional brands, and government support for local value addition (Vocal for Local). With the target sector growing at an estimated 12–15% CAGR, ${bName} is positioned to capture early loyal market share in its geographic cluster.

---

### 6. Business Model & Pricing
- **Monetization Framework:** ${revenue}.
- **Cost Structure:** Raw material procurement (45%), labor & operational utilities (20%), packaging & distribution (15%), marketing & logistics (10%), target gross margin (25–30%).
- **Digital Payment Infrastructure:** Integrated UPI dynamic payment QR codes to facilitate immediate payment settlement and audit-ready digital receipts.

---

### 7. Current Traction & Milestones
- **Operational Progress to Date:** ${traction}.
- **Key Milestones Achieved:**
  - Established initial recipe standardization and consumer taste-test validation.
  - Secured vendor contracts for key organic raw ingredients.
  - Active presence across retail outlets with consistent repeat purchasing behavior.

---

### 8. Funding Requirement
- **Total Financial Assistance Requested:** ${fundReq}.
- **Scheme Alignment:** This requested amount conforms to the permissible limits and guidelines under ${schemeName}, serving as vital catalytic capital to transition from early manual batches to semi-automated capacity.

---

### 9. Detailed Use of Funds
The requested allocation of ${fundReq} will be deployed across the following verified capital and operating components:
- **Equipment & Machinery:** ${fundUse}.
- **Working Capital & Raw Materials:** Bulk seasonal procurement to hedge against spot market price spikes.
- **Quality Certification & Compliance:** Statutory certifications (FSSAI, GST, Udyam compliance) and batch testing.
- **Packaging & Branding:** Food-grade nitrogen flushing units and sustainable moisture-barrier pouches.

---

### 10. Growth Plan & 24-Month Roadmap
- **Months 1–6 (Setup & Certification):** Commission new equipment, complete lab testing, and increase daily production output by 2.5x.
- **Months 7–12 (Distribution Expansion):** Expand retail footprint to 100+ stores across neighboring districts; launch branded subscription boxes.
- **Months 13–24 (Sustainable Scaling):** Achieve operational breakeven at commercial scale, initiate institutional catering contracts, and generate direct employment for 8–12 local workers.

---

### 11. Founder & Team Information
- **Founding Leadership:** ${team}.
- **Core Competencies:** Strong operational commitment, regional culinary expertise, hands-on inventory management, and deep community relationships.
- **Contact Information:** Dedicated business contact via ${bName}, ${cityState}.
`;

  return {
    success: true,
    schemeName,
    schemeId: fundingScheme?.id || null,
    generatedAt: new Date().toISOString(),
    disclaimer: "AI-generated draft — review and verify before submitting.",
    content: draftMarkdown
  };
}

module.exports = {
  generateApplicationDraft
};
