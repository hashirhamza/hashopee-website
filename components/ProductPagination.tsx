export default function ProductPagination({ page, pageSize, total, onChange }: {
 page: number;
 pageSize: number;
 total: number;
 onChange: (page: number) => void;
}) {
 const pages = Math.ceil(total / pageSize);
 if (pages < 2) return null;
 return (
  <nav className="product-pagination" aria-label="Product pagination">
   <p aria-live="polite">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} products · Page {page} of {pages}</p>
   <div>
    <button type="button" className="subtle-button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
    <button type="button" className="subtle-button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
   </div>
  </nav>
 );
}
