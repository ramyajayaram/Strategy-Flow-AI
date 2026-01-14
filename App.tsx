
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { AnalysisState, Step, SwotData, RoadmapInitiative } from './types';
import { conductResearch, generateSWOT, generateRoadmap } from './services/geminiService';
import { SWOTCard } from './components/SWOTCard';
import { RoadmapTimeline } from './components/RoadmapTimeline';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.INPUT);
  const [state, setState] = useState<AnalysisState>({
    companyName: '',
    researchData: '',
    swot: null,
    roadmap: null,
    isSearching: false,
    isAnalyzing: false,
    isGeneratingRoadmap: false,
    sources: [],
  });

  const [renderedResearch, setRenderedResearch] = useState<string>('');

  useEffect(() => {
    if (state.researchData) {
      setRenderedResearch(marked.parse(state.researchData) as string);
    }
  }, [state.researchData]);

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.companyName) return;

    // Phase 1: Research
    setCurrentStep(Step.RESEARCH);
    setState(prev => ({ ...prev, isSearching: true }));
    
    try {
      const research = await conductResearch(state.companyName);
      setState(prev => ({ 
        ...prev, 
        researchData: research.text, 
        sources: research.sources,
        isSearching: false 
      }));

      // Phase 2: SWOT
      setCurrentStep(Step.SWOT);
      setState(prev => ({ ...prev, isAnalyzing: true }));
      const swot = await generateSWOT(research.text);
      setState(prev => ({ ...prev, swot, isAnalyzing: false }));

      // Phase 3: Roadmap
      setCurrentStep(Step.ROADMAP);
      setState(prev => ({ ...prev, isGeneratingRoadmap: true }));
      const roadmap = await generateRoadmap(swot, state.companyName);
      setState(prev => ({ ...prev, roadmap, isGeneratingRoadmap: false }));
    } catch (error) {
      console.error("Error in analysis pipeline:", error);
      alert("Failed to complete analysis. Please check your API key and try again.");
      setCurrentStep(Step.INPUT);
      setState(prev => ({ ...prev, isSearching: false, isAnalyzing: false, isGeneratingRoadmap: false }));
    }
  };

  const reset = () => {
    setCurrentStep(Step.INPUT);
    setRenderedResearch('');
    setState({
      companyName: '',
      researchData: '',
      swot: null,
      roadmap: null,
      isSearching: false,
      isAnalyzing: false,
      isGeneratingRoadmap: false,
      sources: [],
    });
  };

  return (
    <div className="min-h-screen flex flex-col print-container">
      {/* Navbar */}
      <nav className="bg-white/80 border-b border-gray-200 sticky top-0 z-50 no-print glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                StrategyFlow<span className="text-indigo-600">.AI</span>
              </span>
            </div>
            {currentStep !== Step.INPUT && (
              <button 
                onClick={reset}
                className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-all px-4 py-2 hover:bg-indigo-50 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Session
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {currentStep === Step.INPUT && (
          <div className="max-w-3xl mx-auto text-center mt-16 animate-in fade-in zoom-in-95 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8 no-print">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[12px] font-bold text-indigo-600 uppercase tracking-widest">Powered by Gemini 3 Deep Reasoning</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Architect Your <span className="text-indigo-600">Product Success</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              Transform raw market data into high-fidelity SWOT matrices and strategic product roadmaps in seconds.
            </p>
            <form onSubmit={handleStartAnalysis} className="relative group max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Enter company name (e.g. NVIDIA, Airbnb...)"
                value={state.companyName}
                onChange={(e) => setState({ ...state, companyName: e.target.value })}
                className="w-full px-8 py-6 text-xl border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none pr-36 shadow-xl shadow-indigo-100/50 group-hover:shadow-indigo-200/50 font-medium"
                required
              />
              <button
                type="submit"
                className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                Analyze
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              {[
                { title: 'Global Intelligence', desc: 'Real-time market scanning using Google Search grounding.', icon: '🌐' },
                { title: 'Strategic Logic', desc: 'Deep-thinking analysis of competitive moats and risks.', icon: '🧠' },
                { title: 'Actionable Steps', desc: 'Proprietary roadmap generation focused on ROI.', icon: '🚀' }
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
                  <span className="text-3xl mb-4 block">{feature.icon}</span>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(currentStep !== Step.INPUT) && (
          <div className="space-y-16">
            {/* Progress indicator */}
            <div className="max-w-4xl mx-auto no-print">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/60 p-6 rounded-3xl border border-white/40 shadow-xl shadow-slate-100/50 overflow-x-auto glass-panel">
                  <ProgressStep title="Deep Intelligence" active={state.isSearching} completed={!!state.researchData} stepNumber={1} />
                  <div className="hidden md:block h-px w-12 bg-slate-100" />
                  <ProgressStep title="Strategic Analysis" active={state.isAnalyzing} completed={!!state.swot} stepNumber={2} />
                  <div className="hidden md:block h-px w-12 bg-slate-100" />
                  <ProgressStep title="Product Roadmap" active={state.isGeneratingRoadmap} completed={!!state.roadmap} stepNumber={3} />
               </div>
            </div>

            {/* Research Results */}
            {state.researchData && (
              <section className="bg-white p-10 md:p-14 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-8 duration-700 print:shadow-none print:border-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                   <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 font-display">
                     <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl no-print">🔍</span>
                     Market Dossier: {state.companyName}
                   </h2>
                </div>
                
                <div 
                  className="prose prose-lg max-w-none text-slate-600 leading-relaxed mb-10"
                  dangerouslySetInnerHTML={{ __html: renderedResearch }}
                />

                {state.sources.length > 0 && (
                  <div className="border-t border-slate-50 pt-10 no-print">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-6">Source Verification</h4>
                    <div className="flex flex-wrap gap-4">
                      {state.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[13px] font-bold px-4 py-2 bg-slate-50 text-indigo-600 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all flex items-center gap-2 group shadow-sm"
                        >
                          <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {source.title.length > 35 ? source.title.substring(0, 35) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* SWOT Matrix */}
            {state.swot && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 print:break-inside-avoid">
                <div className="flex items-center gap-6 mb-12">
                  <h2 className="text-4xl font-black text-slate-900 font-display whitespace-nowrap">Strategic Vector Matrix</h2>
                  <div className="h-px flex-grow bg-slate-200 no-print" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <SWOTCard 
                    title="Strengths" 
                    items={state.swot.strengths} 
                    color="border-emerald-100" 
                    icon={<span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl no-print">💪</span>} 
                  />
                  <SWOTCard 
                    title="Weaknesses" 
                    items={state.swot.weaknesses} 
                    color="border-rose-100" 
                    icon={<span className="p-3 bg-rose-50 text-rose-600 rounded-2xl no-print">⚠️</span>} 
                  />
                  <SWOTCard 
                    title="Opportunities" 
                    items={state.swot.opportunities} 
                    color="border-indigo-100" 
                    icon={<span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl no-print">✨</span>} 
                  />
                  <SWOTCard 
                    title="Threats" 
                    items={state.swot.threats} 
                    color="border-amber-100" 
                    icon={<span className="p-3 bg-amber-50 text-amber-600 rounded-2xl no-print">🛡️</span>} 
                  />
                </div>
              </section>
            )}

            {/* Roadmap */}
            {state.roadmap && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex items-center gap-6 mb-6 no-print">
                  <h2 className="text-4xl font-black text-slate-900 font-display whitespace-nowrap">12-Month Execution Roadmap</h2>
                  <div className="h-px flex-grow bg-slate-200" />
                </div>
                <p className="text-lg text-slate-500 max-w-3xl no-print font-medium mb-12 leading-relaxed">
                  High-priority initiatives synthesized by the strategy engine to capitalize on market opportunities and mitigate systemic risks.
                </p>
                <RoadmapTimeline initiatives={state.roadmap} companyName={state.companyName} />
              </section>
            )}

            {(state.isSearching || state.isAnalyzing || state.isGeneratingRoadmap) && (
              <div className="flex flex-col items-center py-20 space-y-8 no-print animate-in fade-in duration-300">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                <div className="text-indigo-600 font-bold text-xl flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="tracking-tight">
                      {state.isSearching && "Synthesizing deep market intelligence..."}
                      {state.isAnalyzing && "Mapping strategic SWOT vectors..."}
                      {state.isGeneratingRoadmap && "Optimizing product execution roadmap..."}
                    </span>
                  </div>
                  <span className="text-slate-400 text-sm font-medium animate-pulse delay-75">This usually takes 10-20 seconds for high-fidelity reasoning</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 text-center no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 grayscale opacity-60">
                <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span className="font-black text-slate-800 tracking-tight">StrategyFlow</span>
            </div>
            <p className="text-sm font-bold text-slate-400">
                © {new Date().getFullYear()} StrategyFlow AI Labs • High-Fidelity Strategic Engineering
            </p>
        </div>
      </footer>
    </div>
  );
};

const ProgressStep: React.FC<{ title: string; active: boolean; completed: boolean; stepNumber: number }> = ({ title, active, completed, stepNumber }) => (
  <div className="flex items-center gap-4 min-w-max">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
      completed ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-indigo-100 shadow-xl' : 'bg-slate-100 text-slate-400'
    }`}>
      {completed ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <span className="text-sm font-black">{stepNumber}</span>
      )}
    </div>
    <span className={`font-black text-sm tracking-tight ${active ? 'text-indigo-600' : completed ? 'text-emerald-600' : 'text-slate-400'}`}>
      {title}
    </span>
  </div>
);

export default App;
