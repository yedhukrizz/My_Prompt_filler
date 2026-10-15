import { useState, useEffect, useCallback } from 'react';
import { PromptTemplate } from '../types';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { extractPlaceholders } from '../utils/placeholderParser';

const STORAGE_KEY_TEMPLATES = 'promptfill_templates_v2';
const STORAGE_KEY_DRAFT = 'promptfill_draft_v2';

interface DraftState {
  activeTemplateId: string | null;
  prompt: string;
  title: string;
  tags: string[];
  values: Record<string, string>;
}

export function usePromptStorage() {
  // Load templates from localStorage or fallback to defaults
  const [templates, setTemplates] = useState<PromptTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any) => ({ ...t, folder: t.folder || 'General' }));
        }
      }
    } catch (e) {
      console.warn('Failed to load templates from localStorage', e);
    }
    return DEFAULT_TEMPLATES;
  });

  // Load draft or initial state
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (saved) {
        const parsed: DraftState = JSON.parse(saved);
        return parsed.activeTemplateId ?? DEFAULT_TEMPLATES[0].id;
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEMPLATES[0].id;
  });

  const [prompt, setPrompt] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (saved) {
        const parsed: DraftState = JSON.parse(saved);
        if (typeof parsed.prompt === 'string') return parsed.prompt;
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEMPLATES[0].content;
  });

  const [title, setTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (saved) {
        const parsed: DraftState = JSON.parse(saved);
        if (typeof parsed.title === 'string') return parsed.title;
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEMPLATES[0].title;
  });

  const [tags, setTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (saved) {
        const parsed: DraftState = JSON.parse(saved);
        if (Array.isArray(parsed.tags)) return parsed.tags;
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEMPLATES[0].tags;
  });

  const [values, setValues] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (saved) {
        const parsed: DraftState = JSON.parse(saved);
        if (parsed.values && typeof parsed.values === 'object') return parsed.values;
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEMPLATES[0].defaultValues || {};
  });

  // Sync templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to save templates', e);
    }
  }, [templates]);

  // Sync draft to localStorage
  useEffect(() => {
    try {
      const draft: DraftState = {
        activeTemplateId,
        prompt,
        title,
        tags,
        values,
      };
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  }, [activeTemplateId, prompt, title, tags, values]);

  // Set individual field value
  const setFieldValue = useCallback((key: string, val: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: val,
    }));
  }, []);

  // Clear all filled values
  const clearAllFields = useCallback(() => {
    setValues({});
  }, []);

  // Load a template
  const loadTemplate = useCallback((tpl: PromptTemplate) => {
    setActiveTemplateId(tpl.id);
    setPrompt(tpl.content);
    setTitle(tpl.title);
    setTags(tpl.tags || []);
    // Populate with template's default values if available
    setValues(tpl.defaultValues ? { ...tpl.defaultValues } : {});
  }, []);

  // Save or update active template
  const saveCurrentAsNewTemplate = useCallback((customTitle?: string, folder?: string) => {
    const newId = `tpl-${Date.now()}`;
    const newTemplate: PromptTemplate = {
      id: newId,
      title: (customTitle || title || 'Untitled Prompt').trim(),
      content: prompt,
      tags: tags.length ? tags : ['Custom'],
      accentColor: 'lime',
      isFavorite: false,
      folder: folder || 'General',
      lastModified: Date.now(),
      defaultValues: { ...values },
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setActiveTemplateId(newId);
    return newId;
  }, [prompt, title, tags, values]);

  const updateCurrentTemplate = useCallback(() => {
    if (!activeTemplateId) {
      return saveCurrentAsNewTemplate();
    }

    setTemplates((prev) =>
      prev.map((tpl) => {
        if (tpl.id === activeTemplateId) {
          return {
            ...tpl,
            title: title.trim() || tpl.title,
            content: prompt,
            tags: tags,
            lastModified: Date.now(),
            defaultValues: { ...values },
          };
        }
        return tpl;
      })
    );
  }, [activeTemplateId, title, prompt, tags, values, saveCurrentAsNewTemplate]);

  // Delete a template
  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (activeTemplateId === id) {
      setActiveTemplateId(null);
    }
  }, [activeTemplateId]);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  }, []);

  // Fill with intelligent sample suggestions
  const fillSampleValues = useCallback(() => {
    const placeholders = extractPlaceholders(prompt);
    const newVals: Record<string, string> = {};
    placeholders.forEach((p) => {
      if (p.suggestedValues && p.suggestedValues.length > 0) {
        newVals[p.key] = p.suggestedValues[0];
      } else {
        newVals[p.key] = `Sample ${p.key}`;
      }
    });
    setValues(newVals);
  }, [prompt]);

  // Reset to original factory defaults
  const resetToDefaults = useCallback(() => {
    setTemplates(DEFAULT_TEMPLATES);
    loadTemplate(DEFAULT_TEMPLATES[0]);
  }, [loadTemplate]);

  // Export templates and custom folders as JSON
  const exportTemplatesAsJSON = useCallback((customFolders: string[] = []) => {
    const exportData = {
      version: 2,
      templates,
      customFolders,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `promptfill-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [templates]);

  // Import templates and custom folders from JSON
  const importTemplates = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      // Support object export format { templates, customFolders }
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.templates)) {
        setTemplates(parsed.templates);
        if (parsed.templates.length > 0) {
          loadTemplate(parsed.templates[0]);
        }
        if (Array.isArray(parsed.customFolders)) {
          try {
            localStorage.setItem('promptfill_custom_folders', JSON.stringify(parsed.customFolders));
          } catch {}
        }
        return true;
      }
      // Support legacy raw array format
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].content) {
        setTemplates(parsed);
        loadTemplate(parsed[0]);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import', e);
    }
    return false;
  }, [loadTemplate]);

  // Rename template
  const renameTemplate = useCallback((id: string, newTitle: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle.trim() || 'Untitled', lastModified: Date.now() } : t))
    );
  }, []);

  // Move template to folder
  const moveTemplateToFolder = useCallback((id: string, folder: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, folder: folder.trim() || 'General', lastModified: Date.now() } : t))
    );
  }, []);

  return {
    templates,
    activeTemplateId,
    prompt,
    setPrompt,
    title,
    setTitle,
    tags,
    setTags,
    values,
    setFieldValue,
    clearAllFields,
    loadTemplate,
    saveCurrentAsNewTemplate,
    updateCurrentTemplate,
    deleteTemplate,
    renameTemplate,
    moveTemplateToFolder,
    toggleFavorite,
    fillSampleValues,
    resetToDefaults,
    exportTemplatesAsJSON,
    importTemplates,
  };
}
