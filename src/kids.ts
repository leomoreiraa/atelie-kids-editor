import { createBlock, type Block, type BlockType, type Project, type Theme } from './model';

const svgImage = (background: string, drawing: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="420" viewBox="0 0 1000 420"><rect width="1000" height="420" rx="30" fill="${background}"/>${drawing}</svg>`)}`;

export const pictures = [
  {
    name: 'Arco-íris',
    alt: 'Um arco-íris colorido entre nuvens, com um sol sorridente',
    src: svgImage('#eff7ff', `<circle cx="785" cy="100" r="46" fill="#ffd46f"/><path d="M769 104q16 20 32 0" fill="none" stroke="#946232" stroke-width="4" stroke-linecap="round"/><circle cx="772" cy="92" r="3" fill="#946232"/><circle cx="796" cy="92" r="3" fill="#946232"/><g fill="none" stroke-width="30"><path d="M267 337a233 233 0 0 1 466 0" stroke="#f6a7a8"/><path d="M298 337a202 202 0 0 1 404 0" stroke="#ffd885"/><path d="M329 337a171 171 0 0 1 342 0" stroke="#9bcbb3"/><path d="M360 337a140 140 0 0 1 280 0" stroke="#9ba9e6"/></g><g fill="#fff"><ellipse cx="260" cy="338" rx="126" ry="37"/><circle cx="218" cy="312" r="43"/><circle cx="285" cy="306" r="54"/><ellipse cx="743" cy="338" rx="126" ry="37"/><circle cx="710" cy="306" r="54"/><circle cx="777" cy="316" r="43"/></g><g fill="#ae9adb"><path d="m166 139 8 23 24 8-24 8-8 23-8-23-24-8 24-8Z"/><path d="m854 237 7 18 18 7-18 7-7 18-7-18-18-7 18-7Z"/></g><circle cx="132" cy="270" r="6" fill="#f6b69d"/><circle cx="870" cy="157" r="6" fill="#9fcdb9"/>`),
  },
  {
    name: 'Espaço',
    alt: 'Um foguete voando entre estrelas e planetas coloridos',
    src: svgImage('#ebe9fb', `<g fill="#b6a5db"><circle cx="135" cy="104" r="5"/><circle cx="362" cy="65" r="4"/><circle cx="685" cy="333" r="5"/><circle cx="876" cy="107" r="4"/><path d="m741 71 8 23 24 8-24 8-8 23-8-23-24-8 24-8Z"/><path d="m162 271 8 23 24 8-24 8-8 23-8-23-24-8 24-8Z"/></g><circle cx="242" cy="196" r="61" fill="#f5c46e"/><ellipse cx="242" cy="196" rx="91" ry="20" fill="none" stroke="#e6a86c" stroke-width="11" transform="rotate(-24 242 196)"/><circle cx="797" cy="266" r="53" fill="#92c8bc"/><circle cx="781" cy="249" r="14" fill="#acdace"/><g transform="rotate(27 505 208)"><path d="m472 283 33 97 32-97" fill="#f6c568"/><path d="m486 289 19 61 18-61" fill="#f6a170"/><path d="m463 224-39 72 51-12m70-60 39 72-51-12" fill="#9787d0"/><path d="M459 265V170q0-65 46-108 46 43 46 108v95q-46 36-92 0" fill="#fffdf8"/><path d="M465 135q13-42 40-73 27 31 40 73" fill="#f19a97"/><circle cx="505" cy="190" r="30" fill="#a2b8e9"/><circle cx="505" cy="190" r="20" fill="#dceafa"/><path d="M461 262q44 25 88 0v23h-88Z" fill="#9584cb"/></g>`),
  },
  {
    name: 'Natureza',
    alt: 'Montanhas verdes, árvores, flores e um sol amarelo',
    src: svgImage('#eaf5ee', `<circle cx="733" cy="99" r="46" fill="#f5cf75"/><path d="m110 344 190-245 181 245" fill="#a7c9b3"/><path d="m337 344 211-282 222 282" fill="#87b9a1"/><path d="m501 125 47-63 50 63-29-13-19 19-25-21Z" fill="#fffdf5"/><ellipse cx="506" cy="370" rx="468" ry="69" fill="#c5ddae"/><g stroke="#698f69" stroke-width="13" stroke-linecap="round"><path d="M190 340V202m615 136V187"/></g><g fill="#75a67c"><circle cx="190" cy="212" r="51"/><circle cx="190" cy="164" r="41"/><circle cx="804" cy="181" r="63"/><circle cx="804" cy="130" r="43"/></g><g stroke="#86a67b" stroke-width="5"><path d="M368 375v-35m278 43v-38"/></g><g fill="#eeaaa7"><circle cx="358" cy="334" r="12"/><circle cx="378" cy="334" r="12"/><circle cx="368" cy="321" r="12"/><circle cx="368" cy="344" r="12"/></g><g fill="#baa9dc"><circle cx="636" cy="341" r="12"/><circle cx="656" cy="341" r="12"/><circle cx="646" cy="327" r="12"/><circle cx="646" cy="352" r="12"/></g><circle cx="368" cy="334" r="8" fill="#ffe4a0"/><circle cx="646" cy="340" r="8" fill="#ffe4a0"/>`),
  },
];

export const kidPalettes = [
  { name: 'Roxo', primary: '#7055bb', background: '#ffffff', text: '#34304a', tint: '#eee8fa' },
  { name: 'Azul', primary: '#286c9b', background: '#f5fbff', text: '#243e50', tint: '#e2f2ff' },
  { name: 'Verde', primary: '#39744d', background: '#f7fcf6', text: '#294432', tint: '#e5f3df' },
  { name: 'Laranja', primary: '#a75428', background: '#fffbf3', text: '#543d30', tint: '#ffecd6' },
];

export const hueStops = [
  '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#7f00ff', '#ff0000'
];

export const simpleBlocks = [
  { type: 'heading', label: 'Título', hint: 'Letras bem grandes', color: 'purple' },
  { type: 'text', label: 'Texto', hint: 'Conte uma história', color: 'blue' },
  { type: 'image', label: 'Imagem', hint: 'Uma foto ou desenho', color: 'peach' },
  { type: 'button', label: 'Botão', hint: 'Um lugar para clicar', color: 'green' },
  { type: 'container', label: 'Linha', hint: 'Peças lado a lado', color: 'mint' },
] as const;

export const partName = (type: BlockType) => ({ heading: 'Título', text: 'Texto', image: 'Imagem', button: 'Botão', hero: 'Capa', navbar: 'Menu', features: 'Cartões', gallery: 'Imagens', faq: 'Perguntas', divider: 'Linha', spacer: 'Espaço', footer: 'Final da página', container: 'Linha' })[type];
export const partTitle = (block: Block) => `${partName(block.type)}: ${block.content.title || block.content.text || block.content.label || block.content.brand || block.content.alt || 'Minha criação'}`.slice(0, 65);

export function createKidBlock(type: BlockType): Block {
  const block = createBlock(type);
  if (type === 'heading') block.content = { text: 'Meu novo título', subtitle: '' };
  if (type === 'text') block.content = { title: '', text: 'Escreva aqui a sua ideia!' };
  if (type === 'image') block.content = { src: pictures[0].src, alt: pictures[0].alt, caption: '' };
  if (type === 'button') block.content = { label: 'Clique aqui!', url: '#' };
  if (type === 'container') block.content = { title: '', layout: 'grid-2' };
  block.style.padding = 24;
  block.style.align = 'center';
  block.style.layout = 'stack';
  block.style.gap = 12;
  return block;
}

export type Starter = 'rainbow' | 'space' | 'nature' | 'blank';
export const starters = [
  { id: 'rainbow', name: 'Meu mundo', title: 'Olá! Este é o meu mundo!', text: 'Eu gosto de aprender, brincar e inventar coisas. Aqui vou mostrar as minhas ideias!', picture: pictures[0], palette: kidPalettes[0] },
  { id: 'space', name: 'Uma viagem ao espaço', title: 'Vamos explorar o espaço?', text: 'Planetas, estrelas e muitas descobertas! Aqui vou contar o que aprendi sobre o universo.', picture: pictures[1], palette: kidPalettes[0] },
  { id: 'nature', name: 'Amo a natureza', title: 'A natureza é incrível!', text: 'Eu gosto dos animais, das plantas e de cuidar do nosso planeta. Vamos descobrir coisas juntos?', picture: pictures[2], palette: kidPalettes[2] },
] as const;

export function createKidProject(starter: Starter = 'rainbow'): Project {
  const template = starters.find((item) => item.id === starter) || starters[0];
  const blocks = starter === 'blank' ? [] : (['heading', 'image', 'text'] as const).map(createKidBlock);
  if (blocks.length) {
    blocks[0].id = 'inicio';
    blocks[0].content.text = template.title;
    blocks[0].content.subtitle = 'Um site feito por mim';
    blocks[0].style.padding = 40;
    blocks[1].content = { src: template.picture.src, alt: template.picture.alt, caption: '' };
    blocks[1].style.padding = 0;
    blocks[2].content = { title: 'Minhas ideias', text: template.text };
  }
  const { primary, background, text } = template.palette;
  const theme: Theme = { primary, background, text, font: 'modern', radius: 20, layout: 'stack', gap: 16 };
  return { version: 1, name: starter === 'blank' ? 'Meu novo site' : template.name, description: 'Um site criado com imaginação no Ateliê.', blocks, theme };
}

export function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hslTrianglePoint(h: number, s: number, l: number, size: number): { x: number; y: number } {
  const radius = size / 2;
  const triangleHeight = radius * Math.sqrt(3);
  const cxTri = radius;
  const cyTri = radius + (radius - triangleHeight / 2);
  const angle = (h / 360) * Math.PI * 2 - Math.PI / 2;
  const dist = s * (radius - 4);
  const x = cxTri + dist * Math.cos(angle);
  const y = cyTri + dist * Math.sin(angle) * (1 - l * 0.5);
  return { x, y };
}

export function trianglePointToHsl(x: number, y: number, size: number): { h: number; s: number; l: number } {
  const radius = size / 2;
  const triangleHeight = radius * Math.sqrt(3);
  const cxTri = radius;
  const cyTri = radius + (radius - triangleHeight / 2);
  const dx = x - cxTri;
  const dy = y - cyTri;
  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  let h = (angle / (Math.PI * 2)) * 360;
  if (h < 0) h += 360;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = radius - 4;
  const s = Math.min(dist / maxDist, 1);
  const l = 0.5;
  return { h, s, l };
}