import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlaceholderImage({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid min-h-64 place-items-center overflow-hidden rounded-[1.75rem] border border-line bg-paper-deep text-center",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full border border-accent/20" />
      <div className="absolute -bottom-28 -left-16 h-60 w-60 rounded-full bg-accent/8 blur-2xl" />
      <div className="relative px-6 text-ink-soft">
        <ImageIcon className="mx-auto mb-4 size-7 text-accent" strokeWidth={1.5} />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
