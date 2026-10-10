import { useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Copy, Grid, ImagePlus, LayoutGrid, LayoutList, Trash2 } from 'lucide-react';
import { definitionFor, type Block, type Field } from '../model';
import { partName, partTitle, pictures } from '../kids';
import BlockIcon from './BlockIcon';

interface Props {
  block: Block;
  blocks: Block[];
  onUpdate: (id: string, update: Partial<Pick<Block, 'content' | 'style'>>) => void;
  onMove: (id: string, direction: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onDone: () => void;
  onToast: (message: string) => void;
}

function PicturePicker({ value, onChange, onToast }: { value: string; onChange: (src: string, alt?: string) => void; onToast: Props['onToast'] }) {
  const ref = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState('');
  return <div className="kid-picture-picker">
    <div className="kid-image-preview">{value && failed !== value ? <img src={value} alt="Sua imagem escolhida" onError={() => setFailed(value)} /> : <ImagePlus size={40} />}</div>
    <button className="kid-button kid-upload" onClick={() => ref.current?.click()}><ImagePlus size={20} />Escolher uma foto</button>
    <input ref={ref} type="file" className="sr-only" tabIndex={-1} aria-label="Enviar imagem" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={(event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      if (!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.type)) return onToast('Esse arquivo não é uma imagem. Escolha uma foto ou desenho.');
      if (file.size > 3 * 1024 * 1024) return onToast('Essa imagem é muito grande. Escolha uma menor, de até 3 MB.');
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result), file.name.replace(/\.[^.]+$/, ''));
      reader.onerror = () => onToast('Não conseguimos abrir essa imagem. Vamos tentar outra?');
      reader.readAsDataURL(file);
    }} />
    <p>Ou escolha um desenho:</p>
    <div className="kid-picture-options">{pictures.map((picture) => <button key={picture.name} aria-label={`Desenho ${picture.name}`} aria-pressed={picture.src === value} className={picture.src === value ? 'chosen' : ''} onClick={() => onChange(picture.src, picture.alt)}><img src={picture.src} alt="" /><span>{picture.name}</span></button>)}</div>
    <details className="kid-details"><summary>Usar imagem da internet</summary><label className="kid-field">Cole o link da imagem<input aria-label="Link da imagem" value={value.startsWith('data:') ? '' : value} placeholder="https://..." onChange={(e) => onChange(e.target.value)} /></label></details>
  </div>;
}

const colorChoices = [
  { label: 'Do site', value: '' }, { label: 'Branco', value: '#ffffff' },
  { label: 'Roxo claro', value: '#eee8fa' }, { label: 'Azul claro', value: '#e4f2fc' },
  { label: 'Verde claro', value: '#e6f3e2' }, { label: 'Amarelo claro', value: '#fff3cd' },
];

const layoutChoices = [
  { value: 'stack', label: 'Uma embaixo da outra', Icon: LayoutList },
  { value: 'grid-2', label: 'Duas lado a lado', Icon: LayoutGrid },
  { value: 'grid-3', label: 'Três lado a lado', Icon: Grid },
] as const;

