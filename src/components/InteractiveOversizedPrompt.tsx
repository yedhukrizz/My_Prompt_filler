import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Tick01Icon,
  Cancel01Icon,
  Edit02Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { tokenizePrompt, getSmartSuggestions, RenderToken } from '../utils/placeholderParser';

interface InteractiveOversizedPromptProps {
  prompt: string;
  values: Record<string, string>;
  onSetValue: (key: string, value: string) => void;
  fontSize: 'medium' | 'large' | 'jumbo';
  onPasteRequest?: () => void;
}

export const InteractiveOversizedPrompt: React.FC<InteractiveOversizedPromptProps> = ({
  prompt,
  values,
  onSetValue,
  fontSize,
  onPasteRequest,
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tokens = tokenizePrompt(prompt, values);

  // When editingKey changes, focus input
  useEffect(() => {
    if (editingKey) {
      setTempValue(values[editingKey] || '');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 30);
    }
  }, [editingKey, values]);

  const handleStartEdit = (key: string) => {
    setEditingKey(key);
  };

  const handleSaveEdit = (key: string) => {
    onSetValue(key, tempValue);
    setEditingKey(null);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(key);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Font size classes
  const fontClasses = {
    medium: 'text-lg sm:text-xl leading-relaxed',
    large: 'text-xl sm:text-2xl lg:text-[28px] leading-relaxed',
    jumbo: 'text-2xl sm:text-3xl lg:text-[34px] leading-relaxed',
  }[fontSize];

  if (!prompt.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
          <HugeiconsIcon icon={Edit02Icon} size={28} />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 mb-2">Prompt is empty</h3>
        <p className="text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
          Paste any prompt text containing placeholders like <code className="bg-neutral-200/80 px-2 py-0.5 rounded text-neutral-900 font-mono text-xs">[Topic]</code> or <code className="bg-neutral-200/80 px-2 py-0.5 rounded text-neutral-900 font-mono text-xs">{"{Audience}"}</code> to view and edit them directly here.
        </p>
        {onPasteRequest && (
          <button
            onClick={onPasteRequest}
            className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-all shadow-sm"
          >
            Paste from Clipboard
          </button>
        )}
      </div>
    );
  }

  const suggestions = editingKey ? getSmartSuggestions(editingKey) : [];

  return (
    <div
      ref={containerRef}
      className={`font-sans text-neutral-800 tracking-tight transition-all select-text ${fontClasses}`}
    >
      {tokens.map((token, index) => {
        if (token.type === 'text') {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {token.value}
            </span>
          );
        }

        const key = token.key!;
        const isCurrentlyEditing = editingKey === key;
        const val = values[key] || '';
        const isFilled = val.trim().length > 0;

        if (isCurrentlyEditing) {
          return (
            <span
              key={index}
              className="relative inline-block align-baseline mx-1 my-1"
            >
              <span className="inline-flex items-center gap-1 bg-[#D4F626] border-2 border-neutral-900 rounded-2xl px-2 py-1 shadow-md">
                <input
                  ref={inputRef}
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  placeholder={`Enter ${key}...`}
                  style={{ width: `${Math.max(tempValue.length + 2, key.length + 3, 10)}ch` }}
                  className="bg-white text-neutral-950 font-bold px-2 py-0.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-base sm:text-lg min-w-[120px] max-w-[400px]"
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(key)}
                  className="w-7 h-7 rounded-xl bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-800 shrink-0"
                  title="Confirm (Enter)"
                >
                  <HugeiconsIcon icon={Tick01Icon} size={15} strokeWidth={2.6} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-7 h-7 rounded-xl bg-white/70 text-neutral-700 flex items-center justify-center hover:bg-white shrink-0"
                  title="Cancel (Esc)"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.4} />
                </button>
              </span>

              {/* Floating suggestions dropdown right under the active filler */}
              {suggestions.length > 0 && (
                <span className="absolute left-0 top-full mt-2 z-30 bg-white border border-neutral-200/90 shadow-xl rounded-2xl p-2.5 flex flex-wrap gap-1.5 min-w-[260px] max-w-[380px] animate-in fade-in zoom-in-95 duration-150">
                  <span className="w-full text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1 flex items-center gap-1">
                    <HugeiconsIcon icon={SparklesIcon} size={13} className="text-[#4F46E5]" />
                    Quick Suggestions:
                  </span>
                  {suggestions.slice(0, 5).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSetValue(key, sugg);
                        setEditingKey(null);
                      }}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[#D4F626] text-neutral-800 hover:text-neutral-950 transition-colors"
                    >
                      {sugg}
                    </button>
                  ))}
                </span>
              )}
            </span>
          );
        }

        // Render highlighted filler badge
        if (isFilled) {
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStartEdit(key)}
              title={`Click to edit [${key}]`}
              className="group inline-flex items-center gap-1.5 bg-[#D4F626] hover:bg-[#cbf117] active:scale-98 text-neutral-950 font-bold px-3 py-0.5 rounded-2xl transition-all shadow-xs cursor-pointer align-baseline mx-1 my-0.5 border border-black/10"
            >
              <span>{val}</span>
              <HugeiconsIcon icon={Edit02Icon} size={14} className="opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          );
        }

        // Unfilled placeholder
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStartEdit(key)}
            title={`Click to fill [${key}]`}
            className="group inline-flex items-center gap-1.5 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] font-semibold px-3 py-0.5 rounded-2xl border-2 border-dashed border-[#A5B4FC] hover:border-[#6366F1] transition-all cursor-pointer align-baseline mx-1 my-0.5 animate-pulse"
          >
            <span className="font-mono text-[0.85em]">{token.raw}</span>
            <span className="text-[11px] font-bold bg-[#4F46E5] text-white px-1.5 py-0.2 rounded-md">
              Fill
            </span>
          </button>
        );
      })}
    </div>
  );
};
