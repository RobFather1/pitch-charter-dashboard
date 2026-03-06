import { useState } from 'react';
import './InfoHeader.css';

function InfoHeader({ title, info }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="info-header">
      <div className="info-header-row">
        <span className="info-header-title">{title}</span>
        <button
          className={`info-btn${open ? ' info-btn--active' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="What does this mean?"
        >
          ⓘ
        </button>
      </div>
      {open && <p className="info-panel">{info}</p>}
    </div>
  );
}

export default InfoHeader;
