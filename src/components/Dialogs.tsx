import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowUpRight, Check, ChevronRight, Code2, Copy, Download, ExternalLink, FileCode2, FileJson, FolderOpen, Github, GraduationCap, LoaderCircle, Monitor, MousePointer2, Plus, Rocket, Smartphone, Sparkles, X } from 'lucide-react';
import type { Project } from '../model';
import { starters, type Starter } from '../kids';
import { copyText, createSiteZip, downloadBlob, generateFiles, previewDocument, projectSlug } from '../site';
import { deviceWidths, type Device } from './Canvas';

export type ModalType = 'code' | 'export' | 'preview' | 'help' | 'new' | 'teacher' | null;

function Modal({ title, className = '', onClose, children }: { title: string; className?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className={`modal kid-modal ${className}`} aria-label={title} onCancel={(e) => { e.preventDefault(); onCloseRef.current(); }} onClick={(e) => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onCloseRef.current(); } }}><button className="modal-close icon-button" aria-label="Fechar janela" onClick={onClose}><X size={23} /></button>{children}</dialog>;
}

function CodeDialog({ project, onClose, onToast }: { project: Project; onClose: () => void; onToast: (message: string) => void }) {
  const files = useMemo(() => generateFiles(project), [project]);
  const [file, setFile] = useState<keyof typeof files>('index.html');
  const descriptions = { 'index.html': 'A estrutura: os textos, as imagens e os blocos que você criou.', 'style.css': 'O visual: as cores, as fontes, os espaçamentos e a adaptação ao celular.', 'script.js': 'As interações: o menu no celular e a seção de perguntas.' };
  const displayedLines = files[file].split('\n').map((line) => line.length > 700 ? line.replace(/data:image[^"\s]+/g, '[imagem incorporada — o código completo está na cópia e no download]') : line);
  return <Modal title="Código do site" className="code-modal" onClose={onClose}><div className="modal-heading"><span className="modal-icon"><Code2 size={23} /></span><div><span className="eyebrow-label">POR TRÁS DA SUA CRIAÇÃO</span><h2>Visual por fora. Código por dentro.</h2><p>O que você cria vira código de verdade. Explore e aprenda.</p></div></div><div className="code-toolbar"><div className="code-tabs" role="tablist" aria-label="Arquivos do site">{(Object.keys(files) as (keyof typeof files)[]).map((key) => <button key={key} role="tab" aria-selected={file === key} className={file === key ? 'active' : ''} onClick={() => setFile(key)}><span className={`file-dot ${key === 'index.html' ? 'html-dot' : key === 'style.css' ? 'css-dot' : 'js-dot'}`} />{key}</button>)}</div><div><button className="icon-button" aria-label="Copiar código" title="Copiar código completo" onClick={() => { copyText(files[file]).then(() => onToast(`${file} copiado!`)).catch(() => onToast('Não foi possível copiar. Use o botão de baixar arquivo.')); }}><Copy size={16} /></button><button className="icon-button" aria-label="Baixar arquivo" title="Baixar este arquivo" onClick={() => downloadBlob(new Blob([files[file]], { type: 'text/plain;charset=utf-8' }), file)}><Download size={16} /></button></div></div><div className="code-description"><Sparkles size={13} />{descriptions[file]}</div><div className="code-view" tabIndex={0} role="region" aria-label={`Código de ${file}`}><pre><code>{displayedLines.map((line, i) => <span className="code-line" key={i}><span className="line-number" aria-hidden="true">{i + 1}</span><span className={line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('<!--') ? 'code-comment' : ''}>{line || ' '}</span></span>)}</code></pre></div><div className="code-footer"><span><Check size={13} />Código atualizado com a sua página</span><span>Somente leitura · edite pelos blocos</span></div></Modal>;
}

function ExportDialog({ project, onClose, onToast }: { project: Project; onClose: () => void; onToast: (message: string) => void }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  async function download() {
    setDownloading(true);
    try {
      const blob = await createSiteZip(project);
      downloadBlob(blob, `${projectSlug(project.name)}.zip`);
      setDownloaded(true);
      onToast('Seu site foi exportado. Hora de compartilhar!');
    } catch { onToast('Não foi possível gerar o ZIP. Tente novamente.'); }
    finally { setDownloading(false); }
  }
  return <Modal title="Exportar site" className="export-modal" onClose={onClose}><div className="export-hero"><span className="export-illustration"><Rocket size={32} /><i>✦</i></span><span className="eyebrow-label">A PRÓXIMA PARADA É O MUNDO</span><h2>Sua ideia está pronta para voar.</h2><p>Seu site completo em um ZIP. Sem dependências,<br />sem complicação. Todo seu.</p></div><div className="export-files">{[{ icon: FileCode2, name: 'index.html', label: 'Estrutura', color: 'orange' }, { icon: PaintIcon, name: 'style.css', label: 'Estilo', color: 'purple' }, { icon: FileJson, name: 'script.js', label: 'Interações', color: 'yellow' }].map(({ icon: Icon, name, label, color }) => <div key={name}><span className={`export-file-icon ${color}`}><Icon size={23} /></span><strong>{name}</strong><span>{label}</span></div>)}</div><button className="primary-button export-download" disabled={downloading} onClick={download}>{downloading ? <LoaderCircle size={17} className="spin" /> : downloaded ? <Check size={17} /> : <ArrowDownToLine size={17} />}{downloading ? 'Preparando seu site...' : downloaded ? 'Baixar novamente' : 'Baixar meu site'}<span>.zip</span></button><p className="export-caption">Inclui um guia de publicação passo a passo.</p>{downloaded && <div className="download-success"><Check size={15} />Download iniciado! Extraia o ZIP para encontrar seus arquivos.</div>}<div className="publish-guide"><h3><Github size={19} />Coloque no ar com o GitHub Pages<ArrowUpRight size={15} /></h3><ol><li><span>1</span><p>Crie um <a href="https://github.com/new" target="_blank" rel="noreferrer">repositório público <ExternalLink size={11} /></a> no GitHub.</p></li><li><span>2</span><p>Extraia o ZIP e envie os três arquivos para a raiz do repositório em <strong>Add file → Upload files</strong>.</p></li><li><span>3</span><p>Em <strong>Settings → Pages</strong>, selecione <strong>Deploy from a branch</strong>, branch <strong>main</strong> e pasta <strong>/ (root)</strong>.</p></li><li><span>4</span><p>Clique em <strong>Save</strong> e aguarde. O link do seu site aparecerá nessa página. Pronto! ✨</p></li></ol></div><div className="export-project-note"><FileJson size={15} /><p>Quer continuar editando depois? Use <strong>Baixar projeto</strong> no menu ao lado do nome do site.</p></div></Modal>;
}

function PaintIcon({ size }: { size: number }) { return <FileCode2 size={size} />; }

function PreviewDialog({ project, initialDevice, onClose }: { project: Project; initialDevice: Device; onClose: () => void }) {
  const [device, setDevice] = useState<Device>(initialDevice);
  const srcDoc = useMemo(() => previewDocument(project), [project]);
  return <Modal title="Meu site pronto" className="preview-modal" onClose={onClose}><div className="preview-toolbar"><button className="kid-button" onClick={onClose}><ArrowLeft size={20} />Voltar a criar</button><strong>Olha o que você criou!</strong><DeviceControls device={device} onChange={setDevice} /></div><div className="preview-stage"><iframe title="Prévia interativa do site" srcDoc={srcDoc} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" style={{ width: deviceWidths[device] }} /></div><div className="preview-footer"><Check size={17} />Aqui você pode testar os botões do seu site.</div></Modal>;
}

export function DeviceControls({ device, onChange }: { device: Device; onChange: (device: Device) => void }) {
  return <div className="device-controls" aria-label="Tamanho da página">{([{ id: 'desktop', label: 'Computador', Icon: Monitor }, { id: 'mobile', label: 'Celular', Icon: Smartphone }] as const).map(({ id, label, Icon }) => <button key={id} className={device === id ? 'active' : ''} onClick={() => onChange(id)} title={label} aria-label={label} aria-pressed={device === id}><Icon size={19} /><span>{label}</span></button>)}</div>;
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  return <Modal title="Como criar meu site" className="help-modal" onClose={onClose}><span className="modal-icon"><Sparkles size={28} /></span><h2>Vamos criar um site?</h2><div className="help-topics">{[
    { Icon: Plus, title: '1. Escolha uma peça', text: 'Clique em Título, Texto, Imagem ou Botão.' },
    { Icon: MousePointer2, title: '2. Deixe do seu jeito', text: 'Clique em uma parte do site. Escreva ou escolha uma imagem. Depois, clique em Pronto!' },
    { Icon: Rocket, title: '3. Veja sua criação', text: 'Clique em Ver meu site. Para levar seu trabalho com você, clique em Guardar.' },
  ].map(({ Icon, title, text }) => <div key={title}><span><Icon size={24} /></span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><p className="kid-help-tip">Mudou de ideia? O botão <strong>Desfazer</strong> faz a última mudança voltar.</p><button className="kid-button kid-primary" onClick={onClose}>Entendi! Vamos criar <ChevronRight size={20} /></button></Modal>;
}

export default function Dialogs({ modal, project, device, onClose, onToast, onNew, onOpen, onSave, onImport }: { modal: ModalType; project: Project; device: Device; onClose: () => void; onToast: (message: string) => void; onNew: (starter: Starter) => void; onOpen: (modal: ModalType) => void; onSave: () => void; onImport: () => void }) {
  if (modal === 'code') return <CodeDialog project={project} onClose={onClose} onToast={onToast} />;
  if (modal === 'export') return <ExportDialog project={project} onClose={onClose} onToast={onToast} />;
  if (modal === 'preview') return <PreviewDialog project={project} initialDevice={device} onClose={onClose} />;
  if (modal === 'help') return <HelpDialog onClose={onClose} />;
  if (modal === 'new') return <Modal title="Começar outro site" className="new-modal" onClose={onClose}><span className="modal-icon"><Sparkles size={28} /></span><h2>Sobre o que vai ser seu site?</h2><p>Escolha uma ideia para começar.</p><div className="kid-starters">{starters.map((starter) => <button key={starter.id} onClick={() => onNew(starter.id)}><img src={starter.picture.src} alt="" /><strong>{starter.name}</strong><ChevronRight size={20} /></button>)}</div><button className="kid-button kid-blank" onClick={() => onNew('blank')}><Plus size={20} />Quero começar em branco</button><p className="kid-new-note">Seu site atual será substituído. Use Guardar antes para levar uma cópia. Também dá para Desfazer.</p></Modal>;
  if (modal === 'teacher') return <Modal title="Para o professor" className="teacher-modal" onClose={onClose}><span className="modal-icon"><GraduationCap size={28} /></span><h2>Ferramentas para a aula</h2><p>Explore o código com a turma e publique os sites criados.</p><div className="kid-teacher-actions"><button onClick={() => onOpen('code')}><Code2 size={25} /><span><strong>Ver código</strong><small>HTML, CSS e JavaScript da criação.</small></span><ChevronRight size={20} /></button><button onClick={() => onOpen('export')}><Download size={25} /><span><strong>Exportar site</strong><small>ZIP pronto para o GitHub Pages, com instruções.</small></span><ChevronRight size={20} /></button><button onClick={onSave}><FileJson size={25} /><span><strong>Guardar trabalho editável</strong><small>Arquivo .atelie.json para continuar em outro computador.</small></span></button><button onClick={onImport}><FolderOpen size={25} /><span><strong>Abrir trabalho</strong><small>Também abre projetos da versão anterior.</small></span></button></div><p className="kid-teacher-note">O salvamento automático fica neste navegador. O botão <strong>Guardar</strong> baixa o trabalho do aluno. A exportação ZIP contém o site final.</p></Modal>;
  return null;
}
