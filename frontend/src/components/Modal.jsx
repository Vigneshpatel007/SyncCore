import { useEffect } from 'react';

/** Reusable dialog used for Add / Edit / Delete / Order details. Closes on Esc or clicking outside. */
export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey); // cleanup when the modal closes
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}
           onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </header>
        {children}
      </div>
    </div>
  );
}
