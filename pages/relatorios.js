import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { PageHeader, KpiCard } from '../components/UI';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#f5c842','#6366f1','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899'];

export default function Relatorios() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const distData  = stats?.por_distribuidora ?? [];
  const tecData   = stats?.por_tecnologia ?? [];
  const mesData   = stats?.leads_por_mes ?? [];
  const scoreData = stats?.por_classificacao ?? [];
  const ufData    = stats?.por_uf ?? [];

  return (
    <Layout title="Relatórios">
      <PageHeader title="Relatórios & BI" subtitle="Cruzamento completo de dados da plataforma" />

      {loading && <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Carregando dados...</div>}

      {!loading && (
        <>
          {/* KPIs linha */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { icon: '📄', label: 'Total de análises', value: stats?.bills_total ?? '—', color: '#6366f1' },
              { icon: '🎯', label: 'Total de leads',    value: stats?.leads_total  ?? '—', color: '#f5c842' },
              { icon: '💰', label: 'Leads vendidos',    value: stats?.leads_vendidos ?? '—', color: '#10b981' },
              { icon: '⚡', label: 'EnerScore médio',   value: stats?.enerscore_medio ? `${stats.enerscore_medio}/100` : '—', color: '#f59e0b' },
            ].map((k, i) => <KpiCard key={i} {...k} />)}
          </div>

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <Card title="📈 Leads por mês">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede4" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#f5c842" strokeWidth={2} dot={{ fill: '#f5c842' }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="☀️ Tecnologias mais solicitadas">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={tecData.slice(0,7)} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tecnologia" type="category" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6366f1" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            <Card title="🎯 EnerScore por classificação">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={scoreData} dataKey="total" nameKey="classificacao" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {scoreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card title="🏭 Top distribuidoras">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                {distData.slice(0, 7).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#888', width: 16, flexShrink: 0 }}>{i+1}</span>
                    <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.distribuidora || 'N/D'}</span>
                    <div style={{ width: 80, background: '#f0ede4', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: COLORS[i % COLORS.length], width: `${(d.total / (distData[0]?.total||1))*100}%`, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#888', width: 24, textAlign: 'right' }}>{d.total}</span>
                  </div>
                ))}
                {distData.length === 0 && <span style={{ color: '#ccc', fontSize: 13 }}>Sem dados</span>}
              </div>
            </Card>

            <Card title="🗺️ Leads por UF">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                {ufData.slice(0, 7).map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, width: 28, color: '#333' }}>{u.uf}</span>
                    <div style={{ flex: 1, background: '#f0ede4', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#f5c842', width: `${(u.total / (ufData[0]?.total||1))*100}%`, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#888', width: 24, textAlign: 'right' }}>{u.total}</span>
                  </div>
                ))}
                {ufData.length === 0 && <span style={{ color: '#ccc', fontSize: 13 }}>Sem dados</span>}
              </div>
            </Card>
          </div>

          {/* Tabela completa por distribuidora */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5dc', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>📊 Análise completa por distribuidora</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0ede4' }}>
                    {['Distribuidora','Análises','EnerScore médio','Consumo médio kWh','Valor médio R$'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats?.por_distribuidora_detalhe ?? distData).map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f3ee' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{d.distribuidora || 'N/D'}</td>
                      <td style={{ padding: '10px 14px' }}>{d.total}</td>
                      <td style={{ padding: '10px 14px' }}>{d.enerscore_medio ? `${d.enerscore_medio}/100` : '—'}</td>
                      <td style={{ padding: '10px 14px' }}>{d.consumo_medio ? `${d.consumo_medio} kWh` : '—'}</td>
                      <td style={{ padding: '10px 14px' }}>{d.valor_medio ? `R$ ${Number(d.valor_medio).toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e5dc' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );
}
