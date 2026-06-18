import { getMatchLabel } from "@/lib/format";

export function StatusBadge({ kickoffTime, status }: { kickoffTime: string; status: string }) {
  const label = getMatchLabel(kickoffTime, status);
  const color =
    label === "Prediction open"
      ? "bg-pitch/10 text-pitch"
      : label === "Result entered"
        ? "bg-gold/15 text-ink"
        : "bg-coral/10 text-coral";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{label}</span>;
}
