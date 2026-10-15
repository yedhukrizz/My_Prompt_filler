/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FileTextIcon,
  Folder01Icon,
  Bookmark02Icon,
  Copy01Icon,
  Tick01Icon,
  ClipboardPasteIcon,
  Edit02Icon,
  Delete02Icon,
  SparklesIcon,
  ArrowReloadHorizontalIcon,
  Cancel01Icon,
  FileExportIcon,
  FileImportIcon,
  Coffee01Icon,
} from '@hugeicons/core-free-icons';
import { usePromptStorage } from './hooks/usePromptStorage';
import {
  extractPlaceholders,
  renderPrompt,
  tokenizePrompt,
  getSmartSuggestions,
} from './utils/placeholderParser';
import confetti from 'canvas-confetti';

export default function App() {
  const {
    templates,
    activeTemplateId,
    prompt,
    setPrompt,
    title,
    setTitle,
    values,
    setFieldValue,
    clearAllFields,
    loadTemplate,
    saveCurrentAsNewTemplate,
    updateCurrentTemplate,
    deleteTemplate,
    renameTemplate,
    resetToDefaults,
    exportTemplatesAsJSON,
    importTemplates,
    moveTemplateToFolder,
  } = usePromptStorage();

  // TWO VIEWS: 'copybox' (the prompt) and 'saved'
  const [activeTab, setActiveTab] = useState<'copybox' | 'saved'>('copybox');

  // Folder states
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('promptfill_custom_folders');
      return saved ? JSON.parse(saved) : ['General', 'Development', 'Marketing', 'Personal'];
    } catch {
      return ['General', 'Development', 'Marketing', 'Personal'];
    }
  });

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('promptfill_custom_folders', JSON.stringify(customFolders));
    } catch {}
  }, [customFolders]);

  const allFolders = useMemo(() => {
    const set = new Set<string>(['General', ...customFolders]);
    templates.forEach((t) => {
      if (t.folder) set.add(t.folder);
    });
    return Array.from(set);
  }, [templates, customFolders]);

  const filteredTemplates = useMemo(() => {
    if (selectedFolder === 'All') return templates;
    return templates.filter((t) => (t.folder || 'General') === selectedFolder);
  }, [templates, selectedFolder]);

  // Raw editor toggle
  const [isRawEditing, setIsRawEditing] = useState(false);

  // In-place filler editing state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Saved prompt renaming state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState<string>('');

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Keyboard visibility detection for touch screen & mobile devices
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Onboarding carousel state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('promptfill_onboarded');
    } catch {
      return true;
    }
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(0);

  const onboardingSlides = [
    {
      title: "Welcome to PromptFill",
      description: "The ultimate interactive prompt builder and filler. Paste any prompt with placeholders and watch them turn into editable chips instantly.",
      icon: FileTextIcon,
    },
    {
      title: "The Power of Prompts",
      description: "Prompts have high power to turn into your systems and processes. But we often customise them and forget about them.",
      icon: SparklesIcon,
    },
    {
      title: "Link Prompts to Systems",
      description: "Here we can link our custom prompts to systems and turn it into a working system that is more valuable than a single prompt.",
      icon: Folder01Icon,
    },
    {
      title: "Star on GitHub",
      description: "Love using PromptFill? Show your support by starring the repository on GitHub.",
      actionUrl: "https://github.com/yedhukrizz",
      actionText: "Star on GitHub",
      icon: SparklesIcon,
    },
    {
      title: "Buy the Dev a Coffee",
      description: "Fuel future updates and support independent development by buying the creator a coffee.",
      actionUrl: "https://www.buymeacoffee.com/yedhukrizz",
      actionText: "Buy Me a Coffee",
      icon: Coffee01Icon,
    },
    {
      title: "More Apps by Sheeprun",
      description: "Come to Sheeprun for more amazing, fast, and elegant productivity apps.",
      actionUrl: "https://sheeprun.app",
      actionText: "Visit Sheeprun",
      icon: Folder01Icon,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        if (heightDiff > 100) {
          setIsKeyboardVisible(true);
        }
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsKeyboardVisible(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          if (
            document.activeElement?.tagName !== 'INPUT' &&
            document.activeElement?.tagName !== 'TEXTAREA'
          ) {
            setIsKeyboardVisible(false);
          }
        }, 150);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    // Initial check in case an input is already focused
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      setIsKeyboardVisible(true);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Extract placeholders
  const placeholders = useMemo(() => {
    return extractPlaceholders(prompt);
  }, [prompt]);

  // Rendered string
  const renderedText = useMemo(() => {
    return renderPrompt(prompt, values, true);
  }, [prompt, values]);

  const tokens = useMemo(() => {
    return tokenizePrompt(prompt, values);
  }, [prompt, values]);

  const isCodeOrJson = useMemo(() => {
    const trimmed = prompt.trim();
    return (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      trimmed.includes('": "') ||
      trimmed.includes('": {')
    );
  }, [prompt]);

  // Auto-focus input when editing a filler
  useEffect(() => {
    if (editingKey) {
      setTempValue(values[editingKey] || '');
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          editInputRef.current.select();
        }
      }, 20);
    }
  }, [editingKey, values]);

  // Global paste handler: When user presses Ctrl+V / Cmd+V anywhere, auto-process to jumbo!
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      const pasted = e.clipboardData?.getData('text');
      if (pasted && pasted.trim()) {
        e.preventDefault();
        setPrompt(pasted);
        setIsRawEditing(false);
        setActiveTab('copybox');
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [setPrompt]);

  const handleStartEdit = (key: string) => {
    setEditingKey(key);
  };

  const handleSaveEdit = (key: string) => {
    setFieldValue(key, tempValue);
    setEditingKey(null);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
  };

  // Copy with celebration
  const handleCopy = () => {
    if (!renderedText.trim()) return;
    navigator.clipboard.writeText(renderedText);
    setCopied(true);
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.8 },
        colors: ['#D4F626', '#8EAFF7', '#111315', '#6366F1'],
      });
    } catch {
      // ignore
    }
    setTimeout(() => setCopied(false), 2000);
  };

  // Save current prompt
  const handleSaveCurrent = () => {
    if (activeTemplateId) {
      updateCurrentTemplate();
    } else {
      saveCurrentAsNewTemplate(title || 'Saved Prompt');
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPrompt(text);
        setIsRawEditing(false);
      }
    } catch {
      setIsRawEditing(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importTemplates(content);
      if (success) {
        try {
          const savedFolders = localStorage.getItem('promptfill_custom_folders');
          if (savedFolders) {
            setCustomFolders(JSON.parse(savedFolders));
          }
        } catch {}
        setImportStatus('Successfully imported saves!');
        setTimeout(() => setImportStatus(null), 2500);
      } else {
        setImportStatus('Failed to parse JSON file.');
        setTimeout(() => setImportStatus(null), 2500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('promptfill_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('promptfill_dark_mode', String(isDarkMode));
    } catch {}
  }, [isDarkMode]);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const suggestions = editingKey ? getSmartSuggestions(editingKey) : [];

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDarkMode ? 'bg-[#111318] text-neutral-100' : 'bg-[#EAEFF4] text-neutral-900'} px-4 sm:px-8 lg:px-16 py-4 w-full max-w-[1700px] mx-auto flex flex-col justify-between pb-48 relative font-sans box-border`}>
      {/* Top Header Bar */}
      <header className={`w-full flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200/60'} mb-3 sm:mb-4`}>
        <div className="flex items-center gap-2">
          <span className={`font-extrabold text-lg ${isDarkMode ? 'text-white' : 'text-neutral-950'} tracking-tight`}>PromptFill</span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'}`}>by sheeprun</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setOnboardingStep(0);
            setIsOnboardingOpen(true);
          }}
          className={`px-4 py-2 rounded-full text-xs font-extrabold border transition-all shadow-md flex items-center cursor-pointer ${
            isDarkMode
              ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
              : 'bg-gradient-to-r from-neutral-950 to-neutral-800 text-white border-neutral-800 hover:scale-105'
          }`}
        >
          <span>Welcome Guide</span>
        </button>
      </header>
      {/* =========================================================================
          MAIN AREA: COPY BOX
         ========================================================================= */}
      {activeTab === 'copybox' ? (
        <main className="w-full max-w-full overflow-x-hidden min-h-[500px] flex flex-col justify-start py-2">
          {isRawEditing ? (
            <div className="flex flex-col gap-4">
              <textarea
                autoFocus
                rows={12}
                value={prompt}
                onFocus={() => setIsKeyboardVisible(true)}
                onChange={(e) => setPrompt(e.target.value)}
                onPaste={() => {
                  setTimeout(() => setIsRawEditing(false), 50);
                }}
                placeholder="Paste your prompt here with [placeholders] or {fillers}. It will auto-process into jumbo text..."
                className={`w-full max-w-full box-border text-2xl sm:text-3xl lg:text-4xl font-medium leading-relaxed p-6 sm:p-8 rounded-3xl border resize-y shadow-xs focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'text-white bg-neutral-900/90 border-neutral-800 focus:ring-neutral-700 focus:bg-neutral-900'
                    : 'text-neutral-900 bg-white/90 border-neutral-200 focus:ring-neutral-900 focus:bg-white'
                }`}
              />
              <div className="flex items-center justify-end px-2">
                <button
                  onClick={() => setIsRawEditing(false)}
                  className={`font-bold hover:underline text-xs ${isDarkMode ? 'text-neutral-300' : 'text-neutral-950'}`}
                >
                  View Highlighted →
                </button>
              </div>
            </div>
          ) : !prompt.trim() ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className={`px-10 py-6 rounded-full font-extrabold text-xl sm:text-2xl transition-all shadow-xl flex items-center gap-3.5 mb-4 cursor-pointer hover:scale-103 active:scale-98 ${
                  isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                }`}
              >
                <HugeiconsIcon icon={ClipboardPasteIcon} size={30} className="text-[#D4F626]" />
                <span>Paste Prompt to Auto-Process</span>
              </button>
              <p className={`text-base max-w-md leading-relaxed mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Press <kbd className={`border px-2 py-0.5 rounded font-mono text-sm shadow-2xs ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-300 text-neutral-800'}`}>Ctrl+V</kbd> or <kbd className={`border px-2 py-0.5 rounded font-mono text-sm shadow-2xs ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-300 text-neutral-800'}`}>⌘+V</kbd> anywhere.
              </p>
            </div>
          ) : (
            <div
              className={`select-text whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full ${
                isCodeOrJson
                  ? isDarkMode
                    ? 'font-mono text-xl sm:text-2xl lg:text-3xl xl:text-4xl leading-relaxed text-neutral-100 bg-neutral-900/60 p-6 sm:p-10 rounded-3xl backdrop-blur-xs border border-neutral-800'
                    : 'font-mono text-xl sm:text-2xl lg:text-3xl xl:text-4xl leading-relaxed text-neutral-900 bg-white/40 p-6 sm:p-10 rounded-3xl backdrop-blur-xs border border-white/65'
                  : isDarkMode
                    ? 'font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-[1.28] lg:leading-[1.18] tracking-tight'
                    : 'font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-neutral-950 leading-[1.28] lg:leading-[1.18] tracking-tight'
              }`}
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
                const isEditing = editingKey === key;
                const val = values[key] || '';
                const isFilled = val.trim().length > 0;

                if (isEditing) {
                  return (
                    <motion.span
                      key={index}
                      initial={{ scale: 0.92, opacity: 0, y: 6 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.92, opacity: 0, y: 6 }}
                      transition={{ type: 'spring', stiffness: 550, damping: 28 }}
                      className="relative inline-block align-baseline mx-1.5 my-1 max-w-full"
                    >
                      <span className="inline-flex items-center gap-2 bg-[#D4F626] border-2 sm:border-[3px] border-neutral-950 rounded-3xl p-2 sm:p-2.5 shadow-2xl max-w-full">
                        <textarea
                          ref={editInputRef as any}
                          rows={2}
                          value={tempValue}
                          onFocus={() => setIsKeyboardVisible(true)}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit(key);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                          }}
                          placeholder={`Enter ${key}...`}
                          className="bg-white text-neutral-950 font-bold px-4 py-2.5 rounded-2xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 text-xl sm:text-2xl lg:text-3xl w-full sm:w-[380px] max-w-full resize-y min-h-[70px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(key)}
                          className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-800 shrink-0 shadow-sm"
                          title="Confirm (Enter)"
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={22} strokeWidth={2.8} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="w-10 h-10 rounded-2xl bg-white/80 text-neutral-700 flex items-center justify-center hover:bg-white shrink-0"
                          title="Cancel (Esc)"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2.6} />
                        </button>
                      </span>

                      {/* Floating quick suggestions */}
                      {suggestions.length > 0 && (
                        <motion.span
                          initial={{ opacity: 0, y: 8, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-0 top-full mt-3 z-30 bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-2xl rounded-3xl p-3.5 flex flex-wrap gap-2 min-w-[300px] max-w-[480px]"
                        >
                          <span className="w-full text-xs font-bold text-neutral-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                            <HugeiconsIcon icon={SparklesIcon} size={15} className="text-[#4F46E5]" />
                            Suggestions:
                          </span>
                          {suggestions.map((sugg) => (
                            <button
                              key={sugg}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFieldValue(key, sugg);
                                setEditingKey(null);
                              }}
                              className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-[#D4F626] text-neutral-950 transition-colors"
                            >
                              {sugg}
                            </button>
                          ))}
                        </motion.span>
                      )}
                    </motion.span>
                  );
                }

                // Render filled highlighted filler directly on background
                if (isFilled) {
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleStartEdit(key)}
                      title={`Click to edit [${key}]`}
                      className="inline-flex items-center gap-2 bg-[#D4F626] hover:bg-[#cbf117] active:scale-98 text-neutral-950 font-bold px-4 sm:px-5 py-1.5 sm:py-2 rounded-3xl transition-all shadow-sm cursor-pointer align-baseline mx-1.5 my-1.5 border border-black/15 hover:shadow-md max-w-full text-left whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                    >
                      <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{val}</span>
                    </button>
                  );
                }

                // Unfilled filler directly on background
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleStartEdit(key)}
                    title={`Click to fill [${key}]`}
                    className={`inline-flex items-center gap-1.5 font-bold px-4 sm:px-5 py-1 sm:py-1.5 rounded-3xl border-2 border-dashed transition-all cursor-pointer align-baseline mx-2 my-1 animate-pulse shadow-xs ${
                      isDarkMode
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-[#8EAFF7] border-neutral-700 hover:border-[#8EAFF7]'
                        : 'bg-white/95 hover:bg-white text-[#4F46E5] border-[#A5B4FC] hover:border-[#6366F1]'
                    }`}
                  >
                    <span className="font-mono text-[0.82em]">{token.raw}</span>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        /* SAVED VIEW WITH CONTENT PEAK THROUGH & MORE HORIZONTAL PADDING */
        <motion.main
          key="saved"
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.99 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full min-h-[500px] flex flex-col justify-start py-6 px-6 sm:px-12 lg:px-20"
        >
          <div className="pb-6 mb-8 flex flex-col items-center justify-center text-center gap-4">
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-neutral-950'} tracking-tight`}>Saved Prompts</h2>

            {/* Import, Export, and Reset Default icons only - no labels - centered */}
            <div className="flex items-center justify-center gap-3">
              {importStatus && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  {importStatus}
                </span>
              )}

              <button
                type="button"
                onClick={() => exportTemplatesAsJSON(customFolders)}
                className={`w-11 h-11 rounded-full border transition-colors shadow-2xs flex items-center justify-center ${
                  isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                }`}
                title="Export saves as JSON"
              >
                <HugeiconsIcon icon={FileExportIcon} size={18} />
              </button>

              <label
                className={`w-11 h-11 rounded-full border transition-colors shadow-2xs flex items-center justify-center cursor-pointer ${
                  isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                }`}
                title="Import saves from JSON"
              >
                <HugeiconsIcon icon={FileImportIcon} size={18} />
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset to default starter templates?')) {
                    resetToDefaults();
                  }
                }}
                className={`w-11 h-11 rounded-full border transition-colors shadow-2xs flex items-center justify-center ${
                  isDarkMode ? 'bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-400 border-neutral-700' : 'bg-white hover:bg-red-50 text-neutral-600 hover:text-red-600 border-neutral-200'
                }`}
                title="Reset Defaults"
              >
                <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={18} />
              </button>
            </div>

            {/* Folder Filter Tabs */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => setSelectedFolder('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedFolder === 'All'
                    ? isDarkMode ? 'bg-white text-neutral-950 shadow-sm' : 'bg-neutral-950 text-white shadow-sm'
                    : isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                All ({templates.length})
              </button>
              {allFolders.map(folderName => {
                const count = templates.filter(t => (t.folder || 'General') === folderName).length;
                return (
                  <button
                    key={folderName}
                    type="button"
                    onClick={() => setSelectedFolder(folderName)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedFolder === folderName
                        ? isDarkMode ? 'bg-white text-neutral-950 shadow-sm' : 'bg-neutral-950 text-white shadow-sm'
                        : isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    <HugeiconsIcon icon={Folder01Icon} size={13} />
                    <span>{folderName} ({count})</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setNewFolderNameInput('');
                  setIsFolderModalOpen(true);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border border-dashed ${
                  isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-600 border-neutral-300'
                }`}
                title="Create new folder"
              >
                <span>+ New Folder</span>
              </button>
            </div>
          </div>

          {/* Saved Prompts Grid with Content Peak Through */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTemplates.length === 0 ? (
              <div className={`col-span-full py-16 text-center text-sm font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                No saved prompts in this folder.
              </div>
            ) : (
              <>
                {filteredTemplates.map((tpl) => {
                  const isActive = activeTemplateId === tpl.id;
                  const isRenaming = renamingId === tpl.id;

                  return (
                    <div
                      key={tpl.id}
                      className={`rounded-[28px] p-6 transition-all flex flex-col justify-between ${
                        isActive
                          ? isDarkMode
                            ? 'bg-neutral-900 border-2 border-[#D4F626] shadow-lg text-white'
                            : 'bg-white border-2 border-neutral-950 shadow-lg text-neutral-900'
                          : isDarkMode
                            ? 'bg-neutral-900/85 hover:bg-neutral-900 border border-neutral-800 shadow-sm text-neutral-200'
                            : 'bg-white/80 hover:bg-white border border-neutral-200/80 shadow-sm text-neutral-900'
                      }`}
                    >
                      <div className="mb-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F626] text-neutral-950 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                          <div className={`relative group/folder inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ml-auto ${
                            isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          }`}>
                            <HugeiconsIcon icon={Folder01Icon} size={12} />
                            <span>{tpl.folder || 'General'}</span>
                            <select
                              value={tpl.folder || 'General'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '__NEW__') {
                                  const name = window.prompt('Enter new folder name:');
                                  if (name && name.trim()) {
                                    if (!customFolders.includes(name.trim())) {
                                      setCustomFolders(prev => [...prev, name.trim()]);
                                    }
                                    moveTemplateToFolder(tpl.id, name.trim());
                                  }
                                } else {
                                  moveTemplateToFolder(tpl.id, val);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            >
                              {allFolders.map(f => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                              <option value="__NEW__">+ New Folder...</option>
                            </select>
                          </div>
                        </div>

                        {/* Rename saved prompt inline or display title */}
                        {isRenaming ? (
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              autoFocus
                              type="text"
                              value={renamingTitle}
                              onFocus={() => setIsKeyboardVisible(true)}
                              onChange={(e) => setRenamingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  renameTemplate(tpl.id, renamingTitle);
                                  setRenamingId(null);
                                } else if (e.key === 'Escape') {
                                  setRenamingId(null);
                                }
                              }}
                              className="w-full text-base font-bold text-neutral-950 bg-neutral-100 px-3 py-1 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                renameTemplate(tpl.id, renamingTitle);
                                setRenamingId(null);
                              }}
                              className="w-8 h-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0"
                              title="Save title"
                            >
                              <HugeiconsIcon icon={Tick01Icon} size={16} strokeWidth={2.8} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <h3 className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-neutral-950'} text-lg truncate tracking-tight`}>
                              {tpl.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingId(tpl.id);
                                setRenamingTitle(tpl.title);
                              }}
                              className={`p-1 rounded-lg transition-colors shrink-0 ${
                                isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
                              }`}
                              title="Rename prompt"
                            >
                              <HugeiconsIcon icon={Edit02Icon} size={15} />
                            </button>
                          </div>
                        )}

                        {/* Content peak through snippet with black text and white background */}
                        <p className="text-xs text-neutral-950 font-mono bg-white p-3 rounded-2xl border border-neutral-200 line-clamp-3 leading-relaxed">
                          {tpl.content}
                        </p>
                      </div>

                      <div className={`pt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                        <button
                          type="button"
                          onClick={() => deleteTemplate(tpl.id)}
                          className={`p-2 rounded-full transition-colors ${
                            isDarkMode ? 'text-neutral-400 hover:text-red-400 hover:bg-red-950/50' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="Delete saved prompt"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            loadTemplate(tpl);
                            setActiveTab('copybox');
                          }}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-colors shadow-xs ${
                            isDarkMode ? 'bg-white text-neutral-950 hover:bg-neutral-200' : 'bg-neutral-950 text-white hover:bg-neutral-800'
                          }`}
                        >
                          Load Prompt
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </motion.main>
      )}

      {/* =========================================================================
          BOTTOM BLUR GRADIENT FADE
         ========================================================================= */}
      {!isKeyboardVisible && (
        <div className={`fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t ${isDarkMode ? 'from-[#111318] via-[#111318]/80' : 'from-[#EAEFF4] via-[#EAEFF4]/80'} to-transparent pointer-events-none z-30`} />
      )}

      {/* =========================================================================
          FLOATING SIDE TAB WITH COFFEE ICON (Buy Me a Coffee)
         ========================================================================= */}
      <a
        href="https://www.buymeacoffee.com/yedhukrizz"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Buy Me a Coffee"
        className="fixed right-0 top-[85%] -translate-y-1/2 z-50 bg-[#111418] hover:bg-black text-[#D4F626] p-3 pl-3.5 rounded-l-2xl shadow-2xl flex items-center gap-2 transition-all duration-300 hover:translate-x-[-4px] group"
      >
        <HugeiconsIcon icon={Coffee01Icon} size={22} className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline-block text-xs font-bold tracking-wide uppercase pr-1 text-white">
          Coffee
        </span>
      </a>

      {/* =========================================================================
          BUBBLY BOTTOM FLOATING NAV BAR (With guaranteed touch device keyboard detection)
         ========================================================================= */}
      <AnimatePresence>
        {!isKeyboardVisible && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center gap-2"
          >
            <nav className={`flex items-center gap-2 p-2 backdrop-blur-3xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border transition-all ${
              isDarkMode ? 'bg-neutral-900/80 border-neutral-800 ring-1 ring-white/5' : 'bg-white/65 border-white/60 ring-1 ring-black/5'
            }`}>
              {/* Views: Prompt & Saved */}
              <div className={`flex items-center gap-1 backdrop-blur-xl p-1 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('copybox');
                    setIsRawEditing(false);
                  }}
                  title="Prompt"
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    activeTab === 'copybox' && !isRawEditing
                      ? isDarkMode ? 'bg-white text-neutral-950 shadow-md scale-102' : 'bg-neutral-950 text-white shadow-md scale-102'
                      : isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-950 hover:bg-white/80'
                  }`}
                >
                  <HugeiconsIcon icon={FileTextIcon} size={20} strokeWidth={2.4} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  title={`Saved Prompts (${templates.length})`}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    activeTab === 'saved'
                      ? isDarkMode ? 'bg-white text-neutral-950 shadow-md scale-102' : 'bg-neutral-950 text-white shadow-md scale-102'
                      : isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-950 hover:bg-white/80'
                  }`}
                >
                  <HugeiconsIcon icon={Folder01Icon} size={20} strokeWidth={2.2} />
                  {templates.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#D4F626] ring-2 ring-white"></span>
                  )}
                </button>
              </div>

              <div className={`w-[1px] h-6 mx-0.5 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200/80'}`}></div>

              {/* Edit Button on bottom nav */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('copybox');
                  setIsRawEditing(!isRawEditing);
                }}
                title={isRawEditing ? 'View Jumbo Highlighted' : 'Edit Raw Prompt'}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 border ${
                  isRawEditing
                    ? isDarkMode ? 'bg-white border-white text-neutral-950 scale-105' : 'bg-neutral-950 border-neutral-950 text-white scale-105'
                    : isDarkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200/80'
                }`}
              >
                <HugeiconsIcon icon={Edit02Icon} size={20} strokeWidth={2.2} />
              </button>

              {/* Save Circle Button */}
              <button
                type="button"
                onClick={handleSaveCurrent}
                title="Save Prompt"
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 shadow-2xs border ${
                  savedSuccess
                    ? 'bg-emerald-600 border-emerald-600 text-white scale-110'
                    : isDarkMode ? 'bg-neutral-800 hover:bg-[#D4F626] text-neutral-200 hover:text-neutral-950 border-neutral-700 hover:border-black/20' : 'bg-white hover:bg-[#D4F626] text-neutral-800 hover:text-neutral-950 border-neutral-200/80 hover:border-black/20'
                }`}
              >
                {savedSuccess ? (
                  <HugeiconsIcon icon={Tick01Icon} size={20} strokeWidth={2.6} />
                ) : (
                  <HugeiconsIcon icon={Bookmark02Icon} size={20} strokeWidth={2.2} />
                )}
              </button>

              {/* Copy Bubble Button */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!renderedText.trim()}
                title="Copy Assembled Prompt"
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md disabled:opacity-40 ${
                  copied
                    ? 'bg-emerald-600 text-white scale-110'
                    : isDarkMode ? 'bg-white hover:bg-neutral-200 text-neutral-950 hover:scale-105' : 'bg-neutral-950 hover:bg-neutral-800 text-[#D4F626] hover:scale-105'
                }`}
              >
                {copied ? (
                  <HugeiconsIcon icon={Tick01Icon} size={20} strokeWidth={2.6} />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} size={20} strokeWidth={2.4} />
                )}
              </button>

              <div className={`w-[1px] h-6 mx-0.5 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200/80'}`}></div>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="Settings & Theme"
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 shadow-2xs border ${
                  isDarkMode
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                    : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200/80'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </nav>

            {/* Small black title below bottom nav bar */}
            <span className={`text-[11px] font-semibold tracking-wide select-none ${isDarkMode ? 'text-neutral-400' : 'text-neutral-950'}`}>
              my prompt filler by sheeprun
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Folder Add Modal */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
              }`}
            >
              <h3 className={`text-xl font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-950'}`}>Create New Folder</h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Organize your saved prompts into custom folders.</p>
              
              <input
                autoFocus
                type="text"
                value={newFolderNameInput}
                onChange={(e) => setNewFolderNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (newFolderNameInput.trim()) {
                      const name = newFolderNameInput.trim();
                      if (!customFolders.includes(name)) {
                        setCustomFolders(prev => [...prev, name]);
                      }
                      setSelectedFolder(name);
                      setIsFolderModalOpen(false);
                      setNewFolderNameInput('');
                    }
                  } else if (e.key === 'Escape') {
                    setIsFolderModalOpen(false);
                  }
                }}
                placeholder="Folder name (e.g. Coding, Ideas)"
                className={`w-full px-4 py-3 rounded-2xl border font-medium focus:outline-none focus:ring-2 mb-6 text-sm ${
                  isDarkMode
                    ? 'bg-neutral-800 border-neutral-700 text-white focus:ring-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-neutral-950 focus:bg-white'
                }`}
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${
                    isDarkMode ? 'text-neutral-400 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newFolderNameInput.trim()) {
                      const name = newFolderNameInput.trim();
                      if (!customFolders.includes(name)) {
                        setCustomFolders(prev => [...prev, name]);
                      }
                      setSelectedFolder(name);
                      setIsFolderModalOpen(false);
                      setNewFolderNameInput('');
                    }
                  }}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-all ${
                    isDarkMode ? 'bg-white text-neutral-950 hover:bg-neutral-200' : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                  }`}
                >
                  Create Folder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Carousel Modal */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#111418] text-white flex flex-col justify-between p-8 sm:p-16 lg:p-24 overflow-y-auto"
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">PromptFill</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300">Welcome Guide</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOnboardingOpen(false);
                  try {
                    localStorage.setItem('promptfill_onboarded', 'true');
                  } catch {}
                }}
                className="w-11 h-11 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
                title="Close"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {/* Center Slide Content */}
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center my-auto py-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={onboardingStep}
                  initial={{ opacity: 0, x: 40, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-10">
                    {onboardingSlides.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          onboardingStep === idx ? 'w-10 bg-[#D4F626]' : 'w-2.5 bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Slide Icon */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#D4F626] text-neutral-950 flex items-center justify-center mb-8 shadow-2xl">
                    <HugeiconsIcon icon={onboardingSlides[onboardingStep].icon} size={42} strokeWidth={2.4} />
                  </div>

                  {/* Slide Title */}
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                    {onboardingSlides[onboardingStep].title}
                  </h2>

                  {/* Slide Description */}
                  <p className="text-base sm:text-xl text-neutral-300 leading-relaxed max-w-xl mb-10">
                    {onboardingSlides[onboardingStep].description}
                  </p>

                  {/* Action Button if available */}
                  {onboardingSlides[onboardingStep].actionUrl && (
                    <a
                      href={onboardingSlides[onboardingStep].actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 rounded-full bg-[#D4F626] hover:bg-[#cbf117] text-neutral-950 font-extrabold text-base shadow-2xl transition-all inline-flex items-center gap-2.5 hover:scale-105"
                    >
                      <span>{onboardingSlides[onboardingStep].actionText}</span>
                    </a>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-8 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setOnboardingStep((prev) => Math.max(0, prev - 1))}
                disabled={onboardingStep === 0}
                className="px-6 py-3 rounded-full text-sm font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-25 transition-colors"
              >
                Previous
              </button>

              <span className="text-xs text-neutral-500 font-mono">
                Step {onboardingStep + 1} of {onboardingSlides.length}
              </span>

              {onboardingStep < onboardingSlides.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep((prev) => prev + 1)}
                  className="px-8 py-3.5 rounded-full bg-white text-neutral-950 text-sm font-extrabold hover:bg-neutral-200 shadow-lg transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboardingOpen(false);
                    try {
                      localStorage.setItem('promptfill_onboarded', 'true');
                    } catch {}
                  }}
                  className="px-8 py-3.5 rounded-full bg-[#D4F626] hover:bg-[#cbf117] text-neutral-950 text-sm font-extrabold shadow-lg transition-all"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold tracking-tight">Settings & About</h3>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Theme Switch */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
                  <div>
                    <h4 className="font-bold text-base">Appearance</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Switch between light and dark mode</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="px-5 py-2.5 rounded-full font-extrabold text-xs bg-neutral-950 dark:bg-[#D4F626] text-white dark:text-neutral-950 shadow-md transition-all hover:scale-105"
                  >
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </div>

                {/* About App */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-2">
                  <h4 className="font-bold text-base flex items-center gap-2">
                    <span>PromptFill</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F626] text-neutral-950">v2.0</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    PromptFill is the ultimate interactive prompt builder and filler. It turns static prompts into living systems by linking custom templates to working workflows. Built with ❤️ by Sheeprun.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href="https://github.com/yedhukrizz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-600 shadow-2xs hover:bg-neutral-100"
                    >
                      Star on GitHub
                    </a>
                    <a
                      href="https://www.buymeacoffee.com/yedhukrizz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#D4F626] text-neutral-950 shadow-2xs hover:bg-[#cbf117]"
                    >
                      Buy Me a Coffee
                    </a>
                    <a
                      href="https://sheeprun.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-600 shadow-2xs hover:bg-neutral-100"
                    >
                      Sheeprun Apps
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-extrabold shadow-md hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
