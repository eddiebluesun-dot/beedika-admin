// pages/financeiro.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getFinanceiro } from '../lib/api';

function KpiCard({ label, value, sub, color = '#F5A623' }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function AssinaturaBadge({ status }) {
  const map = { ativa: 'badge-green', pendente: 'badge-yellow', cancelada: 'badge-red', inadimplente: 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status || '—'}</span>;
}

function PagamentoBadge({ status }) {
  const map = { approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red', refunded: 'badge-slate' };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status || '—'}</span>;
}

export default function Financeiro() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState('assinaturas');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getFinanceiro()
      .then(setData)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) return null;

  const assinaturas = data?.assinaturas || [];
  const pagamentos = data?.pagamentos || [];
  const mrr = data?.mrr || 0;

  const ativas = assinaturas.filter((a) => a.status === 'ativa').length;
  const canceladas = assinaturas.filter((a) => a.status === 'cancelada').length;
  const totalPagamentos = pagamentos.filter((p) => p.status === 'approved').reduce((s, p) => s + (p.valor || 0), 0);

  return (
    <Layout title="Financeiro">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard
            label="MRR"
            value={`R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            sub="receita mensal recorrente"
            color="#34D399"
          />
          <KpiCard
            label="Assinaturas Ativas"
            value={ativas}
            sub={`${canceladas} canceladas`}
          />
          <KpiCard
            label="Total Recebido"
            value={`R$ ${totalPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            sub={`${pagamentos.filter((p) => p.status === 'approved').length} pagamentos`}
            color="#60A5FA"
          />
          <KpiCard
            label="Total Assinaturas"
            value={assinaturas.length}
            sub="desde o início"
            color="#8892A4"
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['assinaturas', 'pagamentos'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'var(--font-syne)',
                fontWeight: 600,
                background: tab === t ? 'rgba(245,166,35,0.12)' : 'transparent',
                color: tab === t ? '#F5A623' : 'var(--slate)',
                borderBottom: tab === t ? '2px solid var(--honey)' : '2px solid transparent',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {t === 'assinaturas' ? `Assinaturas (${assinaturas.length})` : `Pagamentos (${pagamentos.length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {fetching ? (
            <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--slate)' }}>
              <div style={{ width: 16, height: 16, border: '2px solid var(--honey)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Carregando...
            </div>
          ) : tab === 'assinaturas' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Cliente', 'Email', 'Plano', 'Valor/mês', 'Status', 'Início', 'Vencimento'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assinaturas.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 32, color: 'var(--slate)', textAlign: 'center' }}>Nenhuma assinatura</td></tr>
                  ) : (
                    assinaturas.map((a) => (
                      <tr
                        key={a.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px', color: '#E8EBF0', fontWeight: 500 }}>
                          {a.cliente?.user?.nome || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 12, fontFamily: 'var(--font-dm-mono)' }}>
                          {a.cliente?.user?.email || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)' }}>
                          {a.plano_id || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#34D399', fontFamily: 'var(--font-dm-mono)', fontWeight: 500 }}>
                          {a.valor_mensal ? `R$ ${a.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <AssinaturaBadge status={a.status} />
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 11, fontFamily: 'var(--font-dm-mono)', whiteSpace: 'nowrap' }}>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 11, fontFamily: 'var(--font-dm-mono)', whiteSpace: 'nowrap' }}>
                          {a.proximo_vencimento ? new Date(a.proximo_vencimento).toLocaleDateString('pt-BR') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['ID Pagamento', 'Valor', 'Status', 'Método', 'Data'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 32, color: 'var(--slate)', textAlign: 'center' }}>Nenhum pagamento</td></tr>
                  ) : (
                    pagamentos.map((p) => (
                      <tr
                        key={p.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)', fontSize: 11 }}>
                          {p.mp_payment_id || p.id?.slice(0, 8) || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#34D399', fontFamily: 'var(--font-dm-mono)', fontWeight: 500 }}>
                          {p.valor ? `R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <PagamentoBadge status={p.status} />
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)' }}>
                          {p.metodo_pagamento || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 11, fontFamily: 'var(--font-dm-mono)', whiteSpace: 'nowrap' }}>
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—'}
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
