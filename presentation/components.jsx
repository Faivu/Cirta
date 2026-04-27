// Shared deck components

const CIRTA_BLUE = '#2631E6';
const CIRTA_AMBER = '#E6960D';
const INK = '#111827';
const MUTE = '#6B7280';
const PAPER = '#FAFAF7';
const LINE = '#E5E7EB';

// ---- Slide chrome (logo + slide number) ----
function SlideChrome({ index, total }) {
  return (
    <div className="slide-chrome">
      <div className="corner-mark corner-mark--left">
        <CirtaLogoMark />
        <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>Cirta</span>
        <span style={{ color: MUTE, fontWeight: 400 }}>· FYP 2026</span>
      </div>
      <div className="corner-mark corner-mark--right">
        <span>{String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// Simple logo mark — abstract clock/circle
function CirtaLogoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
      <rect width="24" height="24" rx="6" fill={CIRTA_BLUE} />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M12 7.5 V 12 L 15.2 13.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ---- Striped placeholder ----
function Placeholder({ label, height = '100%', width = '100%', stripeAngle = 135 }) {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <div className="placeholder" style={{
        background: `repeating-linear-gradient(${stripeAngle}deg, #EFEFEA 0 14px, #E6E6DF 14px 28px)`,
      }}>
        <div className="placeholder__label">{label}</div>
      </div>
    </div>
  );
}

// ---- Browser frame (clean, minimal — for screenshots) ----
function BrowserFrame({ url = 'cirta.app', children, height, width = '100%', accent = false }) {
  return (
    <div style={{
      width, height,
      background: '#fff',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 24px 60px rgba(17,24,39,0.10), 0 2px 6px rgba(17,24,39,0.06), 0 0 0 1px rgba(17,24,39,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 40,
        background: '#F4F4EE',
        borderBottom: `1px solid ${LINE}`,
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5635A' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5C04A' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#65C467' }} />
        </div>
        <div style={{
          marginLeft: 14, flex: 1, height: 22,
          background: '#fff',
          border: `1px solid ${LINE}`,
          borderRadius: 6,
          display: 'flex', alignItems: 'center', padding: '0 10px',
          fontFamily: 'var(--font-mono)', fontSize: 12, color: MUTE,
          maxWidth: 320,
        }}>
          <span style={{ color: accent ? CIRTA_BLUE : MUTE, marginRight: 6 }}>●</span>
          {url}
        </div>
      </div>
      <div style={{ flex: 1, background: '#fff', overflow: 'hidden', position: 'relative' }}>
        {children || <Placeholder label="[ APP SCREENSHOT ]" />}
      </div>
    </div>
  );
}

// ---- Panel title (uppercase mono with rule) ----
function PanelTitle({ children, color = CIRTA_BLUE }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 16,
      letterSpacing: '0.06em', textTransform: 'uppercase', color,
    }}>
      <span style={{ width: 28, height: 2, background: color, display: 'inline-block' }} />
      {children}
    </div>
  );
}

// ---- Numbered marker ----
function NumMarker({ n, color = CIRTA_BLUE, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: size * 0.45, fontWeight: 500,
      flexShrink: 0,
    }}>{n}</div>
  );
}

Object.assign(window, {
  SlideChrome, CirtaLogoMark, Placeholder, BrowserFrame, PanelTitle, NumMarker,
  CIRTA_BLUE, CIRTA_AMBER, INK, MUTE, PAPER, LINE,
});
