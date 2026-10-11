const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
export const formatMoney = (n) => money.format(Number(n ?? 0));

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/** Turns an Axios error into one readable sentence for the user. */
export function errMsg(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ERR_NETWORK' || !err.response) return 'Cannot reach the server. Check that the backend is running.';
  return 'Something went wrong. Please try again.';
}
