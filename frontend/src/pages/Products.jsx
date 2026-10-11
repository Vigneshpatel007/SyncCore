import CrudPage from '../components/CrudPage';
import { formatMoney } from '../utils/format';

export default function Products() {
  return (
    <CrudPage
      title="Products" noun="product" endpoint="/products"
      subtitle="Your catalog: code, category, price and supplier."
      columns={[
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { label: 'Supplier', render: (r) => r.supplier?.name ?? '—' },
        { label: 'Unit price', align: 'right', render: (r) => formatMoney(r.unitPrice) },
      ]}
      fields={[
        { name: 'name', label: 'Product name', required: true },
        { name: 'sku', label: 'SKU (product code)', required: true, placeholder: 'e.g. ELE-003' },
        { name: 'category', label: 'Category' },
        { name: 'unitPrice', label: 'Unit price (₹)', type: 'number', step: '0.01', required: true },
        { name: 'supplierId', label: 'Supplier', type: 'select', asNumber: true,
          optionsEndpoint: '/suppliers', optionLabel: (s) => s.name, placeholder: 'No supplier' },
        { name: 'initialStock', label: 'Opening stock', type: 'number', createOnly: true, defaultValue: 0,
          hint: 'After creation, change stock from the Inventory page.' },
        { name: 'reorderLevel', label: 'Reorder level', type: 'number', createOnly: true, defaultValue: 10 },
      ]}
      toForm={(r) => ({ name: r.name, sku: r.sku, category: r.category ?? '', unitPrice: r.unitPrice, supplierId: r.supplier?.id ?? '' })}
    />
  );
}
