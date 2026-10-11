import useFetch from '../hooks/useFetch';
import StateMessage from '../components/StateMessage';
import { formatDate, formatMoney } from '../utils/format';

export default function Reports() {
  const sales = useFetch('/reports/sales-by-date');
  const top = useFetch('/reports/top-products');
  const low = useFetch('/inventory/low-stock');

  const max = Math.max(1, ...sales.data.map((p) => Number(p.revenue)));

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p className="muted">Sales, best sellers and stock risk. Cancelled orders are excluded.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Revenue by day</h2></div>
        <StateMessage loading={sales.loading} error={sales.error} onRetry={sales.reload}
                      empty={!sales.loading && !sales.error && sales.data.length === 0}
                      emptyText="No completed sales yet. Revenue appears here after your first order." />
        {sales.data.length > 0 && (
          <ul className="bars">
            {sales.data.map((p) => (
              <li key={p.date}>
                <span className="bar-label">{formatDate(p.date)}</span>
                <span className="bar-track"><span className="bar-fill" style={{ width: `${(Number(p.revenue) / max) * 100}%` }} /></span>
                <span className="bar-value num">{formatMoney(p.revenue)}<small className="muted"> · {p.orders} {p.orders === 1 ? 'order' : 'orders'}</small></span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Best-selling products</h2></div>
          <StateMessage loading={top.loading} error={top.error} onRetry={top.reload}
                        empty={!top.loading && !top.error && top.data.length === 0} emptyText="No sales data yet." />
          {top.data.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Product</th><th className="num">Units sold</th><th className="num">Revenue</th></tr></thead>
                <tbody>
                  {top.data.map((p) => (
                    <tr key={p.name}><td>{p.name}</td><td className="num">{p.unitsSold}</td><td className="num">{formatMoney(p.revenue)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h2>Low-stock report</h2></div>
          <StateMessage loading={low.loading} error={low.error} onRetry={low.reload}
                        empty={!low.loading && !low.error && low.data.length === 0} emptyText="No products need reordering." />
          {low.data.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Product</th><th className="num">In stock</th><th className="num">Reorder at</th></tr></thead>
                <tbody>
                  {low.data.map((i) => (
                    <tr key={i.id}><td>{i.product?.name}</td><td className="num text-bad">{i.quantity}</td><td className="num">{i.reorderLevel}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
