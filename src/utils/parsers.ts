// ✅ MATCHING TYPES (These match what App.tsx expects)
export interface SalesNavSignals {
  seniorityBias: string;
  companyType: string;
  searchIntent: string;
}

export interface EODSignals {
  methodCount: number;
  primaryMethod: string;
  rawText: string;
}

export interface SheetSignals {
  approvalRate: number;
  topRejectionReason: string;
}

// --- PARSER 1: Sales Navigator (Fixed for URLs) ---
export const parseSalesNav = (text: string): SalesNavSignals => {
  // Logic: Decodes URL text so "seniority%3Asenior" becomes "seniority:senior"
  const decodedText = decodeURIComponent(text).toLowerCase();

  // keywords
  const isSenior = /senior|staff|principal|lead|founding|head/.test(decodedText);
  const isJunior = /junior|associate|entry|intern/.test(decodedText);
  
  // company filters
  const isStartup = /seed|series|founding|early/.test(decodedText);
  const isEnterprise = /enterprise|public|fortune/.test(decodedText);

  return {
    // ✅ Field name matches App.tsx
    seniorityBias: isSenior ? 'Senior' : isJunior ? 'Junior' : 'Mid-level',
    companyType: isStartup ? 'Startup' : isEnterprise ? 'Enterprise' : 'General',
    searchIntent: text.includes('currentCompany') ? 'Current Role' : 'Keyword Search'
  };
};

// --- PARSER 2: EOD Updates (Fixed for your Input) ---
export const parseEOD = (text: string): EODSignals => {
  const lowerText = text.toLowerCase();
  
  // 1. Expanded sourcing methods list based on your input
  const methods = [
    'sales nav', 'salesnav', 'linkedin', 'juicebox', 'crunchbase', 
    'github', 'google', 'x-ray', 'deep research', 'keyword search', 
    'quota metrics', 'startupy', 'donor companies'
  ];

  // 2. Count unique methods mentioned
  const foundMethods = methods.filter(m => lowerText.includes(m));
  
  // 3. Pick the "Primary" method (just the first one found)
  const primary = foundMethods.length > 0 ? foundMethods[0] : 'None';

  return {
    // ✅ Field names match App.tsx
    methodCount: foundMethods.length, 
    primaryMethod: primary.charAt(0).toUpperCase() + primary.slice(1),
    rawText: text
  };
};

// --- PARSER 3: Google Sheet (Fixed for Tabular Data) ---
export const parseSheet = (text: string): SheetSignals => {
  // STRATEGY: Find "Approval rate" followed by a number, even in messy tables
  // Matches "Approval rate 22%" (found at bottom of your input)
  // or "Approval Rate <tab> 29%" (found in middle)
  const rateMatch = text.match(/Approval\s*Rate.*?(\d{1,2})%/i);
  
  let rate = 0;
  if (rateMatch && rateMatch[1]) {
    rate = parseInt(rateMatch[1]);
  }

  // STRATEGY: Rejection reasons
  // Your input doesn't have an explicit "Reasons" list, so we scan for "bad signs"
  const rejectionKeywords = ['senior', 'experience', 'culture', 'mismatch', 'technical', 'scale', 'quality', 'grind'];
  const foundReason = rejectionKeywords.find(k => text.toLowerCase().includes(k));

  return {
    // ✅ Field names match App.tsx
    approvalRate: rate,
    topRejectionReason: foundReason ? `Issues with "${foundReason}"` : 'General Fit'
  };
};

// Dummy exports for the others
export const parseTranscript = (text: string) => text;
export const parseRetro = (text: string) => text;

export default {
  parseSalesNav,
  parseEOD,
  parseSheet
};