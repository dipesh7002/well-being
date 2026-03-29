export function EmptyState({ title, description, action }) {
  return (
    <div className="surface-card-muted text-center">
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      <p className="mt-2 text-sm text-stone-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

