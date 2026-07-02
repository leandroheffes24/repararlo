import {
  Wrench,
  Zap,
  BrickWall,
  Flame,
  PaintRoller,
  Hammer,
  AirVent,
  KeyRound,
  Sprout,
  Sparkles,
  Truck,
  Anvil,
  HardHat,
  Layers,
  WashingMachine,
  LayoutGrid,
  Bug,
  Frame,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  plomeria: Wrench,
  electricidad: Zap,
  albanileria: BrickWall,
  gas: Flame,
  pintura: PaintRoller,
  carpinteria: Hammer,
  "aire-acondicionado": AirVent,
  cerrajeria: KeyRound,
  jardineria: Sprout,
  limpieza: Sparkles,
  "mudanzas-fletes": Truck,
  herreria: Anvil,
  techista: HardHat,
  durlock: Layers,
  electrodomesticos: WashingMachine,
  "pisos-ceramica": LayoutGrid,
  fumigacion: Bug,
  vidrieria: Frame,
};

/** Ícono SVG del rubro (reemplaza a los emojis). */
export function CategoryIcon({
  slug,
  className = "h-5 w-5",
}: {
  slug: string;
  className?: string;
}) {
  const Icon = ICONS[slug] ?? Wrench;
  return <Icon className={className} aria-hidden="true" />;
}
