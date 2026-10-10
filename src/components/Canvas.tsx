import { memo, useEffect, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Sparkles } from 'lucide-react';
import { type Block, type Project } from '../model';
import { partName } from '../kids';
import { renderBlock, siteCss, themeVariables } from '../site';

export type Device = 'desktop' | 'tablet' | 'mobile';
export const deviceWidths = { desktop: 1120, tablet: 768, mobile: 390 };

interface CanvasProps {
  project: Project;
  selectedId: string | null;
  dragging: boolean;
  onSelect: (id: string | null) => void;
  onDragMove: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  onMove: (id: string, direction: number) => void;
  onEditText: (id: string, key: string, value: string) => void;
  onAdd: () => void;
}

const BlockMarkup = memo(function BlockMarkup({ block }: { block: Block }) {
  return <div className="block-markup" dangerouslySetInnerHTML={{ __html: renderBlock(block, true) }} />;
});

export default function Canvas(props: CanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(1000);
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const pageWidth = Math.min(1000, Math.max(280, availableWidth - (availableWidth < 600 ? 24 : 64)));

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (!props.dragging) setInsertionIndex(null); }, [props.dragging]);

  useEffect(() => {
    if (!props.selectedId) return;
    const selected = document.querySelector(`[data-canvas-block="${props.selectedId}"]`);
    const scroll = scrollRef.current;
    if (selected && scroll) {
      const rect = selected.getBoundingClientRect();
      const outer = scroll.getBoundingClientRect();
      if (rect.top < outer.top || rect.top > outer.bottom - 60) selected.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [props.selectedId]);

  const findIndex = (event: DragEvent) => {
    const wrapper = (event.target as HTMLElement).closest<HTMLElement>('[data-canvas-block]');
    if (!wrapper) return props.project.blocks.length;
    const rect = wrapper.getBoundingClientRect();
    return Number(wrapper.dataset.index) + (event.clientY >= rect.top + rect.height / 2 ? 1 : 0);
  };

  return <main className="canvas-area kid-canvas">
    <div className="canvas-topline"><span><Sparkles size={18} />Seu site está ficando assim!</span><span>Clique em uma parte para mudar.</span></div>
    <div className="canvas-scroll" ref={scrollRef} onClick={(event) => { if (event.target === event.currentTarget) props.onSelect(null); }}>
      <div className={`canvas-frame ${props.dragging ? 'drag-active' : ''}`} style={{ width: pageWidth }}>
        <div className="canvas-browser"><div className="browser-dots"><i /><i /><i /></div><div className="browser-address">{props.project.name || 'Meu site'}</div><span className="browser-sparkle">✧</span></div>
        <style>{siteCss}</style>
        <div className="site-page editor-page" style={themeVariables(props.project) as CSSProperties}
          onDragOver={(event) => { if (!props.dragging) return; event.preventDefault(); setInsertionIndex(findIndex(event)); }}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInsertionIndex(null); }}
          onDrop={(event) => { event.preventDefault(); if (props.dragging) props.onDrop(insertionIndex ?? findIndex(event)); setInsertionIndex(null); }}>
          {props.project.blocks.map((block, index) => <div key={block.id} data-canvas-block={block.id} data-index={index} className={`editor-block ${props.selectedId === block.id ? 'is-selected' : ''} ${props.dragging && insertionIndex === index ? 'insert-before' : ''} ${block.type === 'spacer' ? 'editor-spacer' : ''}`} role="group" aria-label={`Peça ${partName(block.type)}`} tabIndex={0}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) event.preventDefault();
              if (!(event.target as HTMLElement).closest('.editor-block-tools')) props.onSelect(block.id);
            }}
            onKeyDown={(event) => {
              const target = event.target as HTMLElement;
              if (target.isContentEditable) {
                event.stopPropagation();
                if (event.key === 'Escape') { target.innerText = block.content[target.dataset.field!] || ''; target.blur(); }
                if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); target.blur(); }
              } else if (event.key === 'Enter' && target === event.currentTarget) { props.onSelect(block.id); }
            }}
            onDoubleClick={(event) => {
              const target = (event.target as HTMLElement).closest<HTMLElement>('[data-field]');
              if (!target) return;
              event.preventDefault();
              target.contentEditable = 'true';
              target.focus();
              const range = document.createRange();
              range.selectNodeContents(target);
              window.getSelection()?.removeAllRanges();
              window.getSelection()?.addRange(range);
            }}
            onPaste={(event) => {
              const target = event.target as HTMLElement;
              if (!target.isContentEditable) return;
              event.preventDefault();
              const selection = window.getSelection();
              if (!selection?.rangeCount) return;
              const range = selection.getRangeAt(0);
              range.deleteContents();
              const text = document.createTextNode(event.clipboardData.getData('text/plain'));
              range.insertNode(text);
              range.setStartAfter(text);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }}
            onBlur={(event) => {
              const target = event.target as HTMLElement;
              if (target.contentEditable !== 'true' || !target.dataset.field) return;
              target.contentEditable = 'false';
              props.onEditText(block.id, target.dataset.field, target.innerText);
            }}>
            <BlockMarkup block={block} />
            {props.selectedId === block.id && <div className="editor-block-tools" onClick={(e) => e.stopPropagation()}><button draggable title="Arraste para mover" aria-label="Arrastar peça" onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', block.id); props.onDragMove(block.id); }} onDragEnd={props.onDragEnd}><GripVertical size={20} /></button><span>{partName(block.type)}</span><button disabled={!index} aria-label="Subir peça" onClick={() => props.onMove(block.id, -1)}><ArrowUp size={18} /><span>Subir</span></button><button disabled={index === props.project.blocks.length - 1} aria-label="Descer peça" onClick={() => props.onMove(block.id, 1)}><ArrowDown size={18} /><span>Descer</span></button></div>}
            <span className="block-hover-label"><Pencil size={15} />Clique para mudar</span>
          </div>)}
          {!props.project.blocks.length && <div className="empty-canvas"><span><Sparkles size={40} /></span><h2>O que você vai inventar?</h2><p>Escolha uma peça para começar!</p><button className="kid-button kid-primary" onClick={props.onAdd}><Plus size={21} />Escolher uma peça</button></div>}
          <div className={`canvas-add-block ${props.dragging && insertionIndex === props.project.blocks.length ? 'insert-before' : ''}`}><button onClick={props.onAdd}><Plus size={22} />Colocar mais uma peça</button></div>
        </div>
      </div>
      <div className="canvas-bottom-note"><Sparkles size={17} />Sua imaginação tem lugar aqui.</div>
    </div>
  </main>;
}
