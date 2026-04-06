import { useState } from 'react';

export default function DataTable({ columns, rows, onEdit, onDelete, loading, emptyMsg = 'Nenhum registro' }) {
  const [search, setSearch] = useState('');

  const filtered = rows?.filter(r =>
    columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar..."
          style={{
            padding: '10px 14px', border: '1px solid #e0ddd6', borderRadius: 8,
            fontSize: 14, width: '100%', maxWidth: 340, outline: 'none',
            fontFamily: 'inherit', background: '#fff',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, border: '1px solid #e8e5dc' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>{emptyMsg}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0ede4' }}>
                {columns.map(c => (
                  <th key={c.key} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 12,
                    fontWeight: 600, color: '#888', textTransform: 'uppercase',
                    letterSpacing: '0.5px', background: '#fafaf8', whiteSpace: 'nowrap',
                  }}>
                    {c.label}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th style={{ padding: '12px 16px', background: '#fafaf8', width: 100 }}></th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id ?? i} style={{
                  borderBottom: '1px solid #f5f3ee',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(c => (
                    <td key={c.key} style={{ padding: '12px 16px', fontSize: 14, color: '#333', maxWidth: 260 }}>
                      {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {onEdit && (
                          <button onClick={() => onEdit(row)} style={btnStyle('#f5c842', '#333')}>
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => {
                            if (confirm(`Excluir este registro?`)) onDelete(row);
                          }} style={btnStyle('#fee2e2', '#dc2626')}>
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          {filtered.length} registro(s)
        </div>
      )}
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    background: bg, color, border: 'none', borderRadius: 6,
    padding: '6px 10px', cursor: 'pointer', fontSize: 14,
    transition: 'opacity 0.15s',
  };
}
