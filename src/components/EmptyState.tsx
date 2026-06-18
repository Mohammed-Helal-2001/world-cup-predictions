export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink/65">{text}</p>
    </div>
  );
}
