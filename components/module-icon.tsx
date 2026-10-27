import { Blocks, Database, Gauge, Network, Scale, Triangle, Waves } from "lucide-react";

const icons = { database: Database, scale: Scale, waves: Waves, gauge: Gauge, network: Network, triangle: Triangle, blocks: Blocks };

export function ModuleIcon({ name, className }: { name: keyof typeof icons; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.8} />;
}
