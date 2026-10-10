import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Move, Plus, Trash2 } from 'lucide-react';

const ResizeHandles = ({ blockId, onResizeStart }: { blockId: string; onResizeStart: (id: string, handle: string) => void }) => (
  <div style={{ display: 'contents' }}>
    {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => (
      <ResizeHandle key={h} handle={h} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart(blockId, h); }} />
    ))}
  </div>
);
import { type Block, type Project } from '../model';
import { renderBlock, siteCss, themeVariables } from '../site';

export type Device = 'desktop' | 'mobile';
export const deviceWidths = { desktop: 1200, mobile: 390 };

interface CanvasProps {
  project: Project;
  selectedId: string | null;
  device: Device;
  dragging: boolean;
  resizing: boolean;
  onSelect: (id: string | null) => void;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, dx: number, dy: number) => void;
  onDragEnd: () => void;
  onResizeStart: (id: string, handle: string) => void;
  onResizeMove: (id: string, handle: string, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onDelete: (id: string) => void;
  onEditText: (id: string, key: string, value: string) => void;
  onAdd: () => void;
}

const BlockContent = ({ block, editing }: { block: Block; editing: boolean }) => {
  return <div className="block-content" dangerouslySetInnerHTML={{ __html: renderBlock(block, editing).replace(/^<[^>]+>|<\/[^>]+>$/g, '') }} />;
};

const ResizeHandle = ({ handle, onMouseDown }: { handle: string; onMouseDown: (e: MouseEvent) => void }) => {
  const pos: Record<string, CSSProperties> = {
    'nw': { top: -4, left: -4 }, 'ne': { top: -4, right: -4 },
    'sw': { bottom: -4, left: -4 }, 'se': { bottom: -4, right: -4 },
    'n': { top: -4, left: '50%', transform: 'translateX(-50%)' },
    's': { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
    'e': { right: -4, top: '50%', transform: 'translateY(-50%)' },
    'w': { left: -4, top: '50%', transform: 'translateY(-50%)' },
  };
  return <div className="resize-handle" style={pos[handle]} onMouseDown={onMouseDown} aria-label={`Redimensionar ${handle}`} role="slider" tabIndex={0} />;
};

export default function Canvas(props: CanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(1000);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(1, Math.max(0.3, (availableWidth - 80) / deviceWidths[props.device]));

  return (
    <main className="canvas-area">
      <div className="canvas-topline">
        <span><span className="canvas-page-dot" />Página</span>
        <span>{props.device === 'desktop' ? 'Computador' : 'Celular'} · {deviceWidths[props.device]}px</span>
      </div>
      <div className="canvas-scroll" ref={scrollRef} onClick={(e) => { if (e.target === e.currentTarget) props.onSelect(null); }}>
        <div className={`canvas-frame canvas-${props.device} ${props.dragging ? 'drag-active' : ''} ${props.resizing ? 'resize-active' : ''}`} style={{ width: deviceWidths[props.device], zoom: scale } as CSSProperties}>
          <div className="canvas-browser"><div className="browser-dots"><i /><i /><i /></div><div className="browser-address">{props.project.name || 'Meu site'}</div></div>
          <style>{siteCss}</style>
          <div className="site-page editor-page" style={themeVariables(props.project) as CSSProperties}>
            {props.project.blocks.map((block) => {
              const isSelected = props.selectedId === block.id;
              return (
                <div
                  key={block.id}
                  data-canvas-block={block.id}
                  className={`editor-block ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    left: block.position.x,
                    top: block.position.y,
                    width: block.position.width,
                    height: block.position.height,
                    position: 'absolute',
                  }}
                  role="group"
                  aria-label={`Peça ${block.type}`}
                  tabIndex={0}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.editor-block-tools, .resize-handle')) return;
                    props.onSelect(block.id);
                  }}
                  onDoubleClick={(e) => {
                    const target = (e.target as HTMLElement).closest('[data-field]') as HTMLElement | null;
                    if (!target) return;
                    e.preventDefault();
                    target.contentEditable = 'true';
                    target.focus();
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.contentEditable !== 'true' || !target.dataset.field) return;
                    target.contentEditable = 'false';
                    props.onEditText(block.id, target.dataset.field, target.innerText);
                  }}
                >
                  <BlockContent block={block} editing={isSelected} />
                  {isSelected && (
                      <>
                        <div className="editor-block-tools" onClick={(e) => e.stopPropagation()}>
                          <button draggable onMouseDown={(e) => { e.preventDefault(); props.onDragStart(block.id); }} onMouseMove={(e) => { if (e.buttons === 1) props.onDragMove(block.id, e.movementX, e.movementY); }} onMouseUp={props.onDragEnd} onMouseLeave={props.onDragEnd} title="Mover"><Move size={18} /></button>
                          <span>{block.type}</span>
                          <button onClick={() => props.onDelete(block.id)} title="Apagar"><Trash2 size={16} /></button>
                        </div>
                        <ResizeHandles blockId={block.id} onResizeStart={props.onResizeStart} />
                      </>
                    )}
                </div>
              );
            })}
            {!props.project.blocks.length && (
              <div className="empty-canvas">
                <span><Plus size={40} /></span>
                <h2>Sua página está vazia</h2>
                <p>Clique em "Adicionar" para começar</p>
                <button className="kid-button kid-primary" onClick={props.onAdd}><Plus size={21} />Adicionar primeira peça</button>
              </div>
            )}
            <div className="canvas-add-block"><button onClick={props.onAdd}><Plus size={22} />Adicionar peça</button></div>
          </div>
        </div>
        <div className="canvas-bottom-note">Posicione e redimensione livremente</div>
      </div>
      <div className="canvas-status"><span>Arraste para mover · Puxe as bordas para redimensionar</span></div>
    </main>
  );
}