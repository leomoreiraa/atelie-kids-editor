export type BlockType = 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer';
export type Alignment = 'left' | 'center' | 'right';

export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, string>;
  style: { background: string; color: string; padding: number; align: Alignment; fontSize?: number; fontWeight?: string };
  position: { x: number; y: number; width: number; height: number };
}

export interface Theme {
  primary: string;
  background: string;
  text: string;
  font: 'modern' | 'classic' | 'mono';
  radius: number;
}

export interface Project {
  version: 1;
  name: string;
  description: string;
  blocks: Block[];
  theme: Theme;
}

export interface Field {
  key: string;
  label: string;
  type?: 'textarea' | 'url' | 'image';
  placeholder?: string;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  fields: Field[];
  content: Record<string, string>;
}

const illustration = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="610" viewBox="0 0 640 610">
<rect x="47" y="43" width="550" height="525" rx="150" fill="#e8eddd"/>
<path d="M75 341a127 127 0 0 1 254 0v183H75Z" fill="#8b81bc"/>
<path d="M122 340a80 80 0 0 1 160 0v184H122Z" fill="#f7f4ec"/>
<path d="M347 359c-74-39-113-105-61-169 34-42 91-28 91 20 7-68 92-99 121-37 35 75-51 143-151 186" fill="#435b45"/>
<path d="m359 320 61-91M366 279l-36-35M386 269l54-5" stroke="#c9ddae" stroke-width="4" stroke-linecap="round"/>
<path d="M340 349h132l-20 175h-92Z" fill="#eeb89f"/>
<path d="M349 386h114M354 431h104M359 478h94" stroke="#d7957c" stroke-width="3"/>
<circle cx="164" cy="146" r="58" fill="#f1cc69"/>
<path d="m490 72 13 32 35-1-25 25 11 33-32-16-27 21 5-35-28-21 34-7Z" fill="#8d79c0"/>
<path d="M84 525h467" stroke="#435b45" stroke-width="3" stroke-linecap="round"/>
<path d="m533 393 8 22 23 7-23 8-8 22-8-22-23-8 23-7Z" fill="#435b45"/>
<circle cx="289" cy="91" r="7" fill="#435b45"/>
<path d="m43 240 10 10m0-10-10 10" stroke="#435b45" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export const defaultImage = `data:image/svg+xml,${encodeURIComponent(illustration)}`;

export const definitions: BlockDefinition[] = [
  { type: 'heading', label: 'Título', description: 'Um título grande', fields: [{ key: 'text', label: 'Título', type: 'textarea' }], content: { text: 'Meu título' } },
  { type: 'text', label: 'Texto', description: 'Um parágrafo de texto', fields: [{ key: 'text', label: 'Texto', type: 'textarea' }], content: { text: 'Escreva aqui...' } },
  { type: 'image', label: 'Imagem', description: 'Uma imagem ou foto', fields: [{ key: 'src', label: 'Imagem', type: 'image' }, { key: 'alt', label: 'Descrição', placeholder: 'Descreva a imagem' }], content: { src: defaultImage, alt: 'Minha imagem' } },
  { type: 'button', label: 'Botão', description: 'Um botão clicável', fields: [{ key: 'label', label: 'Texto do botão' }, { key: 'url', label: 'Link', type: 'url', placeholder: '# ou https://' }], content: { label: 'Clique aqui', url: '#' } },
  { type: 'divider', label: 'Linha', description: 'Uma linha divisória', fields: [], content: {} },
  { type: 'spacer', label: 'Espaço', description: 'Espaço vazio', fields: [], content: {} },
];

export const fonts = {
  modern: { label: 'Moderna', value: "'Trebuchet MS', Arial, sans-serif" },
  classic: { label: 'Editorial', value: "Georgia, 'Times New Roman', serif" },
  mono: { label: 'Criativa', value: "'Courier New', monospace" },
};

export const defaultTheme: Theme = { primary: '#7055bb', background: '#ffffff', text: '#34304a', font: 'modern', radius: 16 };
export const definitionFor = (type: BlockType) => definitions.find((item) => item.type === type)!;

export const createBlockId = () => `bloco-${Array.from(crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(16).padStart(8, '0')).join('')}`;

