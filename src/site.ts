import JSZip from 'jszip';
import { fonts, type Block, type Project } from './model';

export function escapeHtml(value: string): string {
  const apos = String.fromCharCode(38, 35, 51, 57, 59);
  const lt = String.fromCharCode(38, 35, 54, 48, 59);
  const gt = String.fromCharCode(38, 35, 54, 50, 59);
  return value
    .replace(/&/g, '&')
    .replace(/</g, lt)
    .replace(/>/g, gt)
    .replace(/"/g, '"')
    .replace(/'/g, apos);
}

export function safeUrl(value: string, image = false): string {
  const clean = value.trim().replace(/[\u0000-\u0020\u007f]/g, '');
  if (/^(https?:|mailto:|tel:)/i.test(clean)) return value.trim();
  if (image && /^data:image\/(png|jpeg|gif|webp|svg\+xml)[;,]/i.test(clean)) return value.trim();
  if (!/^[a-z][a-z\d+.-]*:/i.test(clean) && !clean.startsWith('//') && !clean.startsWith('\\')) return value.trim() || (image ? '' : '#');
  return image ? '' : '#';
}

export function renderBlock(block: Block, editing = false): string {
  const c = block.content;
  const p = block.position;
  const s = block.style;
  const posStyle = `left:${p.x}px;top:${p.y}px;width:${p.width}px;height:${p.height}px;`;
  const style = [`--block-padding:${s.padding}px`, `text-align:${s.align}`, s.background ? `background:${s.background}` : '', s.color ? `color:${s.color}` : '', s.fontSize ? `font-size:${s.fontSize}px` : '', s.fontWeight ? `font-weight:${s.fontWeight}` : ''].filter(Boolean).join(';');
  const text = (key: string, tag = 'span', className = '') => `<${tag}${className ? ` class="${className}"` : ''}${editing ? ` data-field="${key}"` : ''}>${escapeHtml(c[key] || '').replace(/\n/g, '<br>')}</${tag}>`;
  const link = (key: string, urlKey: string, className = '') => `<a href="${escapeHtml(safeUrl(c[urlKey] || '#'))}"${className ? ` class="${className}"` : ''}>${text(key)}</a>`;
  const image = (key: string, altKey: string, className = '') => c[key] ? `<img src="${escapeHtml(safeUrl(c[key], true))}" alt="${escapeHtml(c[altKey] || '')}" class="${className}" loading="lazy" decoding="async">` : '';
  let body = '';
  switch (block.type) {
    case 'heading': body = `${text('text', 'h2')}`; break;
    case 'text': body = `${text('text', 'p')}`; break;
    case 'image': body = `<figure>${image('src', 'alt')}</figure>`; break;
    case 'button': body = `${link('label', 'url', 'site-button')}`; break;
    case 'divider': body = '<hr>'; break;
    case 'spacer': body = '<div aria-hidden="true"></div>'; break;
  }
  const tag = block.type === 'divider' ? 'hr' : block.type === 'spacer' ? 'div' : 'div';
  return `<${tag} id="${block.id}" class="site-block site-block-${block.type}" style="${posStyle}${style ? ';' + style : ''}">${body}</${tag}>`;
}

export const siteCss = `/* Estilos do seu site — criado no Ateliê. */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; }
.site-page {
  position: relative;
  background: var(--site-bg, #fff);
  color: var(--site-ink, #34304a);
  font-family: var(--site-font, 'Trebuchet MS', Arial, sans-serif);
  font-size: 16px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.site-page a { color: inherit; text-decoration: none; }
.site-page button { font: inherit; }
.site-page img { display: block; max-width: 100%; height: auto; }
.site-page h1, .site-page h2, .site-page h3, .site-page p { margin: 0; }
.site-page h2 { font-size: 32px; line-height: 1.2; letter-spacing: -1px; font-weight: 700; }
.site-page p { opacity: .76; }
.site-block {
  position: absolute;
  box-sizing: border-box;
  padding: var(--block-padding, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.site-block-heading { display: flex; }
.site-block-text { display: flex; }
.site-block-image { display: flex; }
.site-block-image figure { margin: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.site-block-image img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: var(--site-radius, 16px); }
.site-block-button { display: flex; }
.site-block-divider hr { margin: 0; border: 0; border-top: 2px solid var(--site-primary, #7055bb); }
.site-block-spacer { background: transparent; }
.site-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  padding: 12px 24px; min-height: 48px; border-radius: var(--site-radius, 16px);
  background: var(--site-primary, #7055bb); color: #fff;
  font-size: 16px; font-weight: 600; line-height: 1.5; border: none; cursor: pointer;
  transition: filter .2s, transform .2s;
}
.site-button:hover { filter: brightness(.92); transform: translateY(-2px); }
@media (max-width: 600px) {
  .site-page { font-size: 15px; }
  .site-page h2 { font-size: 26px; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { transition: none !important; }
}
`;

export const siteJs = `// Interações do site exportado - vazio para versão livre`;

function onPrimary(hex: string) {
  const rgb = hex.slice(1).match(/.{2}/g)!.map((part) => {
    const n = parseInt(part, 16) / 255;
    return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
  });
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? '#18221b' : '#ffffff';
}

export function themeVariables(project: Project): Record<string, string> {
  return { '--site-primary': project.theme.primary, '--site-on-primary': onPrimary(project.theme.primary), '--site-bg': project.theme.background, '--site-ink': project.theme.text, '--site-font': fonts[project.theme.font].value, '--site-radius': `${project.theme.radius}px` };
}

export function generateFiles(project: Project) {
  const css = `/* Personalize as cores, fontes e cantos do seu site aqui. */\n:root {\n${Object.entries(themeVariables(project)).map(([key, value]) => `  ${key}: ${value};`).join('\n')}\n}\n\n${siteCss}`;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(project.description)}">
  <meta name="theme-color" content="${project.theme.primary}">
  <title>${escapeHtml(project.name || 'Meu site')}</title>
  <link rel="stylesheet" href="./style.css">
  <script src="./script.js" defer></script>
</head>
<body>
  <main class="site-page" style="width:100%;min-height:100vh;">
${project.blocks.map((block) => `    <!-- ${block.type}: ${block.id} -->\n    ${renderBlock(block).replace(/\n/g, '\n    ')}`).join('\n\n')}
  </main>
</body>
</html>
`;
  return { 'index.html': html, 'style.css': css, 'script.js': siteJs };
}

export function previewDocument(project: Project): string {
  const css = `/* Personalize as cores, fontes e cantos do seu site aqui. */\n:root {\n${Object.entries(themeVariables(project)).map(([key, value]) => `  ${key}: ${value};`).join('\n')}\n}\n\n${siteCss}`;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(project.description)}">
  <meta name="theme-color" content="${project.theme.primary}">
  <title>${escapeHtml(project.name || 'Meu site')}</title>
  <link rel="stylesheet" href="./style.css">
  <script src="./script.js" defer></script>
</head>
<body>
  <main class="site-page" style="width:100%;min-height:100vh;">
${project.blocks.map((block) => `    <!-- ${block.type}: ${block.id} -->\n    ${renderBlock(block).replace(/\n/g, '\n    ')}`).join('\n\n')}
  </main>
</body>
</html>
`;
  return html.replace('<link rel="stylesheet" href="./style.css">', `<style>${css}</style>`).replace('<script src="./script.js" defer></script>', `<script type="module">${siteJs}</script>`);
}

export const publishGuide = `SEU SITE ESTÁ PRONTO! ✨
Criado com Ateliê

O QUE TEM AQUI
  index.html  — o conteúdo e a estrutura da página (posicionamento absoluto)
  style.css   — as cores, as fontes e os estilos
  script.js   — (vazio nesta versão)

As imagens enviadas do computador são incorporadas no HTML.
Imagens adicionadas por URL dependem de esse endereço continuar disponível.
Você pode abrir index.html no navegador. Não precisa instalar nada!

COMO PUBLICAR NO GITHUB PAGES
1. Entre em github.com e crie um repositório público.
2. Extraia este ZIP no seu computador.
3. No repositório, clique em Add file > Upload files.
4. Envie index.html, style.css e script.js para a raiz do repositório.
   Não envie o ZIP nem uma pasta contendo esses arquivos.
5. Clique em Commit changes.
6. Abra Settings > Pages.
7. Em Source, escolha Deploy from a branch.
8. Escolha a branch main, a pasta / (root) e clique em Save.
9. Aguarde a publicação. O endereço aparecerá nessa mesma página.
   Geralmente: https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/

PARA CONTINUAR EDITANDO NO ATELIÊ
O ZIP é o site final. Para guardar um projeto editável, clique em
"Guardar" no Ateliê. Depois, use "Abrir trabalho" para recuperar
esse arquivo .atelie.json.

Boas criações!
`;

export async function createSiteZip(project: Project): Promise<Blob> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(generateFiles(project))) zip.file(name, content);
  zip.file('LEIA-ME.txt', publishGuide);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function copyText(text: string): Promise<void> {
  if (!navigator.clipboard) throw new Error('Cópia indisponível neste navegador.');
  await navigator.clipboard.writeText(text);
}

export function projectSlug(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'meu-site';
}