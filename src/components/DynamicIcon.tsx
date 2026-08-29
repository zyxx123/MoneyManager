import { icons } from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function DynamicIcon({ name, size = 24, className }: DynamicIconProps) {
  if (!name) return null;
  
  // convert kebab-case to PascalCase (e.g. shopping-bag -> ShoppingBag)
  const pascalName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const LucideIcon = (icons as any)[pascalName];

  if (!LucideIcon) {
    return <span className={className}>{name.charAt(0).toUpperCase()}</span>; // fallback
  }

  return <LucideIcon size={size} className={className} />;
}
