import JSZip from 'jszip';
import { fonts, type Block, type Project } from './model';

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export function safeUrl(value: string, image = false): string {
  const clean = value.trim().replace(/[\u0000-\u0020\u007f]/g, '');
  if (/^(https?:|mailto:|tel:)/i.test(clean)) return value.trim();
  if (image && /^data:image\/(png|jpeg|gif|webp|svg\+xml)[;,]/i.test(clean)) return value.trim();
  if (!/^[a-z][a-z\d+.-]*:/i.test(clean) && !clean.startsWith('//') && !clean.startsWith('\\')) return value.trim() || (image ? '' : '#');
  return image ? '' : '#';
}

export function renderBlock(block: Block, editing = false, allBlocks?: Map<string, Block>): string {
  const c = block.content;
  const text = (key: string, tag = 'span', className = '') => `<${tag}${className ? ` class="${className}"` : ''}${editing ? ` data-field="${key}"` : ''}>${escapeHtml(c[key] || '').replace(/\n/g, '<br>')}</${tag}>`;
  const link = (key: string, urlKey: string, className = '') => `<a href="${escapeHtml(safeUrl(c[urlKey] || '#'))}"${className ? ` class="${className}"` : ''}>${text(key)}</a>`;
  const image = (key: string, altKey: string, className = '') => c[key] ? `<img src="${escapeHtml(safeUrl(c[key], true))}" alt="${escapeHtml(c[altKey] || '')}" class="${className}" loading="lazy" decoding="async">` : '';
  let body = '';
  switch (block.type) {
    case 'navbar':
      body = `<nav class="site-container site-nav" aria-label="Navegação principal">
  <a class="site-brand" href="#"><span class="site-brand-mark" aria-hidden="true">✳</span>${text('brand')}</a>
  <button class="site-menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-${block.id}"><span></span><span></span><span></span></button>
  <div class="site-nav-links" id="nav-${block.id}">${link('link1', 'url1')}${link('link2', 'url2')}${link('button', 'buttonUrl', 'site-button site-button-outline')}</div>
</nav>`;
      break;
    case 'hero':
      body = `<div class="site-container site-hero${c.image ? '' : ' site-hero-text-only'}">
  <div class="site-hero-copy">${c.eyebrow ? `<div class="site-eyebrow"><span aria-hidden="true"></span>${text('eyebrow')}</div>` : ''}
    ${text('title', 'h1')}${text('text', 'p', 'site-lead')}
    ${c.buttonLabel ? `<a class="site-button" href="${escapeHtml(safeUrl(c.buttonUrl))}">${text('buttonLabel')}<span aria-hidden="true">↗</span></a>` : ''}
  </div>
  ${c.image ? `<div class="site-hero-art">${image('image', 'alt')}<div class="site-art-label"><span aria-hidden="true">✦</span> feito de possibilidades</div></div>` : ''}
</div>`;
      break;
    case 'heading':
      body = `<div class="site-container">${text('text', 'h2')}${c.subtitle ? text('subtitle', 'p', 'site-lead') : ''}</div>`;
      break;
    case 'text':
      body = `<div class="site-container site-text">${c.title ? text('title', 'h2') : ''}${text('text', 'p', 'site-lead')}</div>`;
      break;
    case 'image':
      body = `<figure class="site-container site-image">${image('src', 'alt')}${c.caption ? text('caption', 'figcaption') : ''}</figure>`;
      break;
    case 'button':
      body = `<div class="site-container">${link('label', 'url', 'site-button')}</div>`;
      break;
    case 'features':
      body = `<div class="site-container"><div class="site-section-heading">${text('title', 'h2')}${text('subtitle', 'p')}</div><div class="site-cards">${[1, 2, 3].map((n) => `<article class="site-card"><div class="site-card-icon site-card-icon-${n}" aria-hidden="true">${['✳', '↗', '✧'][n - 1]}</div>${text(`title${n}`, 'h3')}${text(`text${n}`, 'p')}</article>`).join('')}</div></div>`;
      break;
    case 'gallery':
      body = `<div class="site-container">${text('title', 'h2', 'site-gallery-heading')}<div class="site-gallery">${[1, 2, 3].map((n) => image(`image${n}`, `alt${n}`)).join('')}</div></div>`;
      break;
    case 'faq':
      body = `<div class="site-container site-faq">${text('title', 'h2')}${[1, 2, 3].map((n) => `<details><summary>${text(`question${n}`)}<span class="site-faq-plus" aria-hidden="true">+</span></summary>${text(`answer${n}`, 'p')}</details>`).join('')}</div>`;
      break;
    case 'divider': body = '<div class="site-container"><hr></div>'; break;
    case 'spacer': body = '<div class="site-container" aria-hidden="true"></div>'; break;
    case 'footer':
      body = `<div class="site-container site-footer"><div>${text('brand', 'strong', 'site-brand')}${text('text', 'p')}</div>${link('link', 'url')}</div>`;
      break;
    case 'container':
      const children = block.children || [];
      const childBlocks = children.map((id) => allBlocks?.get(id)).filter(Boolean) as Block[];
      const childHtml = childBlocks.map((child) => renderBlock(child, editing, allBlocks)).join('\n');
      const childContainerClass = block.style.layout !== 'stack' ? `site-block-grid ${block.style.layout}` : '';
      body = `<div class="site-container site-container-children ${childContainerClass}" style="--block-gap:${block.style.gap}px">${c.title ? `<div class="site-section-heading">${text('title', 'h2')}</div>` : ''}<div class="site-container-grid">${childHtml}</div></div>`;
      break;
  }
  const style = [`--block-space:${block.style.padding}px`, `text-align:${block.style.align}`, block.style.background ? `background:${block.style.background}` : '', block.style.color ? `color:${block.style.color}` : '', `--block-layout:${block.style.layout}`, `--block-gap:${block.style.gap}px`].filter(Boolean).join(';');
  const layoutClass = block.type === 'container' ? '' : (block.style.layout !== 'stack' ? `site-block-grid ${block.style.layout}` : '');
  const tag = block.type === 'footer' ? 'footer' : block.type === 'navbar' ? 'header' : 'section';
  return `<${tag} id="${block.id}" class="site-block site-block-${block.type} ${layoutClass}" style="${style}">\n${body}\n</${tag}>`;
}

