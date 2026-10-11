import CrudPage from '../components/CrudPage';

// Stock records are created automatically with each product, so this page only edits them.
export default function Inventory() {
  return (
    <CrudPage
      title="Inventory" noun="stock record" endpoint="/inventory"
      subtitle="Stock on hand for every product. Items at or below the reorder level are flagged."
      allowCreate={false} canDelete={false}
      columns={[
        { label: 'Product', render: (r) => r.product?.name },
        { label: 'SKU', render: (r) => r.product?.sku },
        { label: 'In stock', align: 'right', render: (r) => r.quantity },
        { label: 'Reorder level', align: 'right', render: (r) => r.reorderLevel },
        { label: 'Status', render: (r) => r.quantity <= r.reorderLevel
            ? <span className="chip chip-low">Reorder now</span>
            : <span className="chip chip-ok">In stock</span> },
        { label: 'Last updated', render: (r) => r.lastUpdated ? new Date(r.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
      ]}
      fields={[
        { name: 'quantity', label: 'Quantity in stock', type: 'number', required: true },
        { name: 'reorderLevel', label: 'Reorder level', type: 'number', required: true,
          hint: 'You are warned when stock falls to this number or below.' },
      ]}
      toForm={(r) => ({ quantity: r.quantity, reorderLevel: r.reorderLevel })}
    />
  );
}
