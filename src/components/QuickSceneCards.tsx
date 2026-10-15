import React from 'react';
import { Sun, Moon, Plus, ArrowRight, FolderKanban } from 'lucide-react';
import { PromptTemplate } from '../types';

interface QuickSceneCardsProps {
  templates: PromptTemplate[];
  activeTemplateId: string | null;
  onSelectTemplate: (tpl: PromptTemplate) => void;
  onOpenLibrary: () => void;
  onNewBlank: () => void;
}

export const QuickSceneCards: React.FC<QuickSceneCardsProps> = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onOpenLibrary,
  onNewBlank,
}) => {
  const featuredOne = templates[0];
  const featuredTwo = templates[1] || templates[0];

  return (
    <div className="bg-white/80 backdrop-blur-xs rounded-[32px] p-5 shadow-sm border border-neutral-100 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3.5">
        {/* Pastel Periwinkle Blue Card (Inspired by "Morning Scene") */}
        {featuredOne && (
          <div
            onClick={() => onSelectTemplate(featuredOne)}
            role="button"
            tabIndex={0}
            className={`rounded-[26px] p-4.5 cursor-pointer transition-all duration-200 relative flex flex-col justify-between min-h-[140px] text-neutral-900 ${
              activeTemplateId === featuredOne.id
                ? 'bg-[#8CAEF8] ring-2 ring-neutral-900 shadow-md'
                : 'bg-[#98B8FE] hover:bg-[#8EAFF7]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-neutral-800 shadow-xs">
                <Sun className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-neutral-950 truncate leading-snug">
                {featuredOne.title}
              </h4>
              <p className="text-[11px] font-medium text-neutral-800/80 mt-0.5">
                {featuredOne.tags?.[0] || 'Template'} • {Object.keys(featuredOne.defaultValues || {}).length} variables
              </p>
            </div>
          </div>
        )}

        {/* Crisp White Card with Neon Lime Icon (Inspired by "Night Scene") */}
        {featuredTwo && (
          <div
            onClick={() => onSelectTemplate(featuredTwo)}
            role="button"
            tabIndex={0}
            className={`rounded-[26px] p-4.5 cursor-pointer transition-all duration-200 relative flex flex-col justify-between min-h-[140px] border border-neutral-100 ${
              activeTemplateId === featuredTwo.id
                ? 'bg-neutral-50 ring-2 ring-neutral-900 shadow-md'
                : 'bg-white hover:bg-neutral-50/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-full bg-[#D4F626] flex items-center justify-center text-neutral-950 shadow-xs">
                <Moon className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-neutral-950 truncate leading-snug">
                {featuredTwo.title}
              </h4>
              <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                {featuredTwo.tags?.[0] || 'Template'} • {Object.keys(featuredTwo.defaultValues || {}).length} variables
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Long Bar (Inspired by "+ You created 8 scenes / See All") */}
      <div className="bg-[#F6F8FA] rounded-[24px] p-3 pl-4 flex items-center justify-between border border-neutral-100/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onNewBlank}
            className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 transition-colors shrink-0 shadow-xs"
            title="Create fresh blank prompt"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-bold text-neutral-900">
              You have {templates.length} saved prompts
            </div>
            <div className="text-[10px] text-neutral-400 font-medium">
              Ready to fill or customize
            </div>
          </div>
        </div>

        <button
          onClick={onOpenLibrary}
          className="px-4 py-2 rounded-full bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
        >
          <span>See All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
