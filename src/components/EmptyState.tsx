export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/85 p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-pitch/70" />
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/65">{text}</p>
    </div>
  );
}
