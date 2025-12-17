import { useState } from 'react';
import { generateInsights } from './utils/insightEngine';
import './App.css';
import { 
  ChevronDown, 
  ChevronUp, 
  Link2, 
  FileText, 
  MessageSquare, 
  RotateCcw, 
  Table,
  TrendingUp,
  Target,
  Layers,
  AlertCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Play,
  Zap // ✅ Added Zap icon
} from 'lucide-react';

// ✅ IMPORT DATA & TYPES
import { sampleData, type DashboardData } from './data/sampleData';

// ✅ IMPORT PARSERS (Ensure src/utils/parsers.ts exists)
import { parseSalesNav, parseEOD, parseSheet } from './utils/parsers';

const App = () => {
  const [expandedSections, setExpandedSections] = useState({
    salesnav: true,
    eod: false,
    transcript: false,
    retro: false,
    sheet: false
  });

  // State for the Dashboard data (starts with demo data)
  const [data, setData] = useState<DashboardData>(sampleData);

  // Inputs state (connected to the TextAreas)
  const [inputs, setInputs] = useState({
    salesnav: '',
    eod: '',
    transcript: '',
    retro: '',
    sheet: ''
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (section: keyof typeof inputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const clearAll = () => {
    setInputs({
      salesnav: '',
      eod: '',
      transcript: '',
      retro: '',
      sheet: ''
    });
    setData(null as unknown as DashboardData); // clear view (you can set to sampleData if preferred)
  };

  // ✅ THE LOGIC ENGINE
  function handleAnalyze() {
    let salesNavSignals: any = null;
    let eodSignals: any = null;
    let sheetSignals: any = null;

    try {
      salesNavSignals = parseSalesNav(inputs.salesnav);
      eodSignals = parseEOD(inputs.eod);
      sheetSignals = parseSheet(inputs.sheet);
    } catch (e: any) {
    } try { } catch (e: any) {
      console.error('Parsing error:', e);
      // Non-fatal UI message so bad input doesn't crash the app
      // 'sonner' is not installed in this environment; fall back to a native alert
      window.alert(`Parsing failed: ${e?.message ?? 'invalid input'}`);
      salesNavSignals = { seniority: 'Unknown' };
      eodSignals = { methodCount: 0, primaryMethod: 'None' };
      sheetSignals = { approvalRate: 0, topRejectionReason: 'None' };
    }
    const dynamicInsights = generateInsights({
      salesNav: salesNavSignals,
      eod: { ...eodSignals, rawText: inputs.eod }, // Pass raw text for the Juicebox check
      sheet: sheetSignals,
      transcript: inputs.transcript
    });

    const approvalRate = (sheetSignals as any)?.approvalRate ?? 0;
    const approvalStatus = approvalRate < 40 ? 'critical' : 'healthy';
    const approvalHeadline = approvalRate < 40 ? 'Approval Rate Alert' : 'Healthy Pipeline';
    const mainBlocker = (sheetSignals as any)?.topRejectionReason ?? 'Waiting for data...';

    const realData: DashboardData = {
      inputs: {
        salesNavLinks: inputs.salesnav,
        eodUpdates: inputs.eod,
        transcriptSnippets: inputs.transcript,
        retroNotes: inputs.retro,
        sheetSummary: inputs.sheet
      },
      analysis: {
        approval: {
          rate: approvalRate,
          status: approvalStatus,
          headline: approvalHeadline,
          mainBlocker: mainBlocker
        },
        drift: {
          detected: (salesNavSignals?.seniority === 'Senior' && inputs.transcript.toLowerCase().includes('junior')),
          severity: 'medium',
          direction: 'Seniority Mismatch',
          evidence: 'Sales Nav targets Senior, but constraints mention Junior.'
        },
        coverage: {
          score: eodSignals && 'methodCount' in eodSignals ? Math.min(eodSignals.methodCount * 25, 100) : 0,
          missingMethods: ['GitHub', 'Dribbble'],
          overusedMethod: eodSignals && 'primaryMethod' in eodSignals ? eodSignals.primaryMethod : 'None'
        },
        recommendations: dynamicInsights
      }
    };

    setData(realData);

    // Expand all sections so user can see results
    setExpandedSections(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => (next[k as keyof typeof prev] = true));
      return next;
    });
  }

  const loadDemo = () => {
    setInputs({
      salesnav: sampleData.inputs.salesNavLinks,
      eod: sampleData.inputs.eodUpdates,
      transcript: sampleData.inputs.transcriptSnippets,
      retro: sampleData.inputs.retroNotes,
      sheet: sampleData.inputs.sheetSummary
    });
    setData(sampleData);

    setExpandedSections(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => (next[k as keyof typeof prev] = true));
      return next;
    });
  };

  // Local derived values for dashboard styling
  const approvalRate = data?.analysis.approval.rate ?? 0;
  const approvalVariant = approvalRate < 40 ? 'low' : approvalRate > 70 ? 'high' : 'mid';
  const coverageScore = data?.analysis.coverage.score ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Sprints Intelligence Platform
                </h1>
                <p className="text-xs text-slate-400">Enterprise Sourcing Analytics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadDemo}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4" />
                Demo
              </button>

              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <Zap className="w-4 h-4 fill-white" />
                Analyze Inputs
              </button>

              <button
                onClick={clearAll}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Approval Insights Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  approvalVariant === 'low' ? 'bg-red-500/20' : approvalVariant === 'high' ? 'bg-green-500/20' : 'bg-amber-500/20'
                }`}
              >
                <TrendingUp
                  className={`w-5 h-5 ${
                    approvalVariant === 'low' ? 'text-red-400' : approvalVariant === 'high' ? 'text-green-400' : 'text-amber-400'
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Approval Insights</h3>
                <p className="text-xs text-slate-400">{data ? data.analysis.approval.headline : 'Waiting for data...'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Approval Rate</span>
                <span
                  className={`text-2xl font-bold ${
                    approvalVariant === 'low' ? 'text-red-400' : approvalVariant === 'high' ? 'text-green-400' : 'text-amber-400'
                  }`}
                >
                  {data ? `${data.analysis.approval.rate}%` : '--'}
                </span>
              </div>
              {data && (
                <>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        approvalVariant === 'low' ? 'bg-red-500' : approvalVariant === 'high' ? 'bg-green-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${data.analysis.approval.rate}%` }}
                    />
                  </div>
                  <div className="pt-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-300">Blocker: {data.analysis.approval.mainBlocker}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Archetype Drift Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Archetype Drift</h3>
                <p className="text-xs text-slate-400">Target Alignment</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Drift Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    data?.analysis.drift.detected ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                  } flex items-center gap-2`}
                >
                  {data ? (
                    data.analysis.drift.detected ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                        Drift Detected
                      </>
                    ) : (
                      'Aligned'
                    )
                  ) : (
                    '--'
                  )}
                </span>
              </div>
              {data && data.analysis.drift.detected && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-300">{data.analysis.drift.direction}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-300 italic">"{data.analysis.drift.evidence}"</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coverage Gaps Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Coverage Gaps</h3>
                <p className="text-xs text-slate-400">Sourcing Diversity</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Method Score</span>
                <span className="text-2xl font-bold text-blue-400">{data ? data.analysis.coverage.score : '--'}</span>
              </div>

              {/* Sourcing Coverage progress bar */}
              {data && (
                <>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${
                        coverageScore > 60 ? 'bg-blue-500' : coverageScore > 30 ? 'bg-amber-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${coverageScore}%` }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={coverageScore}
                    />
                  </div>
                  <div className="pt-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-300">Missing: {data.analysis.coverage.missingMethods.join(', ')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations Panel */}
        {data && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Actionable Recommendations</h3>
                  <p className="text-xs text-slate-400">Prioritized next steps</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Copy className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              {data.analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-cyan-400">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Sections */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Data Input Modules</h2>

          {/* Sales Navigator */}
          <CollapsibleSection
            title="Sales Navigator Link Parser"
            icon={<Link2 className="w-5 h-5" />}
            expanded={expandedSections.salesnav}
            onToggle={() => toggleSection('salesnav')}
          >
            <textarea
              value={inputs.salesnav}
              onChange={(e) => handleInputChange('salesnav', e.target.value)}
              placeholder="Paste Sales Nav Link here..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">{inputs.salesnav.length} characters</span>
              <span className="text-xs text-slate-400">Extracts: seniority, company stage, search intent</span>
            </div>
          </CollapsibleSection>

          {/* EOD Update */}
          <CollapsibleSection
            title="End-of-Day (EOD) Update Parser"
            icon={<FileText className="w-5 h-5" />}
            expanded={expandedSections.eod}
            onToggle={() => toggleSection('eod')}
          >
            <textarea
              value={inputs.eod}
              onChange={(e) => handleInputChange('eod', e.target.value)}
              placeholder="Paste EOD updates..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">{inputs.eod.length} characters</span>
              <span className="text-xs text-slate-400">Extracts: sourcing methods, volume</span>
            </div>
          </CollapsibleSection>

          {/* Transcript */}
          <CollapsibleSection
            title="Meeting Transcript Analyzer"
            icon={<MessageSquare className="w-5 h-5" />}
            expanded={expandedSections.transcript}
            onToggle={() => toggleSection('transcript')}
          >
            <textarea
              value={inputs.transcript}
              onChange={(e) => handleInputChange('transcript', e.target.value)}
              placeholder="Paste meeting transcript snippets..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">{inputs.transcript.length} characters</span>
              <span className="text-xs text-slate-400">Extracts: decision changes, constraints</span>
            </div>
          </CollapsibleSection>

          {/* Retro */}
          <CollapsibleSection
            title="Retrospective (Retro) Analyzer"
            icon={<RotateCcw className="w-5 h-5" />}
            expanded={expandedSections.retro}
            onToggle={() => toggleSection('retro')}
          >
            <textarea
              value={inputs.retro}
              onChange={(e) => handleInputChange('retro', e.target.value)}
              placeholder="Paste retrospective bullets..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">{inputs.retro.length} characters</span>
              <span className="text-xs text-slate-400">Extracts: successes, failures</span>
            </div>
          </CollapsibleSection>

          {/* Sheet Summary */}
          <CollapsibleSection
            title="Google Sheet Summary Input"
            icon={<Table className="w-5 h-5" />}
            expanded={expandedSections.sheet}
            onToggle={() => toggleSection('sheet')}
          >
            <textarea
              value={inputs.sheet}
              onChange={(e) => handleInputChange('sheet', e.target.value)}
              placeholder="Paste numbers or rows from Google Sheets..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">{inputs.sheet.length} characters</span>
              <span className="text-xs text-slate-400">Extracts: approval rate, rejection patterns</span>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

const CollapsibleSection = ({ title, icon, expanded, onToggle, children }: { title: string; icon: React.ReactNode; expanded: boolean; onToggle: () => void; children: React.ReactNode }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
            {icon}
          </div>
          <span className="font-semibold text-slate-100">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="p-4 pt-0 border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default App;