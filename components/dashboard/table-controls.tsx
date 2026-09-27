import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  activeClassName?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-wrap items-center rounded-md border border-border/80 bg-card p-0.5 text-xs"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "px-2.5 py-1 rounded transition-colors font-medium",
              active
                ? opt.activeClassName ?? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
            {typeof opt.count === "number" ? ` (${opt.count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn("relative flex-1 max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 bg-card border-border/80 text-sm"
      />
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  options: SelectOption[];
  className?: string;
}

export function FilterSelect({ value, onChange, ariaLabel, options, className }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={cn(
        "h-8 rounded-md border border-border/80 bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}