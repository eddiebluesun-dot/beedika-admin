import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { KpiCard, PageHeader } from '../components/UI';
import { api } from '../lib/api';
import { getToken } from '../lib/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const SCORE_COLORS = { 'Excelente': '#22c55e', 'Bom': '#84cc16', 'Atenção': '#f59e0b', 'Crítico': '#ef4444' };

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.stats()
      .then(setStats)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: '👥', label: 'Clientes ativos',     value: stats?.clientes_total    ?? '—', color: '#6366f1' },
    { icon: '🎯', label: 'Leads qualificados',  value: stats?.leads_qualificados ?? '—', color: '#f59e0b' },
    { icon: '🤝', label: 'Parceiros ativos',    value: stats?.parceiros_ativos   ?? '—', color: '#10b981' },
    { icon: '⚡', label: 'EnerScore médio',     value: stats?.enerscore_medio    ? `${stats.enerscore_medio}/100` : '—', color: '#f5c842' },
    { icon: '📄', label: 'Análises realizadas', value: stats?.bills_total         ?? '—', color: '#8b5cf6' },
    { icon: '💰', label: 'Leads vendidos',       value: stats?.leads_vendidos      ?? '—', color: '#ec4899' },
  ];

  const chartData = stats?.leads_por_mes ?? [];
  const distData = stats?.por_distribuidora ?? [];

  return (
    <Layout title="Dashboard">
      <PageHeader title="Dashboard" subtitle={`Beedika — Visão geral da plataforma`} />

      {erro && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
          {erro} — Verifique se está logado como Admin.
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Leads por mês */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e5dc' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>📈 Leads por mês</h3>
          {loading ? <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Carregando...</div> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#f5c842" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Por distribuidora */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e5dc' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>🏭 Por distribuidora</h3>
          {loading ? <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Carregando...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {distData.slice(0,6).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, width: 120, flexShrink: 0, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.distribuidora || 'Outros'}
                  </span>
                  <div style={{ flex: 1, background: '#f0ede4', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#f5c842', width: `${Math.min(100, (d.total / (distData[0]?.total || 1)) * 100)}%`, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#888', width: 30, textAlign: 'right' }}>{d.total}</span>
                </div>
              ))}
              {distData.length === 0 && <div style={{ color: '#ccc', fontSize: 14 }}>Sem dados</div>}
            </div>
          )}
        </div>
      </div>

      {/* EnerScore distribution */}
      {stats?.por_classificacao && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e5dc', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>🎯 Distribuição EnerScore</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {stats.por_classificacao.map((c, i) => (
              <div key={i} style={{
                background: (SCORE_COLORS[c.classificacao] || '#888') + '15',
                border: `1px solid ${SCORE_COLORS[c.classificacao] || '#888'}40`,
                borderRadius: 12, padding: '16px 24px', textAlign: 'center', flex: 1, minWidth: 140,
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: SCORE_COLORS[c.classificacao] || '#888' }}>{c.total}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{c.classificacao}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      <div style={{ background: '#0a0a0a', borderRadius: 16, padding: 24, color: '#fff' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#f5c842' }}>⚡ Ações rápidas</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '+ Novo usuário', href: '/usuarios' },
            { label: '🎯 Ver leads', href: '/leads' },
            { label: '📊 Relatórios', href: '/relatorios' },
            { label: '🤖 Engenheiro IA', href: '/engenheiro' },
          ].map((a, i) => (
            <a key={i} href={a.href} style={{
              background: '#1a1a1a', color: '#ddd', padding: '10px 18px',
              borderRadius: 8, textDecoration: 'none', fontSize: 14,
              border: '1px solid #333', transition: 'border-color 0.15s',
            }}>
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
