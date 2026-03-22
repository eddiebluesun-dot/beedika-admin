// pages/leads.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getLeads, updateLead } from '../lib/api';

const STATUS_OPTIONS = ['novo', 'qualificado', 'contatado', 'enviado_parceiro', 'convertido', 'perdido'];
const CLASS_OPTIONS = ['OURO', 'PRATA', 'BRONZE', 'DESCARTE'];
const UF_OPTIONS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#34D399' : score >= 60 ? '#F5A623' : score >= 40 ? '#FB923C' : '#F87171';
  return (
    <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontFamily: 'var(--font-dm-mono)', fontWeight: 500 }}>
      {score ?? '—'}
    </span>
  );
}

function ClassBadge({ cls }) {
  const map = { OURO: 'badge-yellow', PRATA: 'badge-slate', BRONZE: 'badge-slate', DESCARTE: 'badge-red' };
  return <span className={`badge ${map[cls] || 'badge-slate'}`}>{cls || '—'}</span>;
}

function StatusSelect({ value, leadId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const handleChange = async (e) => {
    setLoading(true);
    try {
      await updateLead(leadId, { status_lead: e.target.value });
      onUpdate(leadId, { status_lead: e.target.value });
    } catch {}
    setLoading(false);
  };
  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={loading}
      style={{
        background: 'var(--dark-600)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
        color: '#E8EBF0',
        fontSize: 12,
        padding: '4px 8px',
        cursor: 'pointer',
        fontFamily: 'var(--font-dm-sans)',
        opacity: loading ? 0.5 : 1,
      }}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

export default function Leads() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [filters, setFilters] = useState({ status: '', uf: '', classificacao: '', page: 1 });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    const params = { limit: 50, ...filters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    getLeads(params)
      .then((d) => { setLeads(d.leads || []); setTotal(d.total || 0); })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [user, filters]);

  const handleUpdate = (id, changes) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));
  };

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  if (loading || !user) return null;

  return (
    <Layout title="Leads">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Filters */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Filtros
          </span>

          {[
            { key: 'status', label: 'Status', options: STATUS_OPTIONS },
            { key: 'classificacao', label: 'Classe', options: CLASS_OPTIONS },
            { key: 'uf', label: 'UF', options: UF_OPTIONS },
          ].map(({ key, label, options }) => (
            <select
              key={key}
              value={filters[key]}
              onChange={(e) => setFilter(key, e.target.value)}
              style={{ background: 'var(--dark-700)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: filters[key] ? '#E8EBF0' : 'var(--slate)', fontSize: 13, padding: '7px 10px', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)' }}
            >
              <option value="">{label}</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {(filters.status || filters.uf || filters.classificacao) && (
            <button
              className="btn-ghost"
              onClick={() => setFilters({ status: '', uf: '', classificacao: '', page: 1 })}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              Limpar
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)' }}>
            {total} leads
          </span>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {fetching ? (
            <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--slate)' }}>
              <div style={{ width: 16, height: 16, border: '2px solid var(--honey)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Carregando leads...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Nome', 'Telefone', 'Cidade/UF', 'Consumo', 'Valor', 'EnerScore', 'Classe', 'Status', 'Data'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '32px', color: 'var(--slate)', textAlign: 'center' }}>
                        Nenhum lead encontrado
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '11px 14px', color: '#E8EBF0', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {lead.nome_completo || '—'}
                        </td>
                        <td style={{ padding: '11px 14px', color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}>
                          {lead.telefone || '—'}
                        </td>
                        <td style={{ padding: '11px 14px', color: 'var(--slate)', whiteSpace: 'nowrap' }}>
                          {lead.cidade ? `${lead.cidade}/${lead.uf}` : lead.uf || '—'}
                        </td>
                        <td style={{ padding: '11px 14px', color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}>
                          {lead.consumo_kwh ? `${lead.consumo_kwh} kWh` : '—'}
                        </td>
                        <td style={{ padding: '11px 14px', color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}>
                          {lead.valor_conta ? `R$ ${lead.valor_conta.toLocaleString('pt-BR')}` : '—'}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <ScoreBadge score={lead.enerscore} />
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <ClassBadge cls={lead.classificacao_lead} />
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <StatusSelect value={lead.status_lead} leadId={lead.id} onUpdate={handleUpdate} />
                        </td>
                        <td style={{ padding: '11px 14px', color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)', fontSize: 11, whiteSpace: 'nowrap' }}>
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
