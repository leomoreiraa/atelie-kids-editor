import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Download, Eye, FolderOpen, Plus, Redo2, Sparkles, Undo2, X } from 'lucide-react';
import { createBlockId, parseProject, type Block, type BlockType } from './model';
import { createKidBlock, createKidProject } from './kids';
import { downloadBlob, projectSlug } from './site';
import { useProject } from './useProject';
import Sidebar from './components/Sidebar';
import Inspector from './components/Inspector';
import Canvas from './components/Canvas';
import Dialogs, { type ModalType } from './components/Dialogs';

type DragItem = { kind: 'new'; type: BlockType } | { kind: 'move'; id: string };
type ResizeItem = { id: string; handle: string; startX: number; startY: number; startW: number; startH: number } | null;

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.showPopover?.(); }, [message]);
  return <div ref={ref} className="toast" role="status" popover="manual"><Sparkles size={20} />{message}<button className="icon-button" onClick={onClose} aria-label="Fechar aviso"><X size={18} /></button></div>;
}

export default function App() {
  const { project, change, undo, redo, canUndo, canRedo, saveStatus } = useProject();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [resizeItem, setResizeItem] = useState<ResizeItem>(null);
  const [toast, setToast] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selectedBlock = project.blocks.find((block) => block.id === selectedId);

  const notify = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 5000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => { if (selectedId && !selectedBlock) setSelectedId(null); }, [selectedId, selectedBlock]);
  useEffect(() => { panelRef.current?.scrollTo({ top: 0 }); }, [selectedId]);

  const selectBlock = (id: string | null) => {
    setSelectedId(id);
    setPanelOpen(!!id);
  };

  const done = () => {
    setSelectedId(null);
    setPanelOpen(false);
  };

  const addBlock = (type: BlockType) => {
    if (project.blocks.length >= 100) { notify('Seu site já tem muitas peças!'); return; }
    const x = 50 + (project.blocks.length * 20) % 200;
    const y = 50 + (project.blocks.length * 20) % 200;
    const block = createKidBlock(type);
    block.position = { x, y, width: block.position.width, height: block.position.height };
    change((current) => ({ ...current, blocks: [...current.blocks, block] }));
    selectBlock(block.id);
  };

  const updateBlock = useCallback((id: string, update: Partial<Pick<Block, 'content' | 'style' | 'position'>>) => {
    change((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === id ? { ...block, ...update } : block) }));
  }, [change]);

  const deleteBlock = useCallback((id: string) => {
    change((current) => ({ ...current, blocks: current.blocks.filter((block) => block.id !== id) }));
    setSelectedId(null);
    setPanelOpen(false);
    notify('Peça apagada. Foi sem querer? Clique em Desfazer.');
  }, [change, notify]);

  const duplicateBlock = (id: string) => {
    if (project.blocks.length >= 100) { notify('Seu site já tem muitas peças!'); return; }
    const newId = createBlockId();
    change((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const blocks = [...current.blocks];
      const cloned = { ...structuredClone(blocks[index]), id: newId, position: { ...blocks[index].position, x: blocks[index].position.x + 20, y: blocks[index].position.y + 20 } };
      blocks.splice(index + 1, 0, cloned);
      return { ...current, blocks };
    });
    selectBlock(newId);
    notify('Cópia criada!');
  };

  const startDrag = (id: string) => {
    setDragItem({ kind: 'move', id });
  };

  const moveDrag = (id: string, dx: number, dy: number) => {
    if (!dragItem || dragItem.kind !== 'move' || dragItem.id !== id) return;
    change((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === id ? { ...block, position: { ...block.position, x: Math.max(0, block.position.x + dx), y: Math.max(0, block.position.y + dy) } } : block),
    }));
  };

  const endDrag = () => setDragItem(null);

  const startResize = (id: string, handle: string) => {
    const block = project.blocks.find((b) => b.id === id);
    if (!block) return;
    setResizeItem({ id, handle, startX: block.position.x, startY: block.position.y, startW: block.position.width, startH: block.position.height });
  };

  const moveResize = (id: string, handle: string, dx: number, dy: number) => {
    if (!resizeItem || resizeItem.id !== id) return;
    const { startX, startY, startW, startH } = resizeItem;
    let x = startX, y = startY, w = startW, h = startH;
    if (handle.includes('w')) { x = startX + dx; w = Math.max(60, startW - dx); }
    if (handle.includes('e')) { w = Math.max(60, startW + dx); }
    if (handle.includes('n')) { y = startY + dy; h = Math.max(40, startH - dy); }
    if (handle.includes('s')) { h = Math.max(40, startH + dy); }
    change((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === id ? { ...block, position: { x: Math.max(0, x), y: Math.max(0, y), width: w, height: h } } : block),
    }));
  };

  const endResize = () => setResizeItem(null);

  const downloadProject = useCallback(() => {
    downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${projectSlug(project.name)}.atelie.json`);
    notify('Trabalho baixado! Use "Abrir trabalho" para continuar depois.');
  }, [project, notify]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); downloadProject(); return; }
      if (typing) return;
      if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
      if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) { event.preventDefault(); deleteBlock(selectedId); }
      if (event.key === 'Escape') { setSelectedId(null); setPanelOpen(false); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [selectedId, undo, redo, deleteBlock, downloadProject]);

  const openBlocks = () => { setSelectedId(null); setPanelOpen(true); panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openImport = () => { setModal(null); importRef.current?.click(); };

  return <div className={`app-shell kid-app ${panelOpen ? 'kid-panel-open' : ''}`}>
    <header className="kid-header">
      <div className="brand"><span className="brand-symbol"><Sparkles size={25} /></span><span>ateliê<span className="brand-period">.</span></span></div>
      <label className="kid-project-name"><span>Meu site se chama</span><input aria-label="Nome do meu site" value={project.name} maxLength={100} onChange={(e) => change((current) => ({ ...current, name: e.target.value }))} /></label>
      <div className="kid-header-actions">
        <button className="kid-button kid-undo" disabled={!canUndo} onClick={undo} title="Desfazer (Ctrl+Z)"><Undo2 size={20} /><span>Desfazer</span></button>
        {canRedo && <button className="kid-button kid-redo" onClick={redo} title="Refazer"><Redo2 size={20} /><span>Refazer</span></button>}
        <button className="kid-button kid-save" onClick={downloadProject}><Download size={20} /><span>Guardar</span></button>
        <button className="kid-button kid-primary" onClick={() => setModal('preview')}><Eye size={21} /><span>Ver meu site</span></button>
      </div>
    </header>

    <div className="kid-journey">
      <button className="kid-mobile-pieces kid-button" onClick={openBlocks}><Plus size={20} />Peças</button>
      <div className="kid-steps" aria-label="Como criar seu site">
        <span className={!selectedBlock ? 'current' : ''}><b>1</b>Escolha uma peça</span><i>→</i>
        <span className={selectedBlock ? 'current' : ''}><b>2</b>Arraste e redimensione</span><i>→</i>
        <span><b>3</b>Veja seu site!</span>
      </div>
      <span className={`kid-save-status ${saveStatus === 'error' ? 'error' : ''}`} role="status"><Check size={16} />{saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'error' ? 'Clique em Guardar para salvar' : 'Salvo neste navegador'}</span>
    </div>

    <div className="workspace kid-workspace">
      {panelOpen && <button className="kid-panel-shade" aria-label="Voltar ao site" onClick={() => setPanelOpen(false)} />}
      <aside className="kid-panel" ref={panelRef} aria-label={selectedBlock ? 'Mudar minha peça' : 'Escolher peças'}>
        <button className="kid-panel-close kid-button" onClick={() => setPanelOpen(false)}><X size={18} />Fechar</button>
        {selectedBlock ? <Inspector key={selectedBlock.id} block={selectedBlock} blocks={project.blocks} onUpdate={updateBlock} onMove={moveDrag} onDuplicate={duplicateBlock} onDelete={deleteBlock} onDone={done} onToast={notify} /> : <>
          <Sidebar theme={project.theme} onAdd={addBlock} onDragNew={(type) => setDragItem({ kind: 'new', type })} onDragEnd={() => setDragItem(null)} onTheme={(theme) => change((current) => ({ ...current, theme: { ...current.theme, ...theme } }))} onHelp={() => setModal('help')} onTeacher={() => setModal('teacher')} />
          <div className="kid-file-actions"><button onClick={() => setModal('new')}><Plus size={17} />Começar outro</button><button onClick={openImport}><FolderOpen size={17} />Abrir trabalho</button></div>
        </>}
      </aside>
      <Canvas project={project} selectedId={selectedId} device="desktop" dragging={!!dragItem} resizing={!!resizeItem} onSelect={selectBlock} onDragStart={startDrag} onDragMove={moveDrag} onDragEnd={endDrag} onResizeStart={startResize} onResizeMove={moveResize} onResizeEnd={endResize} onDelete={deleteBlock} onEditText={(id, key, value) => change((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === id ? { ...block, content: { ...block.content, [key]: value } } : block) }))} onAdd={openBlocks} />
    </div>

    <input ref={importRef} className="sr-only" tabIndex={-1} type="file" accept=".json,application/json" aria-label="Importar projeto" onChange={async (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      if (file.size > 25 * 1024 * 1024) { notify('Esse arquivo é muito grande. Peça ajuda ao professor.'); return; }
      try {
        const imported = parseProject(JSON.parse(await file.text()));
        change(() => imported);
        done();
        notify('Seu trabalho voltou! Vamos continuar?');
      } catch { notify('Escolha um trabalho do Ateliê, com final .atelie.json.'); }
    }} />
    <Dialogs modal={modal} project={project} device="desktop" onClose={() => setModal(null)} onToast={notify} onOpen={setModal} onSave={downloadProject} onImport={openImport} onNew={(starter) => {
      change(() => createKidProject(starter));
      done();
      setModal(null);
      notify('Seu novo site está pronto para brincar!');
    }} />
    {toast && <Toast message={toast} onClose={() => setToast('')} />}
  </div>;
}