/**
 * Parsing utilities for various text formats
 */

// SalesNav parser types
export interface SalesNavResult {
  keywords: string[];
  seniority: 'Senior' | 'Staff' | 'Unknown';
}

// EOD parser types
export interface EODResult {
  juiceboxCount: number;
  salesnavCount: number;
  repoCount: number;
}

// Sheet parser types
export interface SheetResult {
  approved: number;
  rejected: number;
}

/**
 * Parses SalesNav-style text to extract keywords and guess seniority
 * @param text Input text to parse
 * @returns Object containing keywords array and seniority guess
 */
export function parseSalesNav(text: string): SalesNavResult {
  const result: SalesNavResult = {
    keywords: [],
    seniority: 'Unknown'
  };

  // Extract keywords (simple word-based extraction)
  const words = text.toLowerCase().split(/\s+/);
  const commonKeywords = [
    'engineer', 'developer', 'manager', 'director', 'lead',
    'designer', 'analyst', 'architect', 'specialist', 'consultant'
  ];

  const foundKeywords = new Set<string>();
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord.length > 2 && commonKeywords.includes(cleanWord)) {
      foundKeywords.add(cleanWord);
    }
  });

  result.keywords = Array.from(foundKeywords);

  // Guess seniority based on text clues
  const seniorityIndicators = {
    Senior: /\bsenior\b|\bsr\.?\b|\bprincipal\b|\blead\b|\bexperienced\b/i,
    Staff: /\bstaff\b|\bstrategic\b|\bexpert\b|\badvanced\b/i
  };

  if (seniorityIndicators.Senior.test(text)) {
    result.seniority = 'Senior';
  } else if (seniorityIndicators.Staff.test(text)) {
    result.seniority = 'Staff';
  }

  return result;
}

/**
 * Parses EOD (End of Day) reports to count occurrences of specific terms
 * @param text Input text to analyze
 * @returns Object containing counts for each tracked term
 */
export function parseEOD(text: string): EODResult {
  const result: EODResult = {
    juiceboxCount: 0,
    salesnavCount: 0,
    repoCount: 0
  };

  // Case-insensitive counting
  const lowerText = text.toLowerCase();
  
  // Simple regex matching for whole words
  result.juiceboxCount = (lowerText.match(/\bjuicebox\b/g) || []).length;
  result.salesnavCount = (lowerText.match(/\bsalesnav\b/g) || []).length;
  result.repoCount = (lowerText.match(/\brepo\b/g) || []).length;

  return result;
}

/**
 * Parses sheet/text containing approval/rejection counts
 * @param text Input text containing approval/rejection data
 * @returns Object with approved and rejected counts (0 if not found)
 */
export function parseSheet(text: string): SheetResult {
  const result: SheetResult = {
    approved: 0,
    rejected: 0
  };

  // Extract approved count
  const approvedMatch = text.match(/Approved:\s*(\d+)/i);
  if (approvedMatch) {
    result.approved = parseInt(approvedMatch[1], 10);
  }

  // Extract rejected count
  const rejectedMatch = text.match(/Rejected:\s*(\d+)/i);
  if (rejectedMatch) {
    result.rejected = parseInt(rejectedMatch[1], 10);
  }

  return result;
}

// Optional: Combined parser if needed
export default {
  parseSalesNav,
  parseEOD,
  parseSheet
};