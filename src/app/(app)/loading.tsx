/** Shown in the main area while an authenticated page streams in. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="is-sr-only">Loading…</span>
      <div className="skeleton-lines">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}
