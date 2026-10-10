import { Type, AlignLeft, Image, MousePointer2, Minus, MoveVertical, PanelTop, LayoutTemplate, PanelsTopLeft, Images, MessageCircleQuestion, PanelBottom, LayoutGrid, type LucideProps } from 'lucide-react';
import type { BlockType } from '../model';

const icons = { heading: Type, text: AlignLeft, image: Image, button: MousePointer2, divider: Minus, spacer: MoveVertical, navbar: PanelTop, hero: LayoutTemplate, features: PanelsTopLeft, gallery: Images, faq: MessageCircleQuestion, footer: PanelBottom, container: LayoutGrid };

export default function BlockIcon({ type, ...props }: LucideProps & { type: BlockType }) {
  const Icon = icons[type];
  return <Icon {...props} />;
}
