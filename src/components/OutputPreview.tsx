import React, { useState } from 'react';
import { Copy, Check, Eye, Code, ArrowUpRight, Sparkles } from 'lucide-react';
import { RenderToken } from '../utils/placeholderParser';
import confetti from 'canvas-confetti';

interface OutputPreviewProps {
  tokens: RenderToken[];
  renderedText: string;
  isHighlightEnabled: boolean;
  onToggleHighlight: () => void;
  unfilledCount: number;
}

export const OutputPreview: React.FC<OutputPreviewProps> = ({
  tokens,
  renderedText,
  isHighlightEnabled,
  onToggleHighlight,
  unfilledCount,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedText);
    setCopied(true);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#D4F626', '#8EAFF7', '#111315', '#6366F1'],
      });
    } catch {
      // ignore
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4F626] text-neutral-950 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">Live Rendered Prompt</h3>
              <p className="text-xs text-neutral-400 font-medium">Ready to copy into any LLM or app</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleHighlight}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isHighlightEnabled
                  ? 'bg-neutral-900 text-white'
                  : 'bg-[#F2F4F7] text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isHighlightEnabled ? 'Highlighting On' : 'Plain'}</span>
            </button>
          </div>
        </div>

        {/* Unfilled Warning Banner if needed */}
        {unfilledCount > 0 && (
          <div className="mb-3 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
            <span>
              <strong>Note:</strong> {unfilledCount} placeholder{unfilledCount > 1 ? 's are' : ' is'} still unfilled.
            </span>
            <span className="text-[11px] font-bold text-amber-900">Preview retaining tags</span>
          </div>
        )}

        {/* Rendered Text Box */}
        <div className="bg-[#FAFBFD] rounded-2xl p-4.5 border border-neutral-200/80 min-h-[220px] max-h-[360px] overflow-y-auto font-sans text-sm leading-relaxed text-neutral-900 whitespace-pre-wrap select-text">
          {renderedText.trim() === '' ? (
            <span className="text-neutral-400 italic">Rendered output will appear here in real-time...</span>
          ) : isHighlightEnabled ? (
            tokens.map((token, idx) => {
              if (token.type === 'text') {
                return <span key={idx}>{token.value}</span>;
              }
              if (token.type === 'filled') {
                return (
                  <mark
                    key={idx}
                    className="bg-[#D4F626] text-neutral-950 font-semibold px-1.5 py-0.5 rounded-md mx-0.5 transition-all shadow-2xs"
                    title={`Filled value for [${token.key}]`}
                  >
                    {token.value}
                  </mark>
                );
              }
              // Unfilled
              return (
                <span
                  key={idx}
                  className="bg-[#EEF2FF] text-[#4F46E5] font-mono font-medium px-1.5 py-0.5 rounded-md mx-0.5 border border-[#C7D2FE]"
                  title={`Unfilled placeholder [${token.key}]`}
                >
                  {token.raw}
                </span>
              );
            })
          ) : (
            renderedText
          )}
        </div>
      </div>

      {/* Prominent Action Button (Obsidian Pill) */}
      <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
        <div className="text-xs text-neutral-500 font-medium">
          {tokens.filter((t) => t.type === 'filled').length} fields integrated
        </div>

        <button
          onClick={handleCopy}
          className={`px-6 py-3 rounded-full text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 shadow-sm ${
            copied
              ? 'bg-emerald-600 text-white scale-102'
              : 'bg-black text-white hover:bg-neutral-800 hover:shadow-md'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>COPIED TO CLIPBOARD!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>COPY ASSEMBLED PROMPT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
