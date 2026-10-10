import { Check, GraduationCap, HelpCircle, Plus, Sparkles } from 'lucide-react';
import type { BlockType, Theme } from '../model';
import { kidPalettes, simpleBlocks } from '../kids';
import BlockIcon from './BlockIcon';

interface Props {
  theme: Theme;
  onAdd: (type: BlockType) => void;
  onDragNew: (type: BlockType) => void;
  onDragEnd: () => void;
  onTheme: (theme: Partial<Theme>) => void;
  onHelp: () => void;
  onTeacher: () => void;
}

export default function Sidebar(props: Props) {
  return <div className="kid-toolbox">
    <div className="kid-panel-title"><span className="step-badge">1</span><div><h2>O que vamos colocar?</h2><p>Escolha e clique. É só isso!</p></div></div>
    <div className="kid-blocks">
      {simpleBlocks.map(({ type, label, hint, color }) => <button
        key={type} className={`kid-add-card kid-${color}`} aria-label={`Adicionar ${label}`}
        draggable onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'copy';
          event.dataTransfer.setData('text/plain', type);
          props.onDragNew(type);
        }} onDragEnd={props.onDragEnd} onClick={() => props.onAdd(type)}>
        <span className="kid-card-icon"><BlockIcon type={type} size={28} strokeWidth={1.8} /></span>
        <strong>{label}</strong><span>{hint}</span><Plus className="kid-card-plus" size={16} />
      </button>)}
    </div>
    <section className="kid-colors"><h3>Qual é a sua cor?</h3><div className="kid-palette-list">
      {kidPalettes.map(({ name, primary, background, text, tint }) => <button key={name}
        aria-label={`Cor ${name.toLowerCase()}`} aria-pressed={props.theme.primary === primary}
        className={props.theme.primary === primary ? 'chosen' : ''}
        onClick={() => props.onTheme({ primary, background, text })}>
        <span style={{ background: tint, color: primary }}><i style={{ background: primary }} />{props.theme.primary === primary && <Check size={18} />}</span>{name}
      </button>)}
    </div></section>
    <div className="kid-tip"><Sparkles size={22} /><p>Quer mudar alguma coisa?<br /><strong>Clique nela no seu site!</strong></p></div>
    <div className="kid-toolbox-footer">
      <button onClick={props.onHelp}><HelpCircle size={18} />Como brincar de criar?</button>
      <button onClick={props.onTeacher}><GraduationCap size={18} />Para o professor</button>
    </div>
  </div>;
}
