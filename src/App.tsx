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

  const addBlock = (type: BlockType, insertion?: number) => {
    if (project.blocks.length >= 100) { notify('Seu site já tem muitas peças! Você pode começar outro.'); return; }
    const block = createKidBlock(type);
    change((current) => {
      if (selectedId) {
        const selectedBlock = current.blocks.find((b) => b.id === selectedId);
        if (selectedBlock?.type === 'container' && selectedBlock.children) {
          const maxChildren = selectedBlock.style.layout === 'grid-3' ? 3 : 2;
          if (selectedBlock.children.length >= maxChildren) {
            notify(`Esta linha já tem ${maxChildren} peças. Escolha outra ou mude para 3 colunas.`);
            return current;
          }
          const newChildren = [...selectedBlock.children, block.id];
          return {
            ...current,
            blocks: current.blocks.map((b) => b.id === selectedId ? { ...b, children: newChildren } : b),
          };
        }
      }
      const blocks = [...current.blocks];
      const selected = blocks.findIndex((item) => item.id === selectedId);
      blocks.splice(insertion ?? (selected >= 0 ? selected + 1 : blocks.length), 0, block);
      return { ...current, blocks };
    });
    selectBlock(block.id);
  };

  const updateBlock = useCallback((id: string, update: Partial<Pick<Block, 'content' | 'style'>>) => {
    change((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === id ? { ...block, ...update } : block) }));
  }, [change]);

  const deleteBlock = useCallback((id: string) => {
    change((current) => {
      // Remove from any container's children
      const blocks = current.blocks.map((block) => {
        if (block.children && block.children.includes(id)) {
          return { ...block, children: block.children.filter((childId) => childId !== id) };
        }
        return block;
      });
      return { ...current, blocks: blocks.filter((block) => block.id !== id) };
    });
    setSelectedId(null);
    setPanelOpen(false);
    notify('Peça apagada. Foi sem querer? Clique em Desfazer.');
  }, [change, notify]);

  const moveBlock = useCallback((id: string, direction: number) => {
    change((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      if (index < 0 || index + direction < 0 || index + direction >= current.blocks.length) return current;
      const blocks = [...current.blocks];
      const [block] = blocks.splice(index, 1);
      blocks.splice(index + direction, 0, block);
      return { ...current, blocks };
    });
  }, [change]);

  const duplicateBlock = (id: string) => {
    if (project.blocks.length >= 100) { notify('Seu site já tem muitas peças!'); return; }
    const newId = createBlockId();
    change((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const blocks = [...current.blocks];
      blocks.splice(index + 1, 0, { ...structuredClone(blocks[index]), id: newId });
      return { ...current, blocks };
    });
    selectBlock(newId);
    notify('Agora você tem uma cópia!');
  };

  const dropBlock = (index: number) => {
    if (!dragItem) return;
    if (dragItem.kind === 'new') addBlock(dragItem.type, index);
    else {
      change((current) => {
        const from = current.blocks.findIndex((block) => block.id === dragItem.id);
        if (from < 0) return current;
        const blocks = [...current.blocks];
        const [block] = blocks.splice(from, 1);
        blocks.splice(index > from ? index - 1 : index, 0, block);
        return { ...current, blocks };
      });
      selectBlock(dragItem.id);
    }
    setDragItem(null);
  };

  const downloadProject = useCallback(() => {
    downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${projectSlug(project.name)}.atelie.json`);
    notify('Trabalho baixado! Use “Abrir trabalho” para continuar depois.');
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
      <label className="kid-project-name"><span>Meu site se chama</span><input aria-label="Nome do meu site" value={project.name} maxLength={100} onChange={(event) => change((current) => ({ ...current, name: event.target.value }))} /></label>
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
        <span className={selectedBlock ? 'current' : ''}><b>2</b>Deixe do seu jeito</span><i>→</i>
        <span><b>3</b>Veja seu site!</span>
      </div>
      <span className={`kid-save-status ${saveStatus === 'error' ? 'error' : ''}`} role="status"><Check size={16} />{saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'error' ? 'Clique em Guardar para salvar' : 'Salvo neste navegador'}</span>
    </div>

    <div className="workspace kid-workspace">
      {panelOpen && <button className="kid-panel-shade" aria-label="Voltar ao site" onClick={() => setPanelOpen(false)} />}
      <aside className="kid-panel" ref={panelRef} aria-label={selectedBlock ? 'Mudar minha peça' : 'Escolher peças'}>
        <button className="kid-panel-close kid-button" onClick={() => setPanelOpen(false)}><X size={18} />Fechar</button>
        {selectedBlock ? <Inspector key={selectedBlock.id} block={selectedBlock} blocks={project.blocks} onUpdate={updateBlock} onMove={moveBlock} onDuplicate={duplicateBlock} onDelete={deleteBlock} onDone={done} onToast={notify} /> : <>
          <Sidebar theme={project.theme} onAdd={addBlock} onDragNew={(type) => setDragItem({ kind: 'new', type })} onDragEnd={() => setDragItem(null)} onTheme={(theme) => change((current) => ({ ...current, theme: { ...current.theme, ...theme } }))} onHelp={() => setModal('help')} onTeacher={() => setModal('teacher')} />
          <div className="kid-file-actions"><button onClick={() => setModal('new')}><Plus size={17} />Começar outro</button><button onClick={openImport}><FolderOpen size={17} />Abrir trabalho</button></div>
        </>}
      </aside>
      <Canvas project={project} selectedId={selectedId} dragging={!!dragItem} onSelect={selectBlock} onDragMove={(id) => setDragItem({ kind: 'move', id })} onDragEnd={() => setDragItem(null)} onDrop={dropBlock} onMove={moveBlock} onEditText={(id, key, value) => change((current) => ({ ...current, blocks: current.blocks.map((block) => block.id === id ? { ...block, content: { ...block.content, [key]: value } } : block) }))} onAdd={openBlocks} />
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
