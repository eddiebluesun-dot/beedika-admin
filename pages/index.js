// pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getDashboard } from '../lib/api';

function KpiCard({ icon, label, value, sub, color = '#F5A623' }) {
  return (
    <div
      className="card card-hover"
      style={{ padding: '20px 24px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {label}
          </div>
          <div
            className="font-display"
            style={{ fontSize: 32, fontWeight: 800, color: '#E8EBF0', letterSpacing: '-0.03em', lineHeight: 1 }}
          >
            {value ?? '—'}
          </div>
          {sub && (
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }}>{sub}</div>
          )}
        </div>
        <span style={{ fontSize: 22, opacity: 0.8 }}>{icon}</span>
      </div>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#34D399' : score >= 60 ? '#F5A623' : score >= 40 ? '#FB923C' : '#F87171';
  return (
    <span
      style={{
        display: 'inline-block',
        background: `${color}18`,
        color,
        border: `1px solid ${color}30`,
        borderRadius: 6,
        padding: '2px 8px',
        fontSize: 12,
        fontFamily: 'var(--font-dm-mono)',
        fontWeight: 500,
      }}
    >
      {score ?? '—'}
    </span>
  );
}

function LeadStatusBadge({ status }) {
  const map = {
    novo: 'badge-yellow',
    qualificado: 'badge-green',
    enviado_parceiro: 'badge-blue',
    convertido: 'badge-green',
    perdido: 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status}</span>;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) return null;

  const kpis = data?.kpis || {};
  const leads = data?.ultimos_leads || [];

  return (
    <Layout title="Dashboard">
      {fetching ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--slate)' }}>
          <div style={{ width: 16, height: 16, border: '2px solid var(--honey)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Carregando...
        </div>
      ) : error ? (
        <div className="badge badge-red" style={{ fontSize: 13, padding: '8px 14px' }}>
          Erro: {error}
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* KPIs grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            <KpiCard icon="⚡" label="Total Leads" value={kpis.total_leads?.toLocaleString('pt-BR')} sub={`${kpis.leads_altos || 0} score alto`} />
            <KpiCard icon="◉" label="Clientes" value={kpis.total_clientes?.toLocaleString('pt-BR')} sub={`${kpis.assinaturas_ativas || 0} ativos`} />
            <KpiCard icon="📄" label="Contas" value={kpis.total_bills?.toLocaleString('pt-BR')} />
            <KpiCard icon="◆" label="Parceiros" value={kpis.total_parceiros?.toLocaleString('pt-BR')} />
            <KpiCard icon="🐝" label="EnerScore Médio" value={kpis.enerscore_medio} sub="média geral" />
            <KpiCard icon="💰" label="Economia Total" value={kpis.economia_total ? `R$\u00A0${(kpis.economia_total / 1000).toFixed(1)}k` : '—'} sub="potencial mensal" />
          </div>

          {/* Últimos Leads */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: '#E8EBF0' }}>
                Últimos Leads
              </span>
              <a href="/leads" style={{ fontSize: 12, color: 'var(--honey)', textDecoration: 'none' }}>
                Ver todos →
              </a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Nome', 'Cidade', 'EnerScore', 'Economia/mês', 'Status', 'Data'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px 16px', color: 'var(--slate)', textAlign: 'center' }}>
                        Nenhum lead ainda
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
                        <td style={{ padding: '12px 16px', color: '#E8EBF0', fontWeight: 500 }}>
                          {lead.nome_completo || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)' }}>
                          {lead.cidade ? `${lead.cidade}/${lead.uf}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <ScoreBadge score={lead.enerscore} />
                        </td>
                        <td style={{ padding: '12px 16px', color: '#34D399', fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}>
                          {lead.economia_potencial ? `R$ ${lead.economia_potencial.toLocaleString('pt-BR')}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <LeadStatusBadge status={lead.status_lead} />
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)', fontSize: 11 }}>
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
