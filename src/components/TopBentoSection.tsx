import React, { useState } from 'react';
import { Sparkles, Power, Share2, Copy, Check, FileDown, Eye, SlidersHorizontal } from 'lucide-react';
import { ThermostatDial } from './ThermostatDial';
import confetti from 'canvas-confetti';

interface TopBentoSectionProps {
  totalPlaceholders: number;
  filledPlaceholders: number;
  charCount: number;
  wordCount: number;
  originalCharCount: number;
  activeTitle: string;
  isHighlightEnabled: boolean;
  onToggleHighlight: () => void;
  onCopyPrompt: () => void;
  onExportJSON: () => void;
  onOpenTemplates: () => void;
}

export const TopBentoSection: React.FC<TopBentoSectionProps> = ({
  totalPlaceholders,
  filledPlaceholders,
  charCount,
  wordCount,
  originalCharCount,
  activeTitle,
  isHighlightEnabled,
  onToggleHighlight,
  onCopyPrompt,
  onExportJSON,
  onOpenTemplates,
}) => {
  const [copied, setCopied] = useState(false);

  const percentage = totalPlaceholders > 0
    ? Math.round((filledPlaceholders / totalPlaceholders) * 100)
    : 100;

  const charDiff = originalCharCount > 0 ? ((charCount - originalCharCount) / originalCharCount) * 100 : 0;
  const isExpanded = charDiff > 0;

  const handleCopyClick = () => {
    onCopyPrompt();
    setCopied(true);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.25 },
        colors: ['#D4F626', '#8EAFF7', '#111315', '#6366F1'],
      });
    } catch {
      // ignore
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
      {/* 1. Readiness Dial Card (Inspired by Air Conditioner card) */}
      <div className="lg:col-span-5 bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Sparkles className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-neutral-900 leading-tight">Prompt Readiness</h2>
              <p className="text-xs text-neutral-400 font-medium">Auto variable sync</p>
            </div>
          </div>

          {/* Toggle pill */}
          <button
            onClick={onToggleHighlight}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isHighlightEnabled
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="Toggle variable highlights in live preview"
          >
            <span>{isHighlightEnabled ? 'Highlight' : 'Plain'}</span>
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                isHighlightEnabled ? 'bg-[#D4F626] text-black font-bold' : 'bg-neutral-300 text-neutral-600'
              }`}
            >
              <Power className="w-2.5 h-2.5" />
            </span>
          </button>
        </div>

        {/* Small pill badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EEF2FF] text-[#4F46E5]">
            <SlidersHorizontal className="w-3 h-3" />
            {totalPlaceholders} variables detected
          </span>
          {filledPlaceholders === totalPlaceholders && totalPlaceholders > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4F626] text-neutral-900">
              All filled
            </span>
          )}
        </div>

        {/* Thermostat Dial */}
        <div className="my-1 flex justify-center">
          <ThermostatDial
            percentage={percentage}
            totalCount={totalPlaceholders}
            filledCount={filledPlaceholders}
          />
        </div>
      </div>

      {/* 2. Metrics & Actions Card (Inspired by $924.18 utility bill card) */}
      <div className="lg:col-span-4 bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
              {charCount.toLocaleString()}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#D4F626] text-neutral-900">
              {isExpanded ? `+${Math.round(charDiff)}%` : '0%'}
            </span>
          </div>

          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            Characters assembled ({wordCount} words). Real-time prompt expansion with dynamic placeholders filled.
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700">
              AI
            </div>
            <div className="w-8 h-8 rounded-full bg-[#D4F626] border-2 border-white flex items-center justify-center text-[10px] font-bold text-neutral-900">
              PF
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
              ✓
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportJSON}
              className="px-3.5 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
              title="Export all saved templates as JSON"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>EXPORT</span>
            </button>
            <button
              onClick={handleCopyClick}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY PROMPT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Right Column: Active Profile / Status Pill Banner + Quick Action Mini-Card */}
      <div className="lg:col-span-3 flex flex-col gap-4 justify-between">
        {/* Neon Lime Pill Capsule (Directly inspired by "Hi, Diana Kemmer / 7 devices active") */}
        <div
          onClick={onOpenTemplates}
          role="button"
          tabIndex={0}
          className="bg-[#D4F626] rounded-[28px] p-4 flex items-center justify-between cursor-pointer hover:brightness-95 transition-all shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
              {activeTitle.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-neutral-950 truncate leading-tight">
                {activeTitle || 'Custom Prompt'}
              </h3>
              <p className="text-[11px] font-semibold text-neutral-800/80 mt-0.5">
                {totalPlaceholders} variables active
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-neutral-900 shrink-0">
            <span className="text-xs font-black">••</span>
          </div>
        </div>

        {/* Small Assistant Status Pill Bar */}
        <div className="bg-white rounded-[28px] p-4 border border-neutral-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div className="text-xs font-bold text-neutral-900">Persistent Local DB</div>
              <div className="text-[10px] text-neutral-400 font-medium">Auto-saves every keystroke</div>
            </div>
          </div>
          <button
            onClick={onOpenTemplates}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
          >
            Library →
          </button>
        </div>
      </div>
    </div>
  );
};
