import { useMemo, useState } from 'react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Pagination from './Pagination';
import StateMessage from './StateMessage';
import { errMsg } from '../utils/format';

const PAGE_SIZE = 8;

function Options({ options, field, value, disabled, onChange }) {
  return (
    <select id={field.name} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      <option value="">{field.placeholder || 'Select…'}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Options loaded from the API (e.g. the supplier list for a product)
function RemoteSelect({ field, ...rest }) {
  const { data } = useFetch(field.optionsEndpoint);
  const options = data.map((o) => ({ value: o.id, label: field.optionLabel(o) }));
  return <Options options={options} field={field} {...rest} />;
}

function SelectInput({ field, ...rest }) {
  return field.options
    ? <Options options={field.options} field={field} {...rest} />
    : <RemoteSelect field={field} {...rest} />;
}

/* ---------- one form input (text / number / date / select) ---------- */
function Field({ field, value, onChange, error, disabled, isNew }) {
  const required = field.required || (field.requiredOnCreate && isNew);
  return (
    <div className={`field ${error ? 'field-invalid' : ''}`}>
      <label htmlFor={field.name}>{field.label}{required && <span className="req"> *</span>}</label>
      {field.type === 'select' ? (
        <SelectInput field={field} value={value} onChange={onChange} disabled={disabled} />
      ) : (
        <input id={field.name} type={field.type || 'text'} value={value} disabled={disabled}
               step={field.type === 'number' ? field.step || '1' : undefined}
               min={field.type === 'number' ? 0 : undefined}
               placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {error && <p className="field-error">{error}</p>}
      {!error && field.hint && <p className="field-hint">{field.hint}</p>}
    </div>
  );
}

/**
 * REUSABLE COMPONENT: one page component that gives a complete CRUD screen
 * (table, search, pagination, add/edit modal with validation, delete confirmation).
 * Products, Customers, Suppliers, Employees and Inventory are all just a configuration of this component.
 */
export default function CrudPage({
  title, subtitle, endpoint, columns, fields, toForm,
  noun = 'record', allowCreate = true, canDelete = true, adminOnlyDelete = true,
}) {
  const { isAdmin } = useAuth();
  const { data, loading, error, reload } = useFetch(endpoint);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);   // null = closed, {} = new, row = editing that row
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});       // field-level errors
  const [banner, setBanner] = useState('');       // form-level error from the server
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [pageError, setPageError] = useState('');

  const blank = () => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? '']));

  // Search: filter rows whose text contains the query. useMemo = only recompute when inputs change.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? data.filter((row) => JSON.stringify(row).toLowerCase().includes(q)) : data;
  }, [data, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openNew = () => { setForm(blank()); setErrors({}); setBanner(''); setEditing({}); };
  const openEdit = (row) => { setForm({ ...blank(), ...toForm(row) }); setErrors({}); setBanner(''); setEditing(row); };
  const closeForm = () => setEditing(null);

  const isNew = editing && !editing.id;

  const save = async (e) => {
    e.preventDefault();
    // 1) client-side validation (instant feedback)
    const found = {};
    fields.forEach((f) => {
      if (f.createOnly && !isNew) return;
      const required = f.required || (f.requiredOnCreate && isNew);
      if (required && String(form[f.name]).trim() === '') found[f.name] = 'This field is required';
    });
    if (Object.keys(found).length) { setErrors(found); return; }

    // 2) build the JSON body: empty -> null, numbers -> Number
    const payload = {};
    fields.forEach((f) => {
      let v = form[f.name];
      if (v === '' || v === undefined) v = null;
      if (v !== null && (f.type === 'number' || (f.type === 'select' && f.asNumber))) v = Number(v);
      payload[f.name] = v;
    });

    // 3) POST for new, PUT for existing
    setSaving(true);
    setBanner('');
    try {
      if (isNew) await api.post(endpoint, payload);
      else await api.put(`${endpoint}/${editing.id}`, payload);
      closeForm();
      reload();
    } catch (err) {
      // 4) server-side validation errors arrive as {errors: {field: message}}
      setErrors(err.response?.data?.errors || {});
      setBanner(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${endpoint}/${deleting.id}`);
      setDeleting(null);
      setPageError('');
      reload();
    } catch (err) {
      setDeleting(null);
      setPageError(errMsg(err));
    }
  };

  const showDelete = canDelete && (!adminOnlyDelete || isAdmin);

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        {allowCreate && <button className="btn btn-primary" onClick={openNew}>Add {noun}</button>}
      </div>

      <div className="card">
        <div className="toolbar">
          <input className="search" type="search" placeholder={`Search ${title.toLowerCase()}…`} value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label={`Search ${title}`} />
          <span className="muted">{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</span>
        </div>

        {pageError && <div className="banner banner-error" role="alert">{pageError}</div>}

        <StateMessage loading={loading} error={error} onRetry={reload}
                      empty={!loading && !error && filtered.length === 0}
                      emptyText={search ? 'No matches. Try a different search.' : `No ${title.toLowerCase()} yet. Use “Add ${noun}” to create the first one.`} />

        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((c) => <th key={c.label} className={c.align === 'right' ? 'num' : ''}>{c.label}</th>)}
                  <th className="actions-col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => (
                      <td key={c.label} className={c.align === 'right' ? 'num' : ''} data-label={c.label}>
                        {c.render ? c.render(row) : (row[c.key] ?? '—')}
                      </td>
                    ))}
                    <td className="actions">
                      <button className="btn btn-sm" onClick={() => openEdit(row)}>Edit</button>
                      {showDelete && <button className="btn btn-sm btn-danger" onClick={() => setDeleting(row)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={safePage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {editing && (
        <Modal title={isNew ? `Add ${noun}` : `Edit ${noun}`} onClose={closeForm}>
          <form onSubmit={save} noValidate>
            {banner && <div className="banner banner-error" role="alert">{banner}</div>}
            <div className="form-grid">
              {fields.filter((f) => !(f.createOnly && !isNew)).map((f) => (
                <Field key={f.name} field={f} value={form[f.name] ?? ''} error={errors[f.name]} isNew={isNew}
                       disabled={f.editable === false && !isNew}
                       onChange={(v) => { setForm({ ...form, [f.name]: v }); setErrors({ ...errors, [f.name]: undefined }); }} />
              ))}
            </div>
            <footer className="modal-foot">
              <button type="button" className="btn" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </footer>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title={`Delete ${noun}`} onClose={() => setDeleting(null)}>
          <p>This permanently removes <strong>{deleting.name || deleting.fullName || `#${deleting.id}`}</strong>. This cannot be undone.</p>
          <footer className="modal-foot">
            <button className="btn" onClick={() => setDeleting(null)}>Keep it</button>
            <button className="btn btn-danger-solid" onClick={confirmDelete}>Delete {noun}</button>
          </footer>
        </Modal>
      )}
    </section>
  );
}
