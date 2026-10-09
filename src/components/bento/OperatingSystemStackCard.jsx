import React, { useState } from 'react';
import { Cpu, Search, X, Pause, Play, Sparkles } from 'lucide-react';

export default function OperatingSystemStackCard({ tools }) {
  const [toolCategory, setToolCategory] = useState('All');
  const [activeTool, setActiveTool] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { label: 'All', value: 'All' },
    { label: 'Video & Media', value: 'AI & Media' },
    { label: 'LLMs & AI', value: 'LLMs & AI' },
    { label: 'Cloud & Code', value: 'Code & Cloud' },
    { label: 'VA & Ops', value: 'Operations & E-Com' },
  ];

  // Filter tools by category and search query
  const filteredTools = tools.filter((t) => {
    const matchesCategory =
      toolCategory === 'All' || t.category === toolCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isSearching = Boolean(searchQuery.trim());

  // In standard marquee mode: duplicate once for seamless 50% infinite translation loop
  // In search mode: DO NOT duplicate at all (render exact 1:1 matching results)
  const displayItems = isSearching
    ? filteredTools
    : filteredTools.length > 0
    ? [...filteredTools, ...filteredTools]
    : [];

  const handleToolSelect = (tool) => {
    if (activeTool?.name === tool.name && isPinned) {
      // Unpin if clicking same
      setIsPinned(false);
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      setIsPinned(true);
    }
  };

  const marqueeDuration = Math.max(26, filteredTools.length * 2.2);

  return (
    <div className="bento-card glass-card relative lg:col-span-8 min-h-[260px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-mono tracking-wider text-neutral-300 font-medium">
            Tools &amp; Software
          </span>
          <span className="text-[10px] font-mono text-orange-400/90 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Search */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-neutral-400 absolute left-2.5 pointer-events-none" />
            <input
              id="tool-search-input"
              name="tool-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tool..."
              className="w-28 sm:w-32 pl-7 pr-6 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 focus:w-36 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-neutral-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.06] overflow-x-auto scrollbar-none max-w-full">
            {CATEGORIES.map((cat) => {
              const isSelected = toolCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setToolCategory(cat.value);
                    if (searchQuery) setSearchQuery('');
                  }}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Marquee Pause/Resume Toggle */}
          {!isSearching && (
            <button
              type="button"
              onClick={() => setIsMarqueePaused((prev) => !prev)}
              className={`p-1 sm:p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                isMarqueePaused
                  ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                  : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'
              }`}
              title={isMarqueePaused ? 'Resume scroll' : 'Pause scroll'}
            >
              {isMarqueePaused ? (
                <Play className="w-3 h-3 fill-current text-orange-400" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Marquee Track / Static View */}
      <div className="group/marquee relative w-full overflow-hidden py-3">
        {/* Soft edge gradient fades (only in marquee scrolling mode) */}
        {!isSearching && (
          <>
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#050507] via-[#050507]/80 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#050507] via-[#050507]/80 to-transparent pointer-events-none z-10" />
          </>
        )}

        {filteredTools.length > 0 ? (
          isSearching ? (
            /* SEARCH RESULT MODE: Clean stationary grid without duplication */
            <div className="flex flex-wrap items-center gap-2.5 min-h-[44px]">
              {filteredTools.map((tool) => {
                const isCurrent = activeTool?.name === tool.name;
                return (
                  <div
                    key={tool.name}
                    onMouseEnter={() => {
                      if (!isPinned) setActiveTool(tool);
                    }}
                    onMouseLeave={() => {
                      if (!isPinned) setActiveTool(null);
                    }}
                    onClick={() => handleToolSelect(tool)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer shadow-sm group/tool ${
                      isCurrent
                        ? 'bg-orange-500/15 border-orange-500/70 shadow-[0_0_20px_rgba(255,107,0,0.3)] ring-1 ring-orange-400/40'
                        : 'bg-white/[0.03] border border-white/[0.08] hover:border-orange-500/40 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <img
                        src={tool.src}
                        alt={tool.name}
                        loading="lazy"
                        decoding="async"
                        className="w-4 h-4 object-contain transition-transform group-hover/tool:scale-115"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap transition-colors ${
                        isCurrent
                          ? 'text-white font-semibold'
                          : 'text-neutral-200 group-hover/tool:text-white'
                      }`}
                    >
                      {tool.name}
                    </span>
                    {isCurrent && isPinned && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* MARQUEE MODE: Infinite smooth scrolling track */
            <div
              className="flex items-center gap-2.5 animate-marquee w-max will-change-transform group-hover/marquee:[animation-play-state:paused]"
              style={{
                animationDuration: `${marqueeDuration}s`,
                animationPlayState: isMarqueePaused ? 'paused' : 'running',
              }}
            >
              {displayItems.map((tool, idx) => {
                const isCurrent = activeTool?.name === tool.name;
                return (
                  <div
                    key={`${tool.name}-${idx}`}
                    onMouseEnter={() => {
                      if (!isPinned) setActiveTool(tool);
                    }}
                    onMouseLeave={() => {
                      if (!isPinned) setActiveTool(null);
                    }}
                    onClick={() => handleToolSelect(tool)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer shadow-sm group/tool ${
                      isCurrent
                        ? 'bg-orange-500/15 border-orange-500/70 shadow-[0_0_20px_rgba(255,107,0,0.3)] ring-1 ring-orange-400/40'
                        : 'bg-white/[0.03] border border-white/[0.08] hover:border-orange-500/40 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <img
                        src={tool.src}
                        alt={tool.name}
                        loading="lazy"
                        decoding="async"
                        className="w-4 h-4 object-contain transition-transform group-hover/tool:scale-115"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap transition-colors ${
                        isCurrent
                          ? 'text-white font-semibold'
                          : 'text-neutral-200 group-hover/tool:text-white'
                      }`}
                    >
                      {tool.name}
                    </span>
                    {isCurrent && isPinned && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="py-6 text-center text-xs font-mono text-neutral-400">
            No tools match &quot;{searchQuery}&quot;. Click &apos;X&apos; or choose another category.
          </div>
        )}
      </div>

      {/* Active Tool Summary & Context Drawer */}
      <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-1 min-h-[36px]">
        {activeTool ? (
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-white font-medium flex items-center gap-2 truncate">
              <span className="text-orange-400 font-semibold shrink-0">
                {activeTool.name}
              </span>
              <span className="text-neutral-600 shrink-0">•</span>
              <span className="text-neutral-300 font-normal truncate">
                {activeTool.desc}
              </span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {isPinned && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPinned(false);
                    setActiveTool(null);
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-white/5 border border-white/10 cursor-pointer"
                  title="Click to unpin"
                >
                  Unpin
                </button>
              )}
              <span className="text-[10px] text-orange-400/90 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase">
                {activeTool.category}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-orange-400" />
              Hover or click any tool to inspect real-world use case
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
              Hover pauses track
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
