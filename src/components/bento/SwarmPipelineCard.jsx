import React, { useState, useRef } from 'react';
import { Workflow, Play, Code, X, Bot, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SwarmPipelineCard({ pipelines }) {
  const [selectedPipeline, setSelectedPipeline] = useState(pipelines[0]);
  const [activePipelineStep, setActivePipelineStep] = useState(-1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNodePayload, setSelectedNodePayload] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const simTimeoutRef = useRef(null);

  const handleCopyPayload = (obj) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActivePipelineStep(0);

    const stepDelay = 900;
    let step = 0;

    const executeNext = () => {
      if (step < selectedPipeline.nodes.length - 1) {
        step++;
        setActivePipelineStep(step);
        simTimeoutRef.current = setTimeout(executeNext, stepDelay);
      } else {
        simTimeoutRef.current = setTimeout(() => {
          setIsSimulating(false);
        }, stepDelay);
      }
    };

    simTimeoutRef.current = setTimeout(executeNext, stepDelay);
  };

  return (
    <div className="bento-card glass-card relative lg:col-span-7 min-h-[460px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden group border border-white/10 hover:border-white/20 transition-all duration-300">
      <div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-mono tracking-wider text-neutral-300 font-medium">
              Automated Workflows
            </span>
          </div>

          <button
            type="button"
            onClick={runSimulation}
            disabled={isSimulating}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isSimulating
                ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                : 'bg-white hover:bg-neutral-200 text-black active:scale-95'
            }`}
          >
            <Play className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Run Test'}</span>
          </button>
        </div>

        {/* Pipeline Selector */}
        <div className="relative z-10 flex flex-wrap items-center gap-1.5 mb-3">
          {pipelines.map((pipe) => {
            const isSelected = selectedPipeline.id === pipe.id;
            return (
              <button
                key={pipe.id}
                type="button"
                onClick={() => {
                  setSelectedPipeline(pipe);
                  setActivePipelineStep(-1);
                  setIsSimulating(false);
                  if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {pipe.shortTitle || pipe.title.split('&')[0]}
              </button>
            );
          })}
        </div>

        {/* Pipeline Summary & Metrics Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-orange-400 uppercase font-semibold block tracking-wider">
              {selectedPipeline.category} • {selectedPipeline.tag}
            </span>
            <p className="text-xs text-neutral-300 mt-0.5 font-normal line-clamp-2 leading-relaxed">
              {selectedPipeline.summary}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-neutral-500 block uppercase">Time Saved</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{selectedPipeline.savedHours}</span>
          </div>
        </div>
      </div>

      {/* Interactive Node Graph Steps Container */}
      <div className="relative w-full flex-1 flex flex-col justify-between py-1 space-y-2">
        {selectedPipeline.nodes.map((node, index) => {
          const NodeIcon = node.icon;
          const isActive = activePipelineStep === index;
          const isPast = activePipelineStep > index;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodePayload({ ...node, pipelineTitle: selectedPipeline.title })}
              className={`group/node relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-orange-500/10 border-orange-400/40 text-white shadow-sm'
                  : isPast
                  ? 'bg-white/[0.03] border-emerald-500/30 text-neutral-200'
                  : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    isActive
                      ? 'bg-orange-500 text-black border-orange-500 font-bold'
                      : isPast
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/5 text-neutral-400 border-white/10'
                  }`}
                >
                  <NodeIcon className="w-3.5 h-3.5" />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-neutral-500">
                      0{index + 1}
                    </span>
                    <span className="text-xs font-medium text-white truncate">
                      {node.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 truncate block mt-0.5">
                    {node.status}
                  </span>
                </div>
              </div>

              {/* Right Timing Badge & Inspect Prompt */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.08] text-[10px] font-mono text-neutral-400 group-hover/node:text-neutral-200">
                  {node.time}
                </span>
                <span className="text-[10px] font-mono text-orange-400 opacity-0 group-hover/node:opacity-100 transition-opacity flex items-center gap-0.5">
                  <Code className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Bar: Metrics & Node Inspect Prompt */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {selectedPipeline.accuracy} Accuracy
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-300">{selectedPipeline.latency} Latency</span>
        </div>
        <span className="font-mono text-[10px] text-neutral-500 hidden sm:inline">
          Click any step to inspect details
        </span>
      </div>

      {/* LIGHTBOX MODAL FOR NODE EXECUTION PAYLOAD INSPECTION */}
      <AnimatePresence>
        {selectedNodePayload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNodePayload(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-[#0d0e12] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header Bar */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400">
                    {selectedNodePayload.icon ? (
                      <selectedNodePayload.icon className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 text-neutral-300 border border-white/10 font-semibold">
                        {selectedNodePayload.type || 'NODE'}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {selectedNodePayload.time || '24ms'}
                      </span>
                    </div>
                    <h3 className="text-lg font-syne font-bold text-white mt-1">
                      {selectedNodePayload.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNodePayload(null)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body: Live Payload Inspection */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto font-mono text-xs">
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block mb-1">Pipeline</span>
                  <p className="text-white font-sans text-sm font-semibold">{selectedNodePayload.pipelineTitle}</p>
                </div>

                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block mb-1">Status</span>
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-emerald-300 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{selectedNodePayload.status}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-neutral-500 uppercase text-[10px]">Step Details &amp; Data</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPayload(selectedNodePayload.details)}
                      className="inline-flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-black/70 border border-white/10 text-neutral-200 text-[11px] overflow-x-auto shadow-inner leading-relaxed">
                    {JSON.stringify(selectedNodePayload.details, null, 2)}
                  </pre>
                </div>

                {selectedNodePayload.title?.includes('Remotion') && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-orange-400 uppercase text-[10px] font-semibold">
                        Verified Source: AutoflowVideo.tsx (lines 1–28)
                      </span>
                      <span className="text-[10px] text-neutral-500">Remotion 4.0.516</span>
                    </div>
                    <pre className="p-4 rounded-xl bg-black/90 border border-orange-500/20 text-orange-200 text-[11px] overflow-x-auto shadow-inner leading-relaxed font-mono">
{`import { Composition } from 'remotion';
import { AutoflowVideo } from './AutoflowVideo';
import { Cover916 } from './Cover916';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="autoflow"
        component={AutoflowVideo}
        durationInFrames={1602}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="cover"
        component={Cover916}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};`}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Verified Workflow Step</span>
                <button
                  type="button"
                  onClick={() => setSelectedNodePayload(null)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