export default function Inspector(props: Props) {
  const { block } = props;
  const index = props.blocks.findIndex((item) => item.id === block.id);
  const fields = definitionFor(block.type).fields;
  const updateContent = (key: string, value: string) => props.onUpdate(block.id, { content: { ...block.content, [key]: value } });
  const mainKeys: Partial<Record<Block['type'], string[]>> = {
    heading: ['text'], text: ['text'], image: ['src'], button: ['label', 'url'],
    hero: ['title', 'text', 'image'], navbar: ['brand'], footer: ['brand', 'text'],
  };
  const main = fields.filter((field) => mainKeys[block.type]?.includes(field.key) ?? true);
  const extra = fields.filter((field) => !main.includes(field));

  function renderField(field: Field) {
    if (field.type === 'image') return <PicturePicker key={field.key} value={block.content[field.key]} onToast={props.onToast} onChange={(src, alt) => {
      const altKey = field.key === 'src' || field.key === 'image' ? 'alt' : field.key.replace('image', 'alt');
      props.onUpdate(block.id, { content: { ...block.content, [field.key]: src, ...(alt ? { [altKey]: alt } : {}) } });
    }} />;
    if (field.type === 'url') {
      const value = block.content[field.key] || '#';
      const inPage = value === '#' || props.blocks.some((item) => `#${item.id}` === value);
      return <div key={field.key} className="kid-link-field"><label className="kid-field">Para onde vai?
        <select aria-label="Para onde vai?" value={inPage ? value : 'external'} onChange={(event) => updateContent(field.key, event.target.value === 'external' ? 'https://' : event.target.value)}>
          <option value="#">Começo do meu site</option>
          {props.blocks.filter((item) => item.id !== block.id).map((item) => <option key={item.id} value={`#${item.id}`}>{partTitle(item)}</option>)}
          <option value="external">Outro site</option>
        </select>
      </label>{!inPage && <label className="kid-field">Cole o link do site<input aria-label="Link do botão" value={value} placeholder="https://..." onChange={(event) => updateContent(field.key, event.target.value)} /></label>}</div>;
    }
    let label = field.label;
    if (field.key === 'text' && block.type === 'heading') label = 'Escreva seu título';
    else if (field.key === 'text') label = 'O que você quer contar?';
    else if (field.key === 'label' || field.key === 'buttonLabel') label = 'O que vai no botão?';
    else if (field.key === 'title') label = 'Escreva seu título';
    const large = field.type === 'textarea' || field.key === 'text';
    return <label className="kid-field" key={field.key}>{label}{large ?
      <textarea aria-label={label} rows={block.type === 'heading' ? 3 : 5} value={block.content[field.key] || ''} onChange={(e) => updateContent(field.key, e.target.value)} /> :
      <input aria-label={label} value={block.content[field.key] || ''} onChange={(e) => updateContent(field.key, e.target.value)} />}
    </label>;
  }

  return <div className="kid-inspector">
    <button className="kid-back" onClick={props.onDone}><ArrowLeft size={19} />Voltar às peças</button>
    <div className="kid-panel-title"><span className="step-badge"><BlockIcon type={block.type} size={22} /></span><div><h2>Vamos mudar {block.type === 'image' ? 'a imagem' : `o ${partName(block.type).toLowerCase()}`}?</h2><p>Você muda aqui e vê ao lado.</p></div></div>
    <div className="kid-edit-fields">{main.map(renderField)}</div>
    {!!extra.length && <details className="kid-details"><summary>Mais opções desta peça</summary>{extra.map(renderField)}</details>}
    <fieldset className="kid-backgrounds"><legend>Cor desta parte</legend><div>{colorChoices.map(({ label, value }) => <button key={label} title={label} aria-label={`Fundo: ${label}`} aria-pressed={block.style.background === value} className={block.style.background === value ? 'chosen' : ''} style={{ background: value || '#f7f7fa' }} onClick={() => props.onUpdate(block.id, { style: { ...block.style, background: value, color: value ? '#34304a' : '' } })}>{block.style.background === value ? <Check size={20} /> : !value ? '↺' : ''}</button>)}</div></fieldset>
    <fieldset className="kid-layouts"><legend>Como organizar?</legend><div>{layoutChoices.map(({ value, label, Icon }) => <button key={value} title={label} aria-label={label} aria-pressed={block.style.layout === value} className={block.style.layout === value ? 'chosen' : ''} onClick={() => props.onUpdate(block.id, { style: { ...block.style, layout: value } })}><Icon size={20} /><span>{label}</span>{block.style.layout === value && <Check size={18} />}</button>)}</div></fieldset>
    <button className="kid-button kid-done" onClick={props.onDone}><Check size={21} />Pronto!</button>
    <details className="kid-details kid-organize"><summary>Mover, copiar ou apagar</summary><div className="kid-move-buttons"><button className="kid-button" disabled={!index} onClick={() => props.onMove(block.id, -1)}><ArrowUp size={18} />Subir</button><button className="kid-button" disabled={index === props.blocks.length - 1} onClick={() => props.onMove(block.id, 1)}><ArrowDown size={18} />Descer</button></div><button className="kid-button" onClick={() => props.onDuplicate(block.id)}><Copy size={18} />Fazer uma cópia</button><button className="kid-button kid-remove" onClick={() => props.onDelete(block.id)}><Trash2 size={18} />Apagar esta peça</button></details>
  </div>;
}
