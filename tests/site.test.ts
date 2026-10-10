import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { createBlock, createProject, parseProject } from '../src/model';
import { createSiteZip, generateFiles, previewDocument, renderBlock, safeUrl } from '../src/site';

describe('arquivos exportados', () => {
  it('gera um ZIP independente com referências relativas para GitHub Pages', async () => {
    const blob = await createSiteZip(createProject());
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual(['LEIA-ME.txt', 'index.html', 'script.js', 'style.css']);
    const html = await zip.file('index.html')!.async('string');
    expect(html).toContain('href="./style.css"');
    expect(html).toContain('src="./script.js"');
    expect(html).toContain('lang="pt-BR"');
    expect(html).not.toContain('data-field');
    expect(html).not.toContain('localhost');
    expect(html).not.toContain('node_modules');
    expect(html).toContain('data:image/svg+xml');
  });

  it('mantém o texto de alunos como texto, inclusive aspas e tags HTML', () => {
    const project = createProject();
    project.name = '<script>alert("x")</script>';
    project.description = 'Teste "conteúdo" <novo>';
    project.blocks[1].content.title = '<img src=x onerror=alert(1)> & ideias';
    const html = generateFiles(project)['index.html'];
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt; &amp; ideias');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('Teste &quot;conteúdo&quot; &lt;novo&gt;');
  });

  it('mantém links úteis e impede protocolos executáveis', () => {
    expect(safeUrl('#sobre')).toBe('#sobre');
    expect(safeUrl('mailto:ola@exemplo.com')).toBe('mailto:ola@exemplo.com');
    expect(safeUrl('./projetos.html')).toBe('./projetos.html');
    expect(safeUrl('https://example.org')).toBe('https://example.org');
    expect(safeUrl('javascript:alert(1)')).toBe('#');
    expect(safeUrl('java\nscript:alert(1)')).toBe('#');
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    const block = createBlock('button');
    block.content.url = 'javascript:alert(1)';
    expect(renderBlock(block)).toContain('href="#"');
  });

  it('incorpora CSS e JS na prévia, preservando navegação e responsividade', () => {
    const html = previewDocument(createProject());
    expect(html).toContain('<style>');
    expect(html).toContain('<script type="module">');
    expect(html).not.toContain('href="./style.css"');
    expect(html).not.toContain('src="./script.js"');
    expect(html).toContain('@container site (max-width: 520px)');
    expect(html).toContain('aria-controls="nav-menu"');
  });
});

describe('projetos portáteis', () => {
  it('faz o ciclo JSON sem perder imagens, estilos ou ordem dos blocos', () => {
    const project = createProject();
    project.blocks.push(createBlock('gallery'));
    project.theme.primary = '#a4523c';
    expect(parseProject(JSON.parse(JSON.stringify(project)))).toEqual(project);
  });

  it('rejeita IDs duplicados e conteúdo estrutural inválido', () => {
    const project = createProject();
    project.blocks[1].id = project.blocks[0].id;
    expect(() => parseProject(project)).toThrow();
    expect(() => parseProject({ version: 1, blocks: [], theme: {} })).toThrow();
    const invalid = createProject();
    invalid.theme.primary = 'red; } body { display:none }';
    expect(() => parseProject(invalid)).toThrow();
  });
});
