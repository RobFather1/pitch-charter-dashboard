import './InfoHeader.css';

function InfoHeader({ title, info }) {
  return (
    <div className="info-header">
      <div className="info-header-row">
        <span className="info-header-title">{title}</span>
        <div className="info-tooltip-wrapper">
          <button className="info-btn" aria-label="What does this mean?">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
              <rect x="6.4" y="6" width="1.2" height="4.5" rx="0.5" fill="currentColor" />
              <circle cx="7" cy="4" r="0.8" fill="currentColor" />
            </svg>
          </button>
          <div className="info-tooltip" role="tooltip">
            {info}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoHeader;