export const siteCss = `/* Estilos do seu site — criado no Ateliê. */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; }
.site-page {
  container-type: inline-size;
  container-name: site;
  background: var(--site-bg, #fff);
  color: var(--site-ink, #29382c);
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
.site-page h1 { font-size: clamp(36px, 5.2cqi, 61px); line-height: 1.08; letter-spacing: -2.8px; font-weight: 700; }
.site-page h2 { font-size: 32px; line-height: 1.2; letter-spacing: -1px; }
.site-page h3 { font-size: 19px; line-height: 1.35; letter-spacing: -.35px; }
.site-page p { opacity: .76; }
.site-block { padding-block: var(--block-space, 32px); }
.site-container { width: 100%; max-width: 1180px; margin-inline: auto; padding-inline: 56px; }
.site-page .site-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 24px;
  padding: 13px 23px; min-height: 48px; border-radius: var(--site-radius, 12px);
  background: var(--site-primary, #435b45); color: var(--site-on-primary, #fff);
  font-size: 14px; font-weight: 600; line-height: 1.5; border: 1px solid transparent;
  transition: filter .2s, transform .2s;
}
.site-page .site-button:hover { filter: brightness(.92); transform: translateY(-2px); }
.site-page .site-button-outline { background: transparent; border-color: currentColor; color: inherit; padding: 9px 18px; min-height: 40px; }
.site-nav { display: flex; align-items: center; justify-content: space-between; gap: 24px; position: relative; }
.site-brand { display: inline-flex; align-items: center; gap: 9px; font-size: 28px; font-weight: 700; letter-spacing: -1.5px; line-height: 1.2; }
.site-brand-mark { font-size: 33px; color: var(--site-primary); }
.site-nav-links { display: flex; align-items: center; gap: 30px; font-size: 13px; font-weight: 500; }
.site-nav-links a:not(.site-button):hover, .site-footer a:hover { text-decoration: underline; text-underline-offset: 5px; }
.site-menu-toggle { display: none; background: transparent; border: 1px solid currentColor; border-radius: 6px; padding: 9px; cursor: pointer; color: inherit; }
.site-menu-toggle span { display: block; width: 20px; height: 2px; margin: 4px 0; background: currentColor; }
.site-hero { display: grid; grid-template-columns: 1.04fr 1fr; gap: 22px; align-items: center; }
.site-hero-text-only { display: block; max-width: 900px; }
.site-eyebrow { display: flex; align-items: center; gap: 8px; font-size: 9px; letter-spacing: 1.45px; font-weight: 700; margin-bottom: 24px; }
.site-eyebrow > span:first-child { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.site-hero .site-lead { font-size: 15px; max-width: 410px; margin-top: 24px; line-height: 1.8; }
.site-hero .site-button { margin-top: 30px; }
.site-hero-art { position: relative; }
.site-hero-art img { width: 100%; border-radius: var(--site-radius); aspect-ratio: 640 / 610; object-fit: cover; }
.site-art-label { position: absolute; right: 22px; bottom: 6px; transform: rotate(-7deg); padding: 8px 15px; background: #fffdf7; box-shadow: 0 3px 14px #29382c0d; border: 1px solid #eae6db; border-radius: 5px; font-size: 11px; letter-spacing: .1px; color: #435b45; }
.site-art-label span { margin-right: 6px; color: #8b76b4; }
.site-section-heading { margin-bottom: 28px; }
.site-section-heading p { margin-top: 9px; font-size: 14px; }
.site-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.site-card { padding: 26px 24px; border: 1px solid #88888825; border-radius: var(--site-radius); }
.site-card-icon { width: 42px; height: 42px; display: grid; place-items: center; font-size: 28px; border-radius: 12px; margin-bottom: 22px; line-height: 1; }
.site-card-icon-1 { background: #eee8f4; color: #8b73a8; }
.site-card-icon-2 { background: #eef0df; color: #637a41; }
.site-card-icon-3 { background: #faf0de; color: #ad8240; }
.site-card p { margin-top: 10px; font-size: 13px; line-height: 1.8; }
.site-text .site-lead { max-width: 800px; font-size: 17px; margin-top: 18px; }
.site-block[style*="text-align:center"] .site-lead { margin-inline: auto; }
.site-block[style*="text-align:center"] .site-eyebrow { justify-content: center; }
.site-block[style*="text-align:center"] .site-card-icon { margin-inline: auto; }
.site-block[style*="text-align:right"] .site-lead { margin-left: auto; }
.site-block[style*="text-align:right"] .site-eyebrow { justify-content: flex-end; }
.site-block[style*="text-align:right"] .site-card-icon { margin-left: auto; }
.site-image { margin-block: 0; }
.site-image img { width: 100%; max-height: 580px; object-fit: cover; border-radius: var(--site-radius); }
.site-image figcaption { font-size: 13px; opacity: .65; padding-top: 12px; }
.site-gallery-heading { margin-bottom: 28px !important; }
.site-gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.site-gallery img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--site-radius); }
.site-block-grid { display: grid; gap: var(--block-gap, 16px); }
.site-block-grid.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.site-block-grid.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.site-block-grid.stack { display: block; }
.site-block-grid > * { min-width: 0; }
.site-faq h2 { margin-bottom: 26px; }
.site-faq details { border-bottom: 1px solid #88888830; }
.site-faq summary { display: flex; justify-content: space-between; align-items: center; gap: 16px; cursor: pointer; padding: 21px 0; font-weight: 600; list-style: none; }
.site-faq summary::-webkit-details-marker { display: none; }
.site-faq-plus { font-size: 25px; font-weight: 400; transition: transform .2s; }
.site-faq details[open] .site-faq-plus { transform: rotate(45deg); }
.site-faq details p { padding: 0 32px 23px 0; font-size: 15px; }
.site-page hr { margin: 0; border: 0; border-top: 1px solid #88888835; }
.site-footer { display: flex; justify-content: space-between; gap: 30px; align-items: center; }
.site-footer .site-brand { font-size: 24px; }
.site-footer p { margin-top: 8px; font-size: 12px; }
.site-footer a { font-size: 13px; font-weight: 600; }
.site-page :focus-visible { outline: 3px solid var(--site-primary); outline-offset: 5px; }
@container site (max-width: 720px) {
  .site-container { padding-inline: 28px; }
  .site-hero { gap: 10px; }
  .site-page h1 { font-size: 40px; letter-spacing: -1.5px; }
  .site-page h2 { font-size: 27px; }
  .site-eyebrow { font-size: 8px; letter-spacing: .8px; }
  .site-cards { gap: 12px; }
  .site-card { padding: 20px 16px; }
  .site-card h3 { font-size: 17px; }
  .site-nav-links { gap: 16px; }
  .site-nav-links .site-button { padding-inline: 12px; font-size: 11px; }
}
@container site (max-width: 520px) {
  .site-container { padding-inline: 24px; }
  .site-block { padding-block: min(var(--block-space, 32px), 44px); }
  .site-block-spacer { padding-block: var(--block-space); }
  .site-page h1 { font-size: 43px; letter-spacing: -1.8px; }
  .site-page h2 { font-size: 28px; }
  .site-hero { grid-template-columns: 1fr; gap: 28px; }
  .site-hero-art { max-width: 340px; margin: auto; }
  .site-hero .site-lead { font-size: 15px; }
  .site-eyebrow { font-size: 8px; margin-bottom: 20px; }
  .site-cards, .site-gallery { grid-template-columns: 1fr; }
  .site-block-grid.grid-2, .site-block-grid.grid-3 { grid-template-columns: 1fr; }
  .site-card { padding: 25px; }
  .site-card h3 { font-size: 20px; }
  .site-card p { font-size: 15px; }
  .site-footer { align-items: flex-start; flex-direction: column; gap: 20px; }
  .site-brand { font-size: 25px; }
  .site-menu-toggle { display: block; }
  .site-nav-links { display: none; position: absolute; z-index: 5; top: calc(100% + 14px); left: 16px; right: 16px; flex-direction: column; align-items: stretch; padding: 20px; background: var(--site-bg); color: var(--site-ink); border: 1px solid #88888830; border-radius: var(--site-radius); box-shadow: 0 10px 20px #0000000c; }
  .site-nav-links.is-open { display: flex; }
  .site-nav-links .site-button { font-size: 13px; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .site-page *, .site-page *::before, .site-page *::after { transition: none !important; }
}
`;

export const siteJs = `// Interações do seu site. Sem bibliotecas, pronto para o GitHub Pages.

// Abre e fecha o menu em telas pequenas.
document.querySelectorAll('.site-menu-toggle').forEach((button) => {
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  if (!menu) return;
  const closeMenu = () => {
    button.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  };
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    menu.classList.toggle('is-open', !isOpen);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      button.focus();
    }
  });
});

// Mantém apenas uma resposta aberta em cada seção de perguntas.
document.querySelectorAll('.site-faq').forEach((section) => {
  const questions = section.querySelectorAll('details');
  questions.forEach((question) => {
    question.addEventListener('toggle', () => {
      if (question.open) {
        questions.forEach((other) => {
          if (other !== question) other.open = false;
        });
      }
    });
  });
});
`;

function onPrimary(hex: string) {
  const rgb = hex.slice(1).match(/.{2}/g)!.map((part) => {
    const n = parseInt(part, 16) / 255;
    return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
  });
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? '#18221b' : '#ffffff';
}

export function themeVariables(project: Project): Record<string, string> {
  return { 
    '--site-primary': project.theme.primary, 
    '--site-on-primary': onPrimary(project.theme.primary), 
    '--site-bg': project.theme.background, 
    '--site-ink': project.theme.text, 
    '--site-font': fonts[project.theme.font].value, 
    '--site-radius': `${project.theme.radius}px`,
    '--site-layout': project.theme.layout,
    '--site-gap': `${project.theme.gap}px`
  };
}

