interface InsightInputs {
  salesNav: { seniorityBias?: string };
  eod: { methodCount: number; primaryMethod?: string; rawText?: string };
  sheet: { approvalRate: number; topRejectionReason?: string };
  transcript?: string;
}

export const generateInsights = (data: InsightInputs): string[] => {
  const insights: string[] = [];

  // --- RULE 1: Approval Rate Logic ---
  // If approval is low (<30%), we flag it immediately.
  if (data.sheet.approvalRate > 0 && data.sheet.approvalRate < 30) {
    insights.push('⚠️ High Rejection Rate (<30%): Re-calibrate Seniority filters immediately.');
  }

  // --- RULE 2: Method Diversity (The "Juicebox" Rule) ---
  // We check the raw text of EOD updates to see how many times "Juicebox" was mentioned.
  // Using a regex with 'gi' (global, case-insensitive) to count occurrences.
  const juiceboxMatches = (data.eod.rawText || '').match(/juicebox/gi);
  const juiceboxCount = juiceboxMatches ? juiceboxMatches.length : 0;

  if (juiceboxCount < 2) {
    insights.push('📉 Low Method Diversity: Juicebox usage is low. Try AI sourcing to expand pool.');
  }

  // --- RULE 3: Rejection Context (Bonus) ---
  // If the top reason is "Too Senior", suggest looking for mid-level
  if (data.sheet.topRejectionReason?.toLowerCase().includes('senior')) {
    insights.push('🎯 Strategy Shift: Candidates are "Too Senior". Target distinct "Staff" vs "Senior" keywords.');
  }

  // --- RULE 4: Drift Detection (Bonus) ---
  // If SalesNav says Senior, but transcript says "Junior" or "Mid-level"
  if (data.salesNav.seniorityBias === 'Senior' && data.transcript?.toLowerCase().includes('junior')) {
    insights.push('⚡ Alignment Alert: Sourcing "Senior" profiles, but hiring manager mentioned "Junior".');
  }

  // Fallback if no specific insights generated
  if (insights.length === 0) {
    insights.push('✅ Pipeline looks healthy. Continue with current sourcing mix.');
  }

  return insights;
};