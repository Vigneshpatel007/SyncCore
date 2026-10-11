/** One component for the three non-happy states of a list: loading, error (with Retry), empty. */
export default function StateMessage({ loading, error, empty, emptyText, onRetry }) {
  if (loading) return <div className="state"><span className="spinner" aria-hidden="true" /> Loading…</div>;
  if (error) {
    return (
      <div className="state state-error" role="alert">
        <p>{error}</p>
        {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
      </div>
    );
  }
  if (empty) return <div className="state">{emptyText || 'Nothing here yet.'}</div>;
  return null;
}
