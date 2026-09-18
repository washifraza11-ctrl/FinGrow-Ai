/**
 * FinGrow AI - Business Health Scanner Service
 * Evaluates operational numbers for micro-entrepreneurs to assess readiness
 * before seeking loans or applying for grants.
 */

function scanBusinessHealth(inputData = {}) {
  const revenue = Math.max(0, Number(inputData.monthlyRevenue) || 0);
  const expenses = Math.max(0, Number(inputData.monthlyExpenses) || 0);
  const emi = Math.max(0, Number(inputData.existingEmi) || 0);
  const cash = Math.max(0, Number(inputData.cashAvailable) || 0);
  const employees = Math.max(1, Number(inputData.employees) || 1);
  const stage = inputData.businessStage || 'Early Stage';
  const fundingReq = Math.max(0, Number(inputData.fundingRequirement) || 0);
  const growth = Number(inputData.salesGrowth) || 0;

  const totalMonthlyOutflow = expenses + emi;
  const monthlySurplus = revenue - totalMonthlyOutflow;
  const expenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 100;
  const debtBurden = revenue > 0 ? (emi / revenue) * 100 : 0;
  const bufferMonths = totalMonthlyOutflow > 0 ? cash / totalMonthlyOutflow : (cash > 0 ? 6 : 0);

  // 1. Cash Flow Health (0 - 20)
  let cashFlowScore = 5;
  if (monthlySurplus > 0) {
    const netMargin = (monthlySurplus / revenue) * 100;
    if (netMargin >= 25) cashFlowScore = 20;
    else if (netMargin >= 15) cashFlowScore = 17;
    else if (netMargin >= 8) cashFlowScore = 13;
    else cashFlowScore = 10;
  } else if (monthlySurplus === 0) {
    cashFlowScore = 8;
  } else {
    cashFlowScore = 4; // Operating at a deficit
  }

  // 2. Profitability & Operating Efficiency (0 - 20)
  let profitabilityScore = 5;
  if (expenseRatio <= 60) profitabilityScore = 20;
  else if (expenseRatio <= 75) profitabilityScore = 16;
  else if (expenseRatio <= 88) profitabilityScore = 11;
  else if (expenseRatio < 100) profitabilityScore = 7;
  else profitabilityScore = 3;

  // 3. Debt Pressure (0 - 20)
  let debtScore = 20;
  if (debtBurden === 0) debtScore = 20;
  else if (debtBurden <= 10) debtScore = 18;
  else if (debtBurden <= 20) debtScore = 14;
  else if (debtBurden <= 35) debtScore = 9;
  else debtScore = 4;

  // 4. Emergency Cash Buffer (0 - 20)
  let bufferScore = 4;
  if (bufferMonths >= 3) bufferScore = 20;
  else if (bufferMonths >= 1.5) bufferScore = 15;
  else if (bufferMonths >= 0.8) bufferScore = 10;
  else if (bufferMonths >= 0.4) bufferScore = 6;
  else bufferScore = 3;

  // 5. Funding Readiness (0 - 20)
  let fundingScore = 10;
  const annualSurplus = Math.max(1, monthlySurplus * 12);
  const leverageRatio = fundingReq > 0 ? fundingReq / annualSurplus : 1;
  
  if (monthlySurplus > 0 && leverageRatio <= 2.5) fundingScore = 20;
  else if (monthlySurplus > 0 && leverageRatio <= 4.0) fundingScore = 16;
  else if (monthlySurplus > 0) fundingScore = 12;
  else fundingScore = 6;

  if (growth > 5) fundingScore = Math.min(20, fundingScore + 2);

  const totalScore = Math.min(100, Math.max(10, cashFlowScore + profitabilityScore + debtScore + bufferScore + fundingScore));

  // Determine qualitative funding readiness rating
  let fundingReadinessRating = 'Moderate Preparation Required';
  if (totalScore >= 75) fundingReadinessRating = 'High / Strong Candidate';
  else if (totalScore >= 55) fundingReadinessRating = 'Moderate / Grant-Eligible';
  else fundingReadinessRating = 'Needs Financial Strengthening';

  // Generate 3 Actionable Sections
  const goingWell = [];
  const areasToWatch = [];
  const actionPlan = [];

  // What is going well
  if (monthlySurplus > 0) {
    goingWell.push(`Your business generates an estimated monthly surplus of ₹${Math.round(monthlySurplus).toLocaleString('en-IN')}, demonstrating positive operational cash flow.`);
  }
  if (debtBurden <= 15) {
    goingWell.push(`Your current debt obligations (${debtBurden.toFixed(1)}% of revenue) are well within manageable industry thresholds.`);
  } else {
    goingWell.push(`You have an active credit track record, which helps build business score history if paid consistently.`);
  }
  if (growth > 0) {
    goingWell.push(`Reported sales growth trend (${growth}%) signals expanding customer demand.`);
  }
  if (goingWell.length === 0) {
    goingWell.push(`Business operations are active and baseline financial metrics are now established for tracking.`);
  }

  // Areas to watch
  if (bufferMonths < 2) {
    areasToWatch.push(`Your liquid cash reserve covers only ${bufferMonths.toFixed(1)} months of operational costs. Lenders prefer at least 2 to 3 months of emergency runway.`);
  }
  if (expenseRatio > 70) {
    areasToWatch.push(`Operating expenses consume ${expenseRatio.toFixed(1)}% of monthly revenue. Minor dips in demand could quickly compress your margins.`);
  }
  if (debtBurden > 25) {
    areasToWatch.push(`Existing debt payments are consuming ${debtBurden.toFixed(1)}% of monthly turnover, which may limit capacity for high-interest commercial bank loans.`);
  }
  if (fundingReq > (revenue * 6)) {
    areasToWatch.push(`Your requested funding (₹${fundingReq.toLocaleString('en-IN')}) is over 6x monthly revenue; grant evaluators will scrutinize repayment feasibility.`);
  }
  if (areasToWatch.length === 0) {
    areasToWatch.push(`No critical red flags detected; maintain strict day-to-day cash ledger discipline.`);
  }

  // Action plan
  actionPlan.push(`Maintain a dedicated business UPI QR and separate commercial bank account so all revenue is verifiable via bank statements.`);
  if (bufferMonths < 2) {
    actionPlan.push(`Prioritize building a 2-month reserve fund (target: ₹${Math.round(totalMonthlyOutflow * 2).toLocaleString('en-IN')}) before committing to aggressive loan repayments.`);
  }
  actionPlan.push(`Prepare statutory compliance documents (Udyam Registration, GST if applicable, and FSSAI/Shop Act) to maximize grant scoring.`);
  if (totalScore >= 60) {
    actionPlan.push(`Your financial profile aligns well with subsidized capital like PMEGP (up to 35% margin subsidy) or Mudra Kishore loans.`);
  } else {
    actionPlan.push(`Consider non-debt catalytic seed grants (such as SISFS or state innovation grants) that do not increase monthly debt pressure.`);
  }

  return {
    score: totalScore,
    status: totalScore >= 75 ? 'Healthy & Investment Ready' : (totalScore >= 55 ? 'Stable with Growth Potential' : 'Needs Optimization'),
    categories: {
      cashFlow: { score: cashFlowScore, max: 20, label: 'Cash Flow Health' },
      profitability: { score: profitabilityScore, max: 20, label: 'Profitability' },
      debtPressure: { score: debtScore, max: 20, label: 'Debt Pressure' },
      cashBuffer: { score: bufferScore, max: 20, label: 'Emergency Cash Buffer' },
      fundingReadiness: { score: fundingScore, max: 20, label: 'Funding Readiness' }
    },
    snapshot: {
      monthlyRevenue: revenue,
      monthlyExpenses: expenses,
      monthlyEmi: emi,
      totalOutflow: totalMonthlyOutflow,
      monthlySurplus: Math.round(monthlySurplus),
      expenseRatio: Number(expenseRatio.toFixed(1)),
      debtBurden: Number(debtBurden.toFixed(1)),
      cashBufferMonths: Number(bufferMonths.toFixed(1)),
      fundingReadinessRating,
      fundingRequirement: fundingReq
    },
    insights: {
      goingWell,
      areasToWatch,
      actionPlan
    },
    disclaimer: "This assessment is an estimate based on the information you provide and is not professional financial advice or a guarantee of funding eligibility.",
    isEstimate: true,
    scannedAt: new Date().toISOString()
  };
}

module.exports = {
  scanBusinessHealth
};