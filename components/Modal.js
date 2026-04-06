export default function Modal({ open, title, onClose, children, onSave, saving }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>{children}</div>

        {/* Footer */}
        {onSave && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ede4', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>
              Cancelar
            </button>
            <button onClick={onSave} disabled={saving} style={{
              padding: '10px 24px', border: 'none', borderRadius: 8,
              background: '#f5c842', color: '#333', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
