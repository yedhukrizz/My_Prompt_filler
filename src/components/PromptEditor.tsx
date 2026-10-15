import React, { useState, useRef } from 'react';
import { Bookmark, Plus, Sparkles, Trash2, Tag, RefreshCw, Check } from 'lucide-react';
import { BracketStyle } from '../types';
import { formatPlaceholderTag } from '../utils/placeholderParser';

interface PromptEditorProps {
  prompt: string;
  setPrompt: (text: string) => void;
  title: string;
  setTitle: (title: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  onSaveAsNew: (title: string) => void;
  onUpdateExisting: () => void;
  activeTemplateId: string | null;
  onClearPrompt: () => void;
}

const COMMON_TAGS = ['Marketing', 'Code', 'Sales', 'Product', 'Creative', 'Email', 'Academic'];
const QUICK_INSERT_IDEAS = ['Topic', 'Audience', 'Tone of Voice', 'Key Takeaways', 'Call to Action', 'Language'];

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  setPrompt,
  title,
  setTitle,
  tags,
  setTags,
  onSaveAsNew,
  onUpdateExisting,
  activeTemplateId,
  onClearPrompt,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [bracketStyle, setBracketStyle] = useState<BracketStyle>('square');
  const [customVarInput, setCustomVarInput] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Insert placeholder at current cursor position
  const insertPlaceholder = (varName: string) => {
    const formatted = formatPlaceholderTag(varName, bracketStyle);
    const textarea = textareaRef.current;
    if (!textarea) {
      setPrompt(prompt + ' ' + formatted);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = prompt.substring(0, start) + formatted + prompt.substring(end);
    setPrompt(newText);

    // Restore focus and position cursor right after inserted tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formatted.length, start + formatted.length);
    }, 10);
  };

  const handleCustomInsert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customVarInput.trim()) return;
    insertPlaceholder(customVarInput.trim());
    setCustomVarInput('');
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSave = () => {
    if (activeTemplateId) {
      onUpdateExisting();
    } else {
      onSaveAsNew(title);
    }
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100 flex flex-col justify-between h-full">
      {/* Header with Title & Tags */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Template Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cold Sales Outreach, Blog Outline..."
              className="w-full text-lg font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none border-b border-transparent focus:border-neutral-300 pb-0.5"
            />
          </div>

          {/* Bracket style picker */}
          <div className="flex items-center gap-1 bg-[#F4F6F8] p-1 rounded-full text-xs self-start">
            {(['square', 'curly', 'doubleCurly', 'angle'] as BracketStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setBracketStyle(style)}
                className={`px-2.5 py-1 rounded-full font-mono font-medium transition-all ${
                  bracketStyle === style
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title={`Use ${style === 'square' ? '[ ]' : style === 'curly' ? '{ }' : style === 'doubleCurly' ? '{{ }}' : '< >'} style`}
              >
                {style === 'square' ? '[x]' : style === 'curly' ? '{x}' : style === 'doubleCurly' ? '{{x}}' : '<x>'}
              </button>
            ))}
          </div>
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Tags:
          </span>
          {COMMON_TAGS.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'bg-[#F2F4F7] text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Variable Quick-Insert Tool */}
        <div className="bg-[#F8F9FA] rounded-2xl p-3 mb-3 border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-neutral-600" />
              Quick-Insert Placeholder:
            </span>
            <span className="text-[10px] text-neutral-400">Click to add at cursor</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {QUICK_INSERT_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => insertPlaceholder(idea)}
                className="text-[11px] font-medium bg-white hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-neutral-700 px-2.5 py-1 rounded-full border border-neutral-200 transition-colors shadow-xs"
              >
                + {formatPlaceholderTag(idea, bracketStyle)}
              </button>
            ))}
          </div>

          {/* Custom variable name input */}
          <form onSubmit={handleCustomInsert} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customVarInput}
                onChange={(e) => setCustomVarInput(e.target.value)}
                placeholder="Type custom variable name (e.g. Budget, Persona)..."
                className="w-full bg-white text-xs text-neutral-800 px-3 py-1.5 rounded-full border border-neutral-200 focus:outline-none focus:border-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={!customVarInput.trim()}
              className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Insert</span>
            </button>
          </form>
        </div>

        {/* Main Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={10}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste your prompt template here. Any [bracketed], {curled}, or <angled> words will automatically become interactive input fields..."
            className="w-full p-4 bg-[#F8FAFC] rounded-2xl border border-neutral-200/80 text-sm text-neutral-900 leading-relaxed font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all resize-y min-h-[220px]"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearPrompt}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
            title="Clear prompt editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSaveAsNew(`${title || 'Untitled'} (Copy)`)}
            className="px-3.5 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Save as New
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSavedRecently
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {isSavedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>{activeTemplateId ? 'Update Template' : 'Save Template'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
