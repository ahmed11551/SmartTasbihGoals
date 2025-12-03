import * as LucideIcons from 'lucide-react';
import { CircleDot, type LucideIcon } from 'lucide-react';

export function getIconByName(name: string, className: string = "w-5 h-5") {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const IconComponent = icons[name];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <CircleDot className={className} />;
}

export const validIconNames = [
  'Sunrise',
  'Moon',
  'Sun',
  'Sunset',
  'Droplets',
  'Building2',
  'HandHeart',
  'BookOpen',
  'ScrollText',
  'Mountain',
  'Crown',
  'Sparkles',
  'Heart',
  'Library',
  'Target',
  'FileText',
  'CircleDot',
  'Hand',
  'Sparkle',
  'Gem',
  'Brain',
  'Coins',
  'Construction',
  'Handshake',
  'Baby',
  'TrendingUp',
  'Scale',
  'Headphones',
  'Languages',
  'Circle',
  'UtensilsCrossed',
  'Smile',
  'Phone',
  'MessageCircle',
  'Clock',
  'Star',
  'Calendar',
  'Sprout',
  'User',
  'Users',
  'GraduationCap',
] as const;

export type ValidIconName = typeof validIconNames[number];