export function generateFiles(project: Project) {
  const blocksMap = new Map(project.blocks.map((b) => [b.id, b]));
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
  <main class="site-page">
${project.blocks.map((block) => `    <!-- ${block.type}: ${block.id} -->\n    ${renderBlock(block, false, blocksMap).replace(/\n/g, '\n    ')}`).join('\n\n')}
  </main>
</body>
</html>
`;
  return { 'index.html': html, 'style.css': css, 'script.js': siteJs };
}

export function previewDocument(project: Project): string {
  const blocksMap = new Map(project.blocks.map((b) => [b.id, b]));
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
  <main class="site-page">
${project.blocks.map((block) => `    <!-- ${block.type}: ${block.id} -->\n    ${renderBlock(block, false, blocksMap).replace(/\n/g, '\n    ')}`).join('\n\n')}
  </main>
</body>
</html>
`;
  // Em um iframe srcdoc, fragmentos herdariam o endereço do editor.
  const previewLinks = `
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href.startsWith('#')) {
    event.preventDefault();
    if (href === '#') { window.scrollTo({ top: 0 }); return; }
    try { document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView(); } catch {}
  } else {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
});`;
  return html.replace('<link rel="stylesheet" href="./style.css">', `<style>${css}</style>`).replace('<script src="./script.js" defer></script>', `<script type="module">${siteJs}\n${previewLinks}</script>`);
}

export const publishGuide = `SEU SITE ESTÁ PRONTO! ✨
Criado com Ateliê

O QUE TEM AQUI
  index.html  — o conteúdo e a estrutura da página
  style.css   — as cores, as fontes e o layout
  script.js   — o menu mobile e as perguntas interativas

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
