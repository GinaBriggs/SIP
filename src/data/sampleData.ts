// Define the shape of our data for Type Safety
export interface DashboardData {
  inputs: {
    salesNavLinks: string;
    eodUpdates: string;
    transcriptSnippets: string;
    retroNotes: string;
    sheetSummary: string;
  };
  analysis: {
    approval: {
      rate: number;
      status: 'healthy' | 'warning' | 'critical';
      headline: string;
      mainBlocker: string;
    };
    drift: {
      detected: boolean;
      severity: 'low' | 'medium' | 'high';
      direction: string;
      evidence: string;
    };
    coverage: {
      score: number; // 0-100
      missingMethods: string[];
      overusedMethod: string;
    };
    recommendations: string[];
  };
}

// The "Golden Record" for your Demo Mode
export const sampleData: DashboardData = {
  inputs: {
    salesNavLinks: `https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled%3Atrue%2Ckeywords%3Asenior%20software%20engineer%20AND%20react)&sessionId=5938485
https://www.linkedin.com/sales/search/people?query=(keywords%3Astaff%20engineer%20AND%20typescript)`,
    
    eodUpdates: `Oct 14: Focused heavily on Sales Nav today. Sent 40 inmails. Response rate is low.
Oct 15: Tried some Juicebox searches for "Product-minded engineers", better quality but low volume.
Oct 16: Went back to Sales Nav, targeting Series B companies only.`,
    
    transcriptSnippets: `HM (Sarah): "Honestly, the candidates from the last batch were too junior. Even the 'seniors' felt like mid-level."
HM (Sarah): "We really need someone who has seen scale. Maybe look at ex-Uber or Airbnb folks? We can pay top of band."`,
    
    retroNotes: `- What worked: Juicebox signals for "open source contributor".
- What failed: General keyword search on LinkedIn. Too much noise.
- Blocker: Candidates failing the System Design round consistently.`,
    
    sheetSummary: `Submitted: 45
Approved: 6
Rejected: 39
Rejection Reasons:
- Failed System Design (20)
- Not enough scale experience (10)
- Cultural mismatch (5)`
  },

  analysis: {
    approval: {
      rate: 13.3,
      status: 'critical',
      headline: 'Critical Bottleneck in Technical Screening',
      mainBlocker: 'System Design / Scale Experience'
    },
    drift: {
      detected: true,
      severity: 'high',
      direction: 'Seniority & Pedigree Up-leveling',
      evidence: 'Hiring Manager explicitly requested "ex-Uber/Airbnb" and noted current candidates are "too junior".'
    },
    coverage: {
      score: 40,
      missingMethods: ['Donor Company Sourcing', 'GitHub Scraping', 'Ex-Colleague Mapping'],
      overusedMethod: 'Generic Sales Navigator Search'
    },
    recommendations: [
      '🛑 PAUSE: Stop general keyword sourcing on LinkedIn immediately.',
      '🎯 PIVOT: Target "Donor Companies" (Uber, Airbnb, Stripe) as requested in transcript.',
      '📉 FILTER: Increase YOE floor to 7+ years to filter out "fake seniors".',
      '🔍 TRY: Run a GitHub scrape for "High Scale Distributed Systems" contributors.'
    ]
  }
};