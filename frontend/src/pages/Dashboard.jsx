import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import StateMessage from '../components/StateMessage';
import { formatDate, formatMoney } from '../utils/format';

/** Admin-only KPI strip. It is a separate component so employees never even call the admin API. */
function AdminKpis() {
  const { data: s, loading, error, reload } = useFetch('/reports/summary');
  if (loading || error) return <div className="card"><StateMessage loading={loading} error={error} onRetry={reload} /></div>;
  const items = [
    ['Revenue (completed sales)', formatMoney(s.revenue)],
    ['Orders', s.orders],
    ['Products', s.products],
    ['Customers', s.customers],
    ['Suppliers', s.suppliers],
    ['Employees', s.employees],
  ];
  return (
    <div className="kpis">
      {items.map(([label, value], i) => (
        <div className={`kpi ${i === 0 ? 'kpi-lead' : ''}`} key={label}>
          <span className="kpi-value">{value}</span>
          <span className="kpi-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const low = useFetch('/inventory/low-stock');
  const orders = useFetch('/orders');

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Welcome back, {user.username}</h1>
          <p className="muted">{isAdmin ? 'Here is how the business is doing.' : 'Here is what needs attention today.'}</p>
        </div>
        <Link to="/orders" className="btn btn-primary">Record a sale</Link>
      </div>

      {isAdmin && <AdminKpis />}

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Stock to reorder</h2><Link to="/inventory">Open inventory</Link></div>
          <StateMessage loading={low.loading} error={low.error} onRetry={low.reload}
                        empty={!low.loading && !low.error && low.data.length === 0}
                        emptyText="Every product is above its reorder level." />
          {!low.loading && !low.error && low.data.length > 0 && (
            <ul className="list">
              {low.data.map((i) => (
                <li key={i.id}>
                  <div><strong>{i.product?.name}</strong><small className="muted">{i.product?.sku}</small></div>
                  <span className="chip chip-low">{i.quantity} left · reorder at {i.reorderLevel}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h2>Recent orders</h2><Link to="/orders">All orders</Link></div>
          <StateMessage loading={orders.loading} error={orders.error} onRetry={orders.reload}
                        empty={!orders.loading && !orders.error && orders.data.length === 0}
                        emptyText="No orders yet." />
          {!orders.loading && !orders.error && orders.data.length > 0 && (
            <ul className="list">
              {orders.data.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <div><strong>#{o.id} · {o.customer?.name}</strong><small className="muted">{formatDate(o.orderDate)}</small></div>
                  <span className="num">{formatMoney(o.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
