
import React, { useState } from 'react';
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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                StrategyFlow AI
              </span>
            </div>
            {currentStep !== Step.INPUT && (
              <button 
                onClick={reset}
                className="text-sm font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Analysis
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {currentStep === Step.INPUT && (
          <div className="max-w-2xl mx-auto text-center mt-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Transform Insight into Strategy
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Enter a company name to perform an agentic SWOT analysis and generate a comprehensive product roadmap using real-time market data.
            </p>
            <form onSubmit={handleStartAnalysis} className="relative group">
              <input
                type="text"
                placeholder="e.g. OpenAI, Tesla, Stripe..."
                value={state.companyName}
                onChange={(e) => setState({ ...state, companyName: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none pr-32 shadow-sm group-hover:shadow-md"
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg active:scale-95"
              >
                Analyze
              </button>
            </form>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                { title: 'Research', desc: 'Real-time market scanning and news retrieval.', icon: '🔍' },
                { title: 'SWOT', desc: 'Automated identification of core business vectors.', icon: '📊' },
                { title: 'Roadmap', desc: 'Strategic product initiatives for the next 12 months.', icon: '🗺️' }
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-2xl mb-2 block">{feature.icon}</span>
                  <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-500 leading-normal">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(currentStep !== Step.INPUT) && (
          <div className="space-y-12">
            {/* Progress indicator */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-print">
               <div className="flex items-center gap-4 w-full justify-around">
                  <ProgressStep title="Research" active={state.isSearching} completed={!!state.researchData} />
                  <div className="h-[2px] w-8 bg-gray-100" />
                  <ProgressStep title="SWOT Analysis" active={state.isAnalyzing} completed={!!state.swot} />
                  <div className="h-[2px] w-8 bg-gray-100" />
                  <ProgressStep title="Roadmap" active={state.isGeneratingRoadmap} completed={!!state.roadmap} />
               </div>
            </div>

            {/* Research Results */}
            {state.researchData && (
              <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 print:shadow-none print:border-none">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                     <span className="p-2 bg-blue-50 text-blue-600 rounded-lg no-print">🔍</span>
                     Market Research: {state.companyName}
                   </h2>
                </div>
                <div className="prose max-w-none text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                  {state.researchData}
                </div>
                {state.sources.length > 0 && (
                  <div className="border-t border-gray-50 pt-6 no-print">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Verified Sources</h4>
                    <div className="flex flex-wrap gap-3">
                      {state.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 bg-gray-50 text-indigo-600 rounded-full border border-gray-100 hover:border-indigo-300 transition-all flex items-center gap-1.5"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* SWOT Matrix */}
            {state.swot && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 print:break-inside-avoid">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">SWOT Analysis Matrix</h2>
                  <div className="h-px flex-grow bg-gray-200 no-print" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SWOTCard 
                    title="Strengths" 
                    items={state.swot.strengths} 
                    color="border-emerald-100" 
                    icon={<span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg no-print">💪</span>} 
                  />
                  <SWOTCard 
                    title="Weaknesses" 
                    items={state.swot.weaknesses} 
                    color="border-rose-100" 
                    icon={<span className="p-2 bg-rose-50 text-rose-600 rounded-lg no-print">⚠️</span>} 
                  />
                  <SWOTCard 
                    title="Opportunities" 
                    items={state.swot.opportunities} 
                    color="border-indigo-100" 
                    icon={<span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg no-print">✨</span>} 
                  />
                  <SWOTCard 
                    title="Threats" 
                    items={state.swot.threats} 
                    color="border-amber-100" 
                    icon={<span className="p-2 bg-amber-50 text-amber-600 rounded-lg no-print">🛡️</span>} 
                  />
                </div>
              </section>
            )}

            {/* Roadmap */}
            {state.roadmap && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center gap-3 mb-4 no-print">
                  <h2 className="text-3xl font-bold text-gray-900">12-Month Product Roadmap</h2>
                  <div className="h-px flex-grow bg-gray-200" />
                </div>
                <p className="text-gray-500 max-w-2xl no-print">
                  Strategic initiatives derived from the competitive analysis and market research conducted by the agent.
                </p>
                <RoadmapTimeline initiatives={state.roadmap} companyName={state.companyName} />
              </section>
            )}

            {(state.isSearching || state.isAnalyzing || state.isGeneratingRoadmap) && (
              <div className="flex flex-col items-center py-12 space-y-4 no-print">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-indigo-600 font-medium animate-pulse">
                  {state.isSearching && "Agent is scanning global markets..."}
                  {state.isAnalyzing && "Synthesizing SWOT matrix..."}
                  {state.isGeneratingRoadmap && "Optimizing product strategy roadmap..."}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400 no-print">
        <p>© {new Date().getFullYear()} StrategyFlow AI • Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

const ProgressStep: React.FC<{ title: string; active: boolean; completed: boolean }> = ({ title, active, completed }) => (
  <div className="flex items-center gap-3 min-w-max">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
      completed ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'
    }`}>
      {completed ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : active ? (
        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
      ) : (
        <div className="w-2 h-2 bg-gray-300 rounded-full" />
      )}
    </div>
    <span className={`font-semibold text-sm ${active ? 'text-indigo-600' : completed ? 'text-emerald-600' : 'text-gray-400'}`}>
      {title}
    </span>
  </div>
);

export default App;
