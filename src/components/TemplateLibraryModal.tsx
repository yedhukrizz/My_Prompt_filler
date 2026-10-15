import React, { useState, useMemo } from 'react';
import { X, Search, Star, Trash2, Copy, FileUp, FileDown, RotateCcw, Plus, Check } from 'lucide-react';
import { PromptTemplate } from '../types';
import { extractPlaceholders } from '../utils/placeholderParser';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PromptTemplate[];
  activeTemplateId: string | null;
  onSelectTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onResetDefaults: () => void;
  onNewBlank: () => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  onSelectTemplate,
  onDeleteTemplate,
  onToggleFavorite,
  onExportJSON,
  onImportJSON,
  onResetDefaults,
  onNewBlank,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => t.tags?.forEach((tg) => set.add(tg)));
    return Array.from(set);
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesSearch =
        tpl.title.toLowerCase().includes(search.toLowerCase()) ||
        tpl.content.toLowerCase().includes(search.toLowerCase()) ||
        (tpl.tags && tpl.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

      const matchesTag = selectedTag === 'all' || (tpl.tags && tpl.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    }).sort((a, b) => {
      // Favorites first, then last modified
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return (b.lastModified || 0) - (a.lastModified || 0);
    });
  }, [templates, search, selectedTag]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportJSON(content);
      if (success) {
        setImportStatus('Successfully imported templates!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to parse JSON file.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] shadow-2xl border border-neutral-100 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 leading-tight">
              Prompt Template Library
            </h2>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              Persistent storage in your browser ({templates.length} templates saved)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewBlank();
                onClose();
              }}
              className="px-3.5 py-2 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Blank</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-6 py-3.5 bg-[#FAFBFD] border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, keyword, or tag..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs text-neutral-800 border border-neutral-200 focus:outline-none focus:border-neutral-400 shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTag('all')}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors ${
                selectedTag === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              All ({templates.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors ${
                  selectedTag === tag
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Import/Export Feedback */}
        {importStatus && (
          <div className="px-6 py-2 bg-[#D4F626]/20 border-b border-[#D4F626]/40 text-xs font-semibold text-neutral-900 flex items-center justify-between">
            <span>{importStatus}</span>
          </div>
        )}

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-neutral-400 text-xs">
              No templates found matching your search.
            </div>
          ) : (
            filteredTemplates.map((tpl) => {
              const placeholders = extractPlaceholders(tpl.content);
              const isActive = activeTemplateId === tpl.id;

              return (
                <div
                  key={tpl.id}
                  className={`rounded-[26px] p-5 transition-all border flex flex-col justify-between ${
                    isActive
                      ? 'bg-white border-neutral-900 ring-2 ring-neutral-900/10 shadow-md'
                      : 'bg-[#F9FBFC] hover:bg-white border-neutral-200/80 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-neutral-900 text-sm truncate">
                            {tpl.title}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F626] text-neutral-950 shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        {tpl.description && (
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                            {tpl.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(tpl.id);
                        }}
                        className={`p-1.5 rounded-full transition-colors ${
                          tpl.isFavorite
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'
                        }`}
                        title="Star template"
                      >
                        <Star className={`w-4 h-4 ${tpl.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Preview Snippet */}
                    <p className="text-[11px] text-neutral-400 font-mono bg-white p-2.5 rounded-xl border border-neutral-100 line-clamp-3 mb-3 leading-relaxed">
                      {tpl.content}
                    </p>

                    {/* Tags & Placeholder count */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                        {placeholders.length} placeholders
                      </span>
                      {tpl.tags?.map((tg) => (
                        <span
                          key={tg}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="text-neutral-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectTemplate(tpl);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
                    >
                      {isActive ? 'Continue Editing' : 'Load Template'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer (Data Management) */}
        <div className="p-4 px-6 bg-[#FAFBFD] border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportJSON}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>

            <label className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer">
              <FileUp className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset templates to original presets? This will reload defaults.')) {
                onResetDefaults();
              }
            }}
            className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Factory Presets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
