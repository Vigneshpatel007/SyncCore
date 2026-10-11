import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from './ErrorBoundary';

const sections = [
  { heading: 'Overview', links: [{ to: '/', label: 'Dashboard', end: true }] },
  { heading: 'Catalog & stock', links: [
    { to: '/products', label: 'Products' },
    { to: '/inventory', label: 'Inventory' },
    { to: '/suppliers', label: 'Suppliers' } ] },
  { heading: 'Sales', links: [
    { to: '/orders', label: 'Orders' },
    { to: '/customers', label: 'Customers' } ] },
  { heading: 'Administration', adminOnly: true, links: [
    { to: '/employees', label: 'Employees' },
    { to: '/reports', label: 'Reports' } ] },
];

/** The page frame: sidebar + top bar. <Outlet/> is where the current page is drawn. */
export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div><strong>SyncCore</strong><small>Business management</small></div>
        </div>
        <nav onClick={() => setOpen(false)}>
          {sections.filter((s) => !s.adminOnly || isAdmin).map((s) => (
            <div className="nav-group" key={s.heading}>
              <p className="nav-heading">{s.heading}</p>
              {s.links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
          <div className="topbar-user">
            <div className="avatar" aria-hidden="true">{user.username[0].toUpperCase()}</div>
            <div><strong>{user.username}</strong><small className={`role role-${user.role}`}>{user.role === 'ADMIN' ? 'Administrator' : 'Employee'}</small></div>
            <button className="btn btn-sm" onClick={handleLogout}>Log out</button>
          </div>
        </header>
        <main className="content">
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