export function createBlock(type: BlockType, x = 50, y = 50): Block {
  const definition = definitionFor(type);
  const defaults: Record<BlockType, { w: number; h: number }> = {
    heading: { w: 400, h: 80 },
    text: { w: 400, h: 120 },
    image: { w: 300, h: 200 },
    button: { w: 180, h: 56 },
    divider: { w: 400, h: 20 },
    spacer: { w: 400, h: 60 },
  };
  const { w, h } = defaults[type];
  return {
    id: createBlockId(),
    type,
    content: { ...definition.content },
    style: { background: '', color: '', padding: 16, align: 'left', fontSize: type === 'heading' ? 32 : type === 'button' ? 16 : 16, fontWeight: type === 'heading' ? '700' : '400' },
    position: { x, y, width: w, height: h },
  };
}

export function createProject(blank = false): Project {
  const blocks = blank ? [] : [createBlock('heading', 60, 60), createBlock('text', 60, 180), createBlock('image', 60, 340)];
  return { version: 1, name: blank ? 'Meu novo site' : 'Meu primeiro site', description: 'Um site criado no Ateliê.', blocks, theme: { ...defaultTheme } };
}

export const STORAGE_KEY = 'atelie-project-v1';
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const isColor = (value: unknown): value is string => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);

export function parseProject(value: unknown): Project {
  if (!isObject(value) || value.version !== 1 || !Array.isArray(value.blocks) || value.blocks.length > 100 || !isObject(value.theme) || typeof value.name !== 'string') {
    throw new Error('Este arquivo não é um projeto válido do Ateliê.');
  }
  const theme = value.theme;
  if (!isColor(theme.primary) || !isColor(theme.background) || !isColor(theme.text) || !Object.hasOwn(fonts, String(theme.font)) || typeof theme.radius !== 'number' || !Number.isFinite(theme.radius)) {
    throw new Error('As configurações deste projeto são inválidas.');
  }
  const ids = new Set<string>();
  const blocks = value.blocks.map((raw) => {
    if (!isObject(raw) || typeof raw.type !== 'string' || !definitions.some((d) => d.type === raw.type) || !isObject(raw.content) || !isObject(raw.style) || typeof raw.id !== 'string' || !/^[a-zA-Z][\w-]{0,79}$/.test(raw.id) || ids.has(raw.id)) {
      throw new Error('O projeto contém um bloco inválido.');
    }
    ids.add(raw.id);
    const type = raw.type as BlockType;
    const content: Record<string, string> = { ...definitionFor(type).content };
    for (const key of Object.keys(content)) {
      if (typeof raw.content[key] === 'string') content[key] = raw.content[key];
    }
    const style = raw.style;
    const rawPosition = raw.position && typeof raw.position === 'object' ? raw.position : { x: 50, y: 50, width: 300, height: 100 };
    const position = rawPosition as { x: unknown; y: unknown; width: unknown; height: unknown };
    return {
      id: raw.id, type, content,
      style: {
        background: isColor(style.background) ? style.background : '',
        color: isColor(style.color) ? style.color : '',
        padding: typeof style.padding === 'number' && Number.isFinite(style.padding) ? Math.min(120, Math.max(0, style.padding)) : 16,
        align: (['left', 'center', 'right'].includes(String(style.align)) ? style.align : 'left') as Alignment,
        fontSize: typeof style.fontSize === 'number' ? style.fontSize : undefined,
        fontWeight: typeof style.fontWeight === 'string' ? style.fontWeight : undefined,
      },
      position: {
        x: typeof position.x === 'number' ? position.x : 50,
        y: typeof position.y === 'number' ? position.y : 50,
        width: typeof position.width === 'number' ? position.width : 300,
        height: typeof position.height === 'number' ? position.height : 100,
      },
    };
  });
  return {
    version: 1, name: value.name.slice(0, 100), description: typeof value.description === 'string' ? value.description.slice(0, 500) : '', blocks,
    theme: { primary: theme.primary, background: theme.background, text: theme.text, font: theme.font as Theme['font'], radius: Math.min(32, Math.max(0, theme.radius)) },
  };
}