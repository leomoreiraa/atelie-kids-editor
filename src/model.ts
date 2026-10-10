export type BlockType = 'navbar' | 'hero' | 'heading' | 'text' | 'image' | 'button' | 'features' | 'gallery' | 'faq' | 'divider' | 'spacer' | 'footer' | 'container';
export type LayoutType = 'stack' | 'grid-2' | 'grid-3';
export type Alignment = 'left' | 'center' | 'right';

export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, string>;
  style: { background: string; color: string; padding: number; align: Alignment; layout: LayoutType; gap: number };
  children?: string[];
}

export interface Theme {
  primary: string;
  background: string;
  text: string;
  font: 'modern' | 'classic' | 'mono';
  radius: number;
  layout: LayoutType;
  gap: number;
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
  group: 'essential' | 'section';
  fields: Field[];
  content: Record<string, string>;
  padding: number;
  defaultLayout?: LayoutType;
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
const galleryImage = (bg: string, shape: string, accent: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="${bg}"/><circle cx="330" cy="220" r="138" fill="${shape}"/><path d="M120 350V205a90 90 0 0 1 180 0v145Z" fill="${accent}"/><path d="m418 73 12 34 36 11-36 12-12 34-12-34-35-12 35-11Z" fill="${accent}"/></svg>`)}`;

export const definitions: BlockDefinition[] = [
  { type: 'heading', label: 'Título', description: 'Uma ideia em destaque', group: 'essential', padding: 24, content: { text: 'Uma nova ideia começa aqui', subtitle: '' }, fields: [{ key: 'text', label: 'Título', type: 'textarea' }, { key: 'subtitle', label: 'Subtítulo' }] },
  { type: 'text', label: 'Texto', description: 'Conte a sua história', group: 'essential', padding: 40, content: { title: 'Um pouco sobre mim', text: 'Sou uma pessoa curiosa, cheia de ideias e sempre pronta para aprender algo novo. Aqui, compartilho um pouco do que estou criando e descobrindo pelo caminho.' }, fields: [{ key: 'title', label: 'Título' }, { key: 'text', label: 'Parágrafo', type: 'textarea' }] },
  { type: 'image', label: 'Imagem', description: 'Mostre, inspire, imagine', group: 'essential', padding: 24, content: { src: defaultImage, alt: 'Ilustração de formas geométricas e uma planta', caption: '' }, fields: [{ key: 'src', label: 'Imagem', type: 'image' }, { key: 'alt', label: 'Descrição da imagem', placeholder: 'Descreva para quem não pode vê-la' }, { key: 'caption', label: 'Legenda' }] },
  { type: 'button', label: 'Botão', description: 'Convide para uma ação', group: 'essential', padding: 24, content: { label: 'Vamos conversar', url: 'mailto:ola@exemplo.com' }, fields: [{ key: 'label', label: 'Texto do botão' }, { key: 'url', label: 'Destino do link', type: 'url', placeholder: 'https://, mailto: ou #seção' }] },
  { type: 'divider', label: 'Divisor', description: 'Uma pausa entre ideias', group: 'essential', padding: 20, content: {}, fields: [] },
  { type: 'spacer', label: 'Espaço', description: 'Deixe o layout respirar', group: 'essential', padding: 40, content: {}, fields: [] },
  { type: 'navbar', label: 'Menu', description: 'O começo da navegação', group: 'section', padding: 20, content: { brand: 'aurora.', link1: 'Sobre mim', url1: '#sobre', link2: 'Projetos', url2: '#projetos', button: 'Vamos conversar', buttonUrl: '#contato' }, fields: [{ key: 'brand', label: 'Nome ou marca' }, { key: 'link1', label: 'Primeiro link' }, { key: 'url1', label: 'Destino do primeiro link', type: 'url' }, { key: 'link2', label: 'Segundo link' }, { key: 'url2', label: 'Destino do segundo link', type: 'url' }, { key: 'button', label: 'Texto do botão' }, { key: 'buttonUrl', label: 'Destino do botão', type: 'url' }] },
  { type: 'hero', label: 'Capa', description: 'Uma boa primeira impressão', group: 'section', padding: 64, content: { eyebrow: 'UM ESPAÇO PARA CRIAR E COMPARTILHAR', title: 'Ideias que merecem ganhar o mundo.', text: 'Olá! Este é o meu cantinho na internet. Um lugar para transformar curiosidade em projetos e compartilhar o que me inspira.', buttonLabel: 'Conheça meus projetos', buttonUrl: '#projetos', image: defaultImage, alt: 'Composição criativa com arco, sol e planta' }, fields: [{ key: 'eyebrow', label: 'Texto de destaque' }, { key: 'title', label: 'Título principal', type: 'textarea' }, { key: 'text', label: 'Descrição', type: 'textarea' }, { key: 'buttonLabel', label: 'Texto do botão' }, { key: 'buttonUrl', label: 'Destino do botão', type: 'url' }, { key: 'image', label: 'Imagem de capa', type: 'image' }, { key: 'alt', label: 'Descrição da imagem' }] },
  { type: 'features', label: 'Cartões', description: 'Três coisas para destacar', group: 'section', padding: 56, defaultLayout: 'grid-3', content: { title: 'Um pouco do que eu crio', subtitle: 'Explorando possibilidades, um projeto de cada vez.', title1: 'Design com propósito', text1: 'Cores, formas e ideias que se conectam para contar uma boa história.', title2: 'Aprender fazendo', text2: 'Cada desafio é uma oportunidade de experimentar algo diferente.', title3: 'Ideias em movimento', text3: 'Projetos que saem do papel e encontram seu lugar no mundo.' }, fields: [{ key: 'title', label: 'Título da seção' }, { key: 'subtitle', label: 'Subtítulo' }, ...[1, 2, 3].flatMap((n) => [{ key: `title${n}`, label: `Cartão ${n} · título` }, { key: `text${n}`, label: `Cartão ${n} · descrição`, type: 'textarea' as const }])] },
  { type: 'gallery', label: 'Galeria', description: 'Uma coleção de inspirações', group: 'section', padding: 48, defaultLayout: 'grid-3', content: { title: 'Meu mural de inspirações', image1: galleryImage('#eee8db', '#b0bb95', '#766699'), alt1: 'Composição abstrata em verde e roxo', image2: galleryImage('#eedcce', '#d39472', '#f3cc6d'), alt2: 'Composição abstrata em tons quentes', image3: galleryImage('#e0e8e2', '#849f91', '#eac6ae'), alt3: 'Composição abstrata em verde e pêssego' }, fields: [{ key: 'title', label: 'Título' }, ...[1, 2, 3].flatMap((n) => [{ key: `image${n}`, label: `Imagem ${n}`, type: 'image' as const }, { key: `alt${n}`, label: `Descrição da imagem ${n}` }])] },
  { type: 'faq', label: 'Perguntas', description: 'Respostas com um clique', group: 'section', padding: 48, content: { title: 'Talvez você queira saber', question1: 'O que eu estou aprendendo?', answer1: 'Estou explorando o universo da criação de sites, do design e de tudo que envolve dar vida a uma ideia.', question2: 'Como podemos criar algo juntos?', answer2: 'Entre em contato! Estou sempre aberto a novas ideias e colaborações.', question3: 'Qual é o próximo projeto?', answer3: 'Tem muita coisa boa a caminho. Acompanhe este espaço para descobrir as novidades!' }, fields: [{ key: 'title', label: 'Título' }, ...[1, 2, 3].flatMap((n) => [{ key: `question${n}`, label: `Pergunta ${n}` }, { key: `answer${n}`, label: `Resposta ${n}`, type: 'textarea' as const }])] },
  { type: 'footer', label: 'Rodapé', description: 'Termine com a sua assinatura', group: 'section', padding: 32, content: { brand: 'aurora.', text: 'Feito com curiosidade e um pouco de criatividade.', link: 'Diga um olá ↗', url: 'mailto:ola@exemplo.com' }, fields: [{ key: 'brand', label: 'Nome ou marca' }, { key: 'text', label: 'Mensagem' }, { key: 'link', label: 'Texto do link' }, { key: 'url', label: 'Destino do link', type: 'url' }] },
  { type: 'container', label: 'Linha', description: 'Duas ou três peças lado a lado', group: 'section', padding: 24, defaultLayout: 'grid-2', content: { title: '', layout: 'grid-2' }, fields: [{ key: 'title', label: 'Título da linha (opcional)' }, { key: 'layout', label: 'Colunas', type: 'url', placeholder: 'grid-2 ou grid-3' }] },
];

export const fonts = {
  modern: { label: 'Moderna', value: "'Trebuchet MS', Arial, sans-serif" },
  classic: { label: 'Editorial', value: "Georgia, 'Times New Roman', serif" },
  mono: { label: 'Criativa', value: "'Courier New', monospace" },
};

export const defaultTheme: Theme = { primary: '#435b45', background: '#ffffff', text: '#29382c', font: 'modern', radius: 12, layout: 'stack', gap: 16 };
export const definitionFor = (type: BlockType) => definitions.find((item) => item.type === type)!;

export const createBlockId = () => `bloco-${Array.from(crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(16).padStart(8, '0')).join('')}`;

export function createBlock(type: BlockType): Block {
  const definition = definitionFor(type);
  return {
    id: createBlockId(),
    type,
    content: { ...definition.content },
    style: { background: type === 'hero' ? '#f6f4ed' : type === 'footer' ? '#f2f4ee' : '', color: '', padding: definition.padding, align: 'center', layout: definition.defaultLayout || 'stack', gap: 16 },
    children: type === 'container' ? [] : undefined,
  };
}

export function createProject(blank = false): Project {
  const blocks = blank ? [] : (['navbar', 'hero', 'features', 'text', 'footer'] as BlockType[]).map(createBlock);
  const ids = ['menu', 'inicio', 'projetos', 'sobre', 'contato'];
  blocks.forEach((block, i) => { block.id = ids[i]; });
  return { version: 1, name: blank ? 'Meu novo site' : 'Meu primeiro site', description: 'Um espaço para compartilhar minhas ideias, projetos e inspirações.', blocks, theme: { ...defaultTheme } };
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
    const children = Array.isArray(raw.children) ? raw.children.filter((id) => typeof id === 'string' && /^[a-zA-Z][\w-]{0,79}$/.test(id)) : undefined;
    return {
      id: raw.id, type, content,
      style: {
        background: isColor(style.background) ? style.background : '',
        color: isColor(style.color) ? style.color : '',
        padding: typeof style.padding === 'number' && Number.isFinite(style.padding) ? Math.min(120, Math.max(0, style.padding)) : 32,
        align: (['left', 'center', 'right'].includes(String(style.align)) ? style.align : 'left') as Alignment,
        layout: (['stack', 'grid-2', 'grid-3'].includes(String(style.layout)) ? style.layout : 'stack') as LayoutType,
        gap: typeof style.gap === 'number' && Number.isFinite(style.gap) ? Math.min(48, Math.max(0, style.gap)) : 16,
      },
      children,
    };
  });
  return {
    version: 1, name: value.name.slice(0, 100), description: typeof value.description === 'string' ? value.description.slice(0, 500) : '', blocks,
    theme: { primary: theme.primary, background: theme.background, text: theme.text, font: theme.font as Theme['font'], radius: Math.min(32, Math.max(0, theme.radius)), layout: (['stack', 'grid-2', 'grid-3'].includes(String(theme.layout)) ? theme.layout : 'stack') as LayoutType, gap: typeof theme.gap === 'number' && Number.isFinite(theme.gap) ? Math.min(48, Math.max(0, theme.gap)) : 16 },
  };
}