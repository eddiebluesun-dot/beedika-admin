// Badge de status
export function Badge({ label, color = 'gray' }) {
  const colors = {
    green:  { bg: '#dcfce7', text: '#166534' },
    red:    { bg: '#fee2e2', text: '#991b1b' },
    yellow: { bg: '#fef9c3', text: '#854d0e' },
    blue:   { bg: '#dbeafe', text: '#1e40af' },
    purple: { bg: '#ede9fe', text: '#6d28d9' },
    gray:   { bg: '#f3f4f6', text: '#374151' },
    amber:  { bg: '#fef3c7', text: '#92400e' },
  };
  const { bg, text } = colors[color] ?? colors.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 99,
      background: bg, color: text,
      fontSize: 12, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

// KPI Card
export function KpiCard({ icon, label, value, sub, color = '#f5c842' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      border: '1px solid #e8e5dc', display: 'flex', gap: 16, alignItems: 'center',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: color + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value ?? '...'}</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Page header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Button
export function Btn({ onClick, children, variant = 'primary', disabled }) {
  const styles = {
    primary:   { background: '#f5c842', color: '#333', border: 'none' },
    secondary: { background: '#fff', color: '#333', border: '1px solid #ddd' },
    danger:    { background: '#fee2e2', color: '#dc2626', border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 20px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
      opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s',
      ...styles[variant],
    }}>
      {children}
    </button>
  );
}

// Form field helper
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type} value={value ?? ''} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      style={{
        width: '100%', padding: '10px 14px', border: '1px solid #e0ddd6',
        borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit',
        background: disabled ? '#f9f9f9' : '#fff', boxSizing: 'border-box',
      }}
    />
  );
}

export function Select({ value, onChange, children, disabled }) {
  return (
    <select value={value ?? ''} onChange={onChange} disabled={disabled} style={{
      width: '100%', padding: '10px 14px', border: '1px solid #e0ddd6',
      borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit',
      background: disabled ? '#f9f9f9' : '#fff', boxSizing: 'border-box',
    }}>
      {children}
    </select>
  );
}
