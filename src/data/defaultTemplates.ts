import { PromptTemplate } from '../types';

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl-mascot-app-icon',
    title: 'Mascot App Icon (JSON)',
    description: 'Structured JSON icon prompt with style constraints and custom user prompt filler.',
    tags: ['Design', 'JSON', 'Icon'],
    accentColor: 'lime',
    isFavorite: true,
    lastModified: Date.now(),
    content: `{
  "instruction": "Generate an app icon of the subject described in user_prompt, rendered in the style defined below. The user_prompt decides WHAT is drawn (character, theme, colors, mood, details). The style block decides HOW it is drawn. If the two conflict, follow user_prompt for subject, colors, and details, and keep the style for rendering.",
  "user_prompt": "{USER_PROMPT_HERE}",
  "priority": {
    "subject_and_details": "user_prompt overrides everything",
    "colors": "use colors from user_prompt if given, otherwise pick from the style palette",
    "rendering_and_format": "always follow the style block"
  },
  "style": {
    "name": "Mascot App Icon",
    "format": "single iOS-style squircle app icon, 1024x1024, centered on a plain black background",
    "composition": "front-facing, symmetrical, one subject filling 70-80% of the tile, strong silhouette readable at 48px",
    "character_design": "simplified geometric face built from circles, rounded rectangles, and semicircles; large expressive eyes (white sclera with black pupils, or solid black dots); tiny dot or simple curve mouth, or open mouth with teeth for loud characters; playful, quirky, collectible feel; one signature feature only",
    "rendering": "flat vector with soft glossy 3D-lite depth, gentle inner highlights, soft tile gradient, light rim glow, clean smooth edges, no outlines, no texture",
    "color_rule": "one dominant tile color, face in 2-3 high-contrast colors",
    "default_palette": "orange, yellow, red, hot pink, magenta, electric blue, neon green, cream, black"
  },
  "negative_prompt": "realistic, photographic, text, letters, thin lines, outlines, clutter, busy background, multiple characters, complex textures, dull colors, blurry, watermark, off-center, ignoring the user_prompt"
}`,
    defaultValues: {
      'USER_PROMPT_HERE': 'cute smiling baby red panda wearing a shiny astronaut helmet with golden visor',
    },
  },
  {
    id: 'tpl-cold-outreach',
    title: 'High-Converting Cold Outreach',
    description: 'Personalized B2B sales email addressing pain points with quantifiable social proof.',
    tags: ['Sales', 'Outreach', 'B2B'],
    accentColor: 'lime',
    isFavorite: true,
    lastModified: Date.now() - 1000 * 60 * 60 * 2,
    content: `Hi [Recipient Name],

I noticed that [Company Name] recently achieved [Recent Milestone]. Many leaders in [Industry] I speak with are focused on overcoming [Core Pain Point], which often causes [Negative Impact].

At [Your Company], we engineered [Product or Solution] to solve this exact bottleneck. For example, we recently helped a peer team achieve [Specific Measurable Result] within [Timeframe].

Would you be open to a quick 10-minute discovery call this [Day of Week] to see how this translates for [Company Name]?

Best regards,
[Your Name]
[Your Role], [Your Company]`,
    defaultValues: {
      'Recipient Name': 'Alex Rivera',
      'Company Name': 'ScaleOps Cloud',
      'Recent Milestone': 'raising their Series B round',
      'Industry': 'Enterprise Cloud Infrastructure',
      'Core Pain Point': 'slow developer onboarding and fragmented microservices',
      'Negative Impact': 'delayed sprint velocity and engineering burnout',
      'Your Company': 'ApexDev Systems',
      'Product or Solution': 'automated developer sandbox environments',
      'Specific Measurable Result': 'a 65% drop in setup time and 3x faster PR approvals',
      'Timeframe': '30 days',
      'Day of Week': 'Thursday morning',
      'Your Name': 'Diana Kemmer',
      'Your Role': 'Head of Client Partnerships',
    },
  },
  {
    id: 'tpl-blog-article',
    title: 'SEO Long-Form Thought Leadership',
    description: 'Deep dive structured article with executive summary, actionable takeaways, and CTA.',
    tags: ['Marketing', 'SEO', 'Content'],
    accentColor: 'blue',
    isFavorite: true,
    lastModified: Date.now() - 1000 * 60 * 60 * 8,
    content: `Write a comprehensive, authoritative, 1,200-word article on [Topic] targeted specifically at [Target Audience].

Guidelines:
1. Tone: Maintain a [Tone of Voice] voice throughout.
2. Structure:
   - Compelling Hook introducing the stakes in [Industry].
   - Executive TL;DR with [Number of Takeaways] key takeaways.
   - 3 Detailed Core Sections with actionable frameworks.
   - Common Pitfalls to avoid.
   - High-impact Conclusion leading into [Primary Call to Action].
3. Include real-world analogies and keep paragraphs under 3 sentences for scannability.`,
    defaultValues: {
      'Topic': 'Micro-Frontend Architectures for High-Scale Web Apps',
      'Target Audience': 'Senior Software Engineers & Architects',
      'Tone of Voice': 'Technical, Pragmatic, and Authoritative',
      'Industry': 'Modern Frontend Development',
      'Number of Takeaways': '4',
      'Primary Call to Action': 'subscribing to our Architecture Engineering Newsletter',
    },
  },
  {
    id: 'tpl-code-review',
    title: 'Senior Staff Code Auditor & Refactor',
    description: 'Principal engineer review analyzing time/space complexity and modern idioms.',
    tags: ['Engineering', 'Code', 'Refactor'],
    accentColor: 'black',
    isFavorite: false,
    lastModified: Date.now() - 1000 * 60 * 60 * 24,
    content: `Act as a Staff Principal Engineer conducting a rigorous code review for a production service.

Context & Stack:
- Language & Framework: [Language & Framework]
- Primary Optimization Goal: [Optimization Goal]
- Constraints: [Architecture Constraints]

Review the following code:
\`\`\`
[Code Snippet]
\`\`\`

Deliver:
1. Architectural analysis highlighting memory leaks, race conditions, or unhandled exceptions.
2. Refactored code snippet implementing idiomatic patterns and strict typing.
3. Benchmarks or asymptotic complexity comparison before and after.`,
    defaultValues: {
      'Language & Framework': 'TypeScript 5.4 with Node.js & Redis',
      'Optimization Goal': 'Zero memory leaks and sub-10ms cache invalidation',
      'Architecture Constraints': 'Must handle 25,000 req/sec without process termination',
      'Code Snippet': 'async function fetchUserSessions(ids: string[]) {\n  return Promise.all(ids.map(id => db.query("SELECT * FROM sessions WHERE user_id = $1", [id])));\n}',
    },
  },
  {
    id: 'tpl-product-launch',
    title: 'Feature Launch Announcement',
    description: 'Punchy product launch narrative showcasing the problem, solution, and early results.',
    tags: ['Product', 'Growth', 'Launch'],
    accentColor: 'lime',
    isFavorite: false,
    lastModified: Date.now() - 1000 * 60 * 60 * 48,
    content: `Craft a captivating product announcement thread for the launch of [Feature Name] on [Platform].

Key details:
- Product Name: [Product Name]
- Problem it solves: [User Frustration]
- How it works: [Core Mechanism]
- Unfair advantage vs alternatives: [Differentiator]
- Special Launch Incentive: [Launch Offer]

Write 5 punchy tweets/slides that hook the audience, break down the mechanics with bullet points, and drive traffic to [Sign Up URL].`,
    defaultValues: {
      'Feature Name': 'Instant Vector Search & Auto-Indexing',
      'Platform': 'X (Twitter) & LinkedIn',
      'Product Name': 'PulseBase Cloud',
      'User Frustration': 'waiting 45 minutes for embeddings to sync and index',
      'Core Mechanism': 'streaming in-memory vector quantization',
      'Differentiator': 'zero cold-start latency with 90% lower compute cost',
      'Launch Offer': 'Free 1,000,000 vector queries for the first 500 developers',
      'Sign Up URL': 'https://pulsebase.dev/early-access',
    },
  },
  {
    id: 'tpl-flux-cinematic',
    title: 'Photorealistic AI Visual Prompt',
    description: 'High-definition cinematic image generation prompt with camera, lighting, and mood variables.',
    tags: ['Design', 'Creative', 'Image Gen'],
    accentColor: 'blue',
    isFavorite: false,
    lastModified: Date.now() - 1000 * 60 * 60 * 72,
    content: `A cinematic 35mm editorial photograph of [Subject], situated in [Environment or Location].
Lighting: [Lighting Style] creating deep atmospheric volume.
Color Grading: [Color Palette] with subtle film grain and natural bloom.
Shot on: [Camera and Lens] at f/1.8, shallow depth of field.
Mood: [Atmosphere], high dynamic range, hyper-detailed textures, award-winning photography.`,
    defaultValues: {
      'Subject': 'a minimalist architectural glass pavilion surrounded by alpine mist and pine trees',
      'Environment or Location': 'the Swiss Alps near Lake Lucerne',
      'Lighting Style': 'golden hour dusk with soft diffused ambient glow through glass panels',
      'Color Palette': 'warm amber, deep slate blue, and emerald green undertones',
      'Camera and Lens': 'Hasselblad 500C with Zeiss 80mm f/2.8 Planar lens',
      'Atmosphere': 'serene, quiet luxury, peaceful contemplation',
    },
  },
];
