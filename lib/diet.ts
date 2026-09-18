export const DIET_OPTIONS = [
  { value: "regular", label: "Sin restricciones" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "celiaco", label: "Celíaco/a" },
  { value: "sin_carne_viernes", label: "Abstinencia" },
] as const;

export type DietValue = (typeof DIET_OPTIONS)[number]["value"];

export const DIET_LABELS: Record<string, string> = Object.fromEntries(
  DIET_OPTIONS.map((o) => [o.value, o.label])
);

export function dietLabel(value: string): string {
  return DIET_LABELS[value] ?? value;
}

export const VALID_DIET_VALUES: Set<string> = new Set(
  DIET_OPTIONS.map((o) => o.value)
);
