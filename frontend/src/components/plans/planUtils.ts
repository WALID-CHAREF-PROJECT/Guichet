import { PlanType } from '../../services/platformData';
import { PublicPlanZone } from '../../services/publicApi';

export type ZonePlanType = 'theatre' | 'stadium' | 'generic';
export type PlanZoneSelect = (zone: PublicPlanZone) => void;

export const unavailableColor = '#cbd5e1';
export const defaultZoneColor = '#f97316';

export const fallbackZones: Record<ZonePlanType, PublicPlanZone[]> = {
  theatre: [
    { id: 'vip', name: 'VIP', label: 'Premiers rangs premium', price: 650, capacity: 48, availableCapacity: 18, available: true, color: '#f59e0b', planType: 'theatre', sortOrder: 0 },
    { id: 'orchestre', name: 'Orchestre', label: 'Face scène', price: 320, capacity: 220, availableCapacity: 180, available: true, color: '#38bdf8', planType: 'theatre', sortOrder: 1 },
    { id: 'mezzanine', name: 'Mezzanine', label: 'Centre mezzanine', price: 260, capacity: 96, availableCapacity: 45, available: true, color: '#a78bfa', planType: 'theatre', sortOrder: 2 },
    { id: 'balcon', name: 'Balcon', label: 'Vue surélevée', price: 220, capacity: 160, availableCapacity: 100, available: true, color: '#818cf8', planType: 'theatre', sortOrder: 3 },
    { id: 'galerie', name: 'Galerie', label: 'Placement économique', price: 140, capacity: 180, availableCapacity: 120, available: true, color: '#14b8a6', planType: 'theatre', sortOrder: 4 },
  ],
  stadium: [
    { id: 'tribune-nord', name: 'Tribune Nord', label: 'Anneau haut nord', price: 120, capacity: 1200, availableCapacity: 640, available: true, color: '#22c55e', planType: 'stadium', sortOrder: 0 },
    { id: 'tribune-sud', name: 'Tribune Sud', label: 'Anneau bas sud', price: 120, capacity: 1200, availableCapacity: 580, available: true, color: '#14b8a6', planType: 'stadium', sortOrder: 1 },
    { id: 'tribune-est', name: 'Tribune Est', label: 'Latérale Est', price: 180, capacity: 900, availableCapacity: 340, available: true, color: '#3b82f6', planType: 'stadium', sortOrder: 2 },
    { id: 'tribune-ouest', name: 'Tribune Ouest', label: 'Latérale Ouest', price: 220, capacity: 820, availableCapacity: 260, available: true, color: '#6366f1', planType: 'stadium', sortOrder: 3 },
    { id: 'virage-nord', name: 'Virage Nord', label: 'Supporters Nord', price: 90, capacity: 1600, availableCapacity: 900, available: true, color: '#ef4444', planType: 'stadium', sortOrder: 4 },
    { id: 'virage-sud', name: 'Virage Sud', label: 'Supporters Sud', price: 90, capacity: 1500, availableCapacity: 760, available: true, color: '#f97316', planType: 'stadium', sortOrder: 5 },
    { id: 'vip', name: 'VIP', label: 'Loges présidentielles', price: 650, capacity: 120, availableCapacity: 40, available: true, color: '#eab308', planType: 'stadium', sortOrder: 6 },
  ],
  generic: [
    { id: 'premium', name: 'Premium', label: 'Meilleure visibilité', price: 360, capacity: 120, availableCapacity: 80, available: true, color: '#f59e0b', planType: 'generic', sortOrder: 0 },
    { id: 'central', name: 'Central', label: 'Zone centrale', price: 240, capacity: 240, availableCapacity: 160, available: true, color: '#38bdf8', planType: 'generic', sortOrder: 1 },
    { id: 'lateral', name: 'Latéral', label: 'Accès rapide', price: 180, capacity: 160, availableCapacity: 90, available: true, color: '#818cf8', planType: 'generic', sortOrder: 2 },
    { id: 'eco', name: 'Éco', label: 'Tarif accessible', price: 120, capacity: 220, availableCapacity: 140, available: true, color: '#14b8a6', planType: 'generic', sortOrder: 3 },
  ],
};

export function resolveZonePlanType(planType: PlanType | null | undefined): ZonePlanType {
  if (planType === 'stadium' || planType === 'generic') return planType;
  return 'theatre';
}

export function planZones(planType: PlanType | null | undefined): PublicPlanZone[] {
  return fallbackZones[resolveZonePlanType(planType)];
}

export function sortedZones(zones: PublicPlanZone[]): PublicPlanZone[] {
  return [...zones].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name));
}

export function isZoneSelectable(zone: PublicPlanZone): boolean {
  return zone.available && zone.availableCapacity > 0;
}

export function zoneBackground(zone: PublicPlanZone): string {
  return isZoneSelectable(zone) ? zone.color || defaultZoneColor : unavailableColor;
}

export function nameIncludes(value: string): (zone: PublicPlanZone) => boolean {
  return (zone) => `${zone.name} ${zone.label}`.toLowerCase().includes(value);
}

export function findZone(zones: PublicPlanZone[], matchers: Array<(zone: PublicPlanZone) => boolean>, fallbackIndex: number): PublicPlanZone | undefined {
  return matchers.map((matcher) => zones.find(matcher)).find(Boolean) ?? zones[fallbackIndex];
}
