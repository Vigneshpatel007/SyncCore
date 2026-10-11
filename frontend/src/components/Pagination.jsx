/** Pagination UI: Previous / page X of Y / Next. The parent slices the data. */
export default function Pagination({ page, pageCount, total, pageSize, onChange }) {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <nav className="pager" aria-label="Pagination">
      <span>Showing {from}–{to} of {total}</span>
      <div>
        <button className="btn btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
        <span className="pager-page">Page {page} of {pageCount}</span>
        <button className="btn btn-sm" disabled={page === pageCount} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </nav>
  );
}
