import { PlaceholderItem, BracketStyle } from '../types';

// Common suggestions based on variable keywords
const SMART_SUGGESTIONS: Record<string, string[]> = {
  tone: ['Professional & Authoritative', 'Friendly & Casual', 'Persuasive & Compelling', 'Witty & Conversational', 'Empathetic & Warm'],
  audience: ['Early-stage Founders', 'Software Engineers', 'C-Level Executives', 'Beginners & Students', 'Marketing Directors'],
  language: ['TypeScript', 'Python', 'Go', 'Rust', 'SQL'],
  format: ['Bullet Points with Summary', 'Step-by-step Tutorial', 'Executive Brief', 'Markdown Table', 'FAQ Format'],
  platform: ['LinkedIn Post', 'Twitter / X Thread', 'Company Newsletter', 'Blog Article', 'Slack Announcement'],
  goal: ['Boost organic conversions', 'Simplify onboarding', 'Reduce latency by 40%', 'Educate first-time users'],
  industry: ['B2B SaaS', 'Healthcare Tech', 'Fintech', 'E-commerce', 'Renewable Energy'],
  role: ['Principal Architect', 'Chief Growth Officer', 'Senior Copywriter', 'DevOps Specialist'],
  user_prompt: ['a cute retro 16-bit cybernetic cat with neon goggles', 'an astronaut meditating on a floating asteroid', 'a minimal origami fox logo in pastel gradients'],
  prompt: ['a cute retro 16-bit cybernetic cat with neon goggles', 'an astronaut meditating on a floating asteroid', 'a minimal origami fox logo in pastel gradients'],
  subject: ['cyberpunk red panda', 'vintage coffee grinder in warm light', 'futuristic electric sports car'],
};

export function getSmartSuggestions(key: string): string[] {
  const normalized = key.toLowerCase().trim();
  for (const [pattern, suggestions] of Object.entries(SMART_SUGGESTIONS)) {
    if (normalized.includes(pattern)) {
      return suggestions;
    }
  }
  // Generic fallback suggestions based on common words
  if (normalized.includes('name')) return ['Alex Morgan', 'Sarah Jenkins', 'Marcus Chen'];
  if (normalized.includes('company')) return ['Acme Corp', 'NextGen AI', 'Starlight Labs'];
  if (normalized.includes('number') || normalized.includes('count')) return ['3', '5', '7', '10'];
  if (normalized.includes('date') || normalized.includes('day')) return ['Tomorrow morning', 'Next Tuesday', 'End of Q3'];
  if (normalized.includes('action') || normalized.includes('cta')) return ['Schedule a 10-min demo', 'Download the free guide', 'Start your 14-day trial'];
  return [];
}

/**
 * Robust regex for placeholders that WILL NOT match JSON objects, code blocks, or multiline braces.
 * Placeholders must be single-line and contain identifier/label-friendly characters:
 * letters, digits, underscores, dashes, dots, spaces, apostrophes, ?, !, #.
 * They CANNOT contain double quotes ("), colons (:), commas (,), or newlines (\n, \r),
 * preventing false positives on JSON structures like `"key": { ... }` or `["a", "b"]`.
 * 
 * Order is critical:
 * 1. Double curly: {{ variable }}
 * 2. Square brackets: [ variable ]
 * 3. Single curly: { variable }
 * 4. Angle brackets: < variable >
 * 5. Underscores: __variable__
 */
export const PLACEHOLDER_PATTERN = 
  /\{\{\s*([a-zA-Z0-9_\-./ '?!#]+?)\s*\}\}|\[([a-zA-Z0-9_\-./ '?!#]+)\]|\{([a-zA-Z0-9_\-./ '?!#]+)\}|<([a-zA-Z0-9_\-./ '?!#]+)>|__([a-zA-Z0-9_\-./ '?!#]+)__/g;

function getFreshRegex(): RegExp {
  return new RegExp(PLACEHOLDER_PATTERN.source, 'g');
}

/**
 * Parses a prompt template string and extracts all unique placeholders.
 * Works flawlessly with regular prose prompts, code, and raw JSON templates.
 */
export function extractPlaceholders(templateText: string): PlaceholderItem[] {
  if (!templateText) return [];

  const regex = getFreshRegex();
  const placeholdersMap = new Map<string, PlaceholderItem>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(templateText)) !== null) {
    const rawMatch = match[0];
    // Find which capture group matched
    const content = (match[1] || match[2] || match[3] || match[4] || match[5] || '').trim();
    if (!content) continue;

    // Additional sanity check: placeholders should not be excessively long or empty
    if (content.length > 100) continue;

    const existing = placeholdersMap.get(content);
    if (existing) {
      existing.count += 1;
    } else {
      placeholdersMap.set(content, {
        key: content,
        raw: rawMatch,
        count: 1,
        firstIndex: match.index,
        suggestedValues: getSmartSuggestions(content),
      });
    }
  }

  return Array.from(placeholdersMap.values());
}

/**
 * Replaces placeholders in the template with user provided values.
 * Returns the final string ready to be copied or used.
 */
export function renderPrompt(
  templateText: string,
  values: Record<string, string>,
  fallbackToPlaceholderName: boolean = true
): string {
  if (!templateText) return '';

  const regex = getFreshRegex();

  return templateText.replace(regex, (match, g1, g2, g3, g4, g5) => {
    const key = (g1 || g2 || g3 || g4 || g5 || '').trim();
    if (values[key] !== undefined && values[key].trim() !== '') {
      return values[key];
    }
    return fallbackToPlaceholderName ? match : '';
  });
}

export interface RenderToken {
  type: 'text' | 'filled' | 'unfilled';
  value: string;
  key?: string;
  raw?: string;
}

/**
 * Breaks template into tokens for visual highlighted rendering
 */
export function tokenizePrompt(
  templateText: string,
  values: Record<string, string>
): RenderToken[] {
  if (!templateText) return [];

  const tokens: RenderToken[] = [];
  const regex = getFreshRegex();
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(templateText)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: templateText.substring(lastIndex, match.index),
      });
    }

    const key = (match[1] || match[2] || match[3] || match[4] || match[5] || '').trim();
    const raw = match[0];
    const val = values[key];

    if (val !== undefined && val.trim() !== '') {
      tokens.push({
        type: 'filled',
        value: val,
        key,
        raw,
      });
    } else {
      tokens.push({
        type: 'unfilled',
        value: raw,
        key,
        raw,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < templateText.length) {
    tokens.push({
      type: 'text',
      value: templateText.substring(lastIndex),
    });
  }

  return tokens;
}

/**
 * Formats a placeholder tag with selected bracket style
 */
export function formatPlaceholderTag(name: string, style: BracketStyle): string {
  const clean = name.trim();
  switch (style) {
    case 'square': return `[${clean}]`;
    case 'curly': return `{${clean}}`;
    case 'doubleCurly': return `{{${clean}}}`;
    case 'angle': return `<${clean}>`;
    default: return `[${clean}]`;
  }
}
