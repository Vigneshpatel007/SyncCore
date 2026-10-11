import { useMemo, useState } from 'react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StateMessage from '../components/StateMessage';
import { errMsg, formatDate, formatMoney } from '../utils/format';

const PAGE_SIZE = 8;
const statusChip = { COMPLETED: 'chip-ok', CANCELLED: 'chip-cancel', PENDING: 'chip-low' };

/* ---------- Create-order dialog: pick customer, add lines, see live total ---------- */
function NewOrderModal({ onClose, onCreated }) {
  const customers = useFetch('/customers');
  const products = useFetch('/products');
  const inventory = useFetch('/inventory');

  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([{ productId: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // productId -> quantity available, used to warn before the server rejects the order
  const stockByProduct = useMemo(
    () => Object.fromEntries(inventory.data.map((i) => [i.product?.id, i.quantity])),
    [inventory.data]
  );
  const priceOf = (id) => Number(products.data.find((p) => p.id === Number(id))?.unitPrice ?? 0);

  const total = lines.reduce((sum, l) => sum + priceOf(l.productId) * (Number(l.quantity) || 0), 0);

  const setLine = (i, patch) => setLines(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () => setLines([...lines, { productId: '', quantity: 1 }]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    const items = lines.filter((l) => l.productId).map((l) => ({ productId: Number(l.productId), quantity: Number(l.quantity) }));
    if (!customerId) return setError('Choose a customer.');
    if (items.length === 0) return setError('Add at least one product.');
    if (items.some((i) => !i.quantity || i.quantity < 1)) return setError('Every quantity must be at least 1.');

    setBusy(true); setError('');
    try {
      await api.post('/orders', { customerId: Number(customerId), items });
      onCreated();
    } catch (err) {
      setError(errMsg(err)); // e.g. "Not enough stock for Wireless Mouse (available: 3, requested: 5)"
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="New order" onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        {error && <div className="banner banner-error" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="customer">Customer <span className="req">*</span></label>
          <select id="customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="lines">
          <div className="line line-head"><span>Product</span><span>Qty</span><span className="num">Line total</span><span /></div>
          {lines.map((l, i) => {
            const available = stockByProduct[Number(l.productId)];
            const over = l.productId && Number(l.quantity) > available;
            return (
              <div className="line" key={i}>
                <div>
                  <select aria-label="Product" value={l.productId} onChange={(e) => setLine(i, { productId: e.target.value })}>
                    <option value="">Select a product…</option>
                    {products.data.map((p) => <option key={p.id} value={p.id}>{p.name} · {formatMoney(p.unitPrice)}</option>)}
                  </select>
                  {l.productId && <small className={over ? 'text-bad' : 'muted'}>{available ?? 0} in stock{over ? ' — not enough for this quantity' : ''}</small>}
                </div>
                <input aria-label="Quantity" type="number" min="1" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
                <span className="num">{formatMoney(priceOf(l.productId) * (Number(l.quantity) || 0))}</span>
                <button type="button" className="icon-btn" onClick={() => removeLine(i)} disabled={lines.length === 1} aria-label="Remove line">×</button>
              </div>
            );
          })}
          <button type="button" className="btn btn-sm" onClick={addLine}>Add another product</button>
        </div>

        <div className="order-total"><span>Order total</span><strong>{formatMoney(total)}</strong></div>
        <footer className="modal-foot">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save sale'}</button>
        </footer>
      </form>
    </Modal>
  );
}

/* ---------- Orders page ---------- */
export default function Orders() {
  const { data, loading, error, reload } = useFetch('/orders');
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [page, setPage] = useState(1);
  const [pageError, setPageError] = useState('');

  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = data.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const cancelOrder = async (order) => {
    try {
      await api.put(`/orders/${order.id}/cancel`);
      setViewing(null); setPageError(''); reload();
    } catch (err) {
      setPageError(errMsg(err));
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <p className="muted">Every sale, linked to a customer, products and the employee who handled it.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>New order</button>
      </div>

      <div className="card">
        {pageError && <div className="banner banner-error" role="alert">{pageError}</div>}
        <StateMessage loading={loading} error={error} onRetry={reload}
                      empty={!loading && !error && data.length === 0}
                      emptyText="No orders yet. Use “New order” to record the first sale." />
        {!loading && !error && data.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Handled by</th><th className="num">Total</th><th>Status</th><th /></tr></thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Order">#{o.id}</td>
                    <td data-label="Date">{formatDate(o.orderDate)}</td>
                    <td data-label="Customer">{o.customer?.name}</td>
                    <td data-label="Handled by">{o.employee?.fullName ?? '—'}</td>
                    <td className="num" data-label="Total">{formatMoney(o.totalAmount)}</td>
                    <td data-label="Status"><span className={`chip ${statusChip[o.status]}`}>{o.status[0] + o.status.slice(1).toLowerCase()}</span></td>
                    <td className="actions"><button className="btn btn-sm" onClick={() => setViewing(o)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={safePage} pageCount={pageCount} total={data.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {creating && <NewOrderModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); reload(); }} />}

      {viewing && (
        <Modal title={`Order #${viewing.id}`} onClose={() => setViewing(null)} wide>
          <p className="muted">{viewing.customer?.name} · {formatDate(viewing.orderDate)} · handled by {viewing.employee?.fullName ?? 'an administrator'}</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th className="num">Qty</th><th className="num">Unit price</th><th className="num">Line total</th></tr></thead>
              <tbody>
                {viewing.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.product?.name}</td>
                    <td className="num">{it.quantity}</td>
                    <td className="num">{formatMoney(it.unitPrice)}</td>
                    <td className="num">{formatMoney(it.unitPrice * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="order-total"><span>Total</span><strong>{formatMoney(viewing.totalAmount)}</strong></div>
          <footer className="modal-foot">
            <button className="btn" onClick={() => setViewing(null)}>Close</button>
            {viewing.status !== 'CANCELLED' && (
              <button className="btn btn-danger-solid" onClick={() => cancelOrder(viewing)}>Cancel order and restore stock</button>
            )}
          </footer>
        </Modal>
      )}
    </section>
  );
}
