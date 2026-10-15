import React from 'react';
import { Zap, X, Wand2, RotateCcw, ChevronRight, Hash, Check } from 'lucide-react';
import { PlaceholderItem } from '../types';

interface PlaceholderFillerListProps {
  placeholders: PlaceholderItem[];
  values: Record<string, string>;
  onSetValue: (key: string, value: string) => void;
  onClearAll: () => void;
  onFillSampleValues: () => void;
}

export const PlaceholderFillerList: React.FC<PlaceholderFillerListProps> = ({
  placeholders,
  values,
  onSetValue,
  onClearAll,
  onFillSampleValues,
}) => {
  if (placeholders.length === 0) {
    return (
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 flex flex-col items-center justify-center text-center min-h-[220px]">
        <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] mb-3">
          <Zap className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-1">No Placeholders Detected Yet</h3>
        <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
          Type or paste any placeholder into the editor like <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 font-mono">[Target Audience]</code> or <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 font-mono">{"{Tone}"}</code> to generate custom inputs here.
        </p>
      </div>
    );
  }

  const filledCount = placeholders.filter((p) => (values[p.key] || '').trim() !== '').length;

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 flex flex-col justify-between">
      {/* Header (Inspired by AI Power Analytics header) */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
            <Zap className="w-5 h-5 fill-[#D4F626] text-[#D4F626]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">Variable Fillers</h3>
            <p className="text-xs text-neutral-400 font-medium">
              {filledCount} of {placeholders.length} filled
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFillSampleValues}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4F6F8] hover:bg-[#EEF2FF] text-neutral-700 hover:text-[#4F46E5] transition-colors flex items-center gap-1.5"
            title="Auto-fill inputs with smart samples"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fill Samples</span>
          </button>
          <button
            onClick={onClearAll}
            className="p-2 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Clear all fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List of Placeholders */}
      <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
        {placeholders.map((item) => {
          const val = values[item.key] || '';
          const isFilled = val.trim().length > 0;
          const isLongContent = item.key.toLowerCase().includes('snippet') ||
            item.key.toLowerCase().includes('description') ||
            item.key.toLowerCase().includes('outline') ||
            item.key.toLowerCase().includes('text');

          return (
            <div
              key={item.key}
              className={`rounded-[22px] p-3.5 transition-all border ${
                isFilled
                  ? 'bg-[#F9FBFC] border-neutral-200/90 shadow-2xs'
                  : 'bg-[#F5F7F9] border-dashed border-neutral-300'
              }`}
            >
              {/* Item Top row: Label & Occurrence tag */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isFilled ? 'bg-[#D4F626] text-neutral-950' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {isFilled ? <Check className="w-3 h-3 stroke-[3]" /> : <Hash className="w-3 h-3" />}
                  </div>
                  <label className="text-xs font-bold text-neutral-900 truncate">
                    {item.key}
                  </label>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.count > 1 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-600">
                      used {item.count}×
                    </span>
                  )}
                  {val && (
                    <button
                      onClick={() => onSetValue(item.key, '')}
                      className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full"
                      title={`Clear ${item.key}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Input field */}
              {isLongContent ? (
                <textarea
                  rows={2}
                  value={val}
                  onChange={(e) => onSetValue(item.key, e.target.value)}
                  placeholder={`Enter ${item.key}...`}
                  className="w-full bg-white text-xs text-neutral-800 p-2.5 rounded-xl border border-neutral-200/80 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all font-sans"
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => onSetValue(item.key, e.target.value)}
                  placeholder={`Enter ${item.key}...`}
                  className="w-full bg-white text-xs text-neutral-800 px-3 py-2 rounded-xl border border-neutral-200/80 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all font-sans"
                />
              )}

              {/* Suggestions chips */}
              {item.suggestedValues && item.suggestedValues.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1 border-t border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-medium">Suggestions:</span>
                  {item.suggestedValues.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => onSetValue(item.key, suggestion)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                        val === suggestion
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white hover:bg-neutral-200/80 text-neutral-600 border border-neutral-200/60'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
