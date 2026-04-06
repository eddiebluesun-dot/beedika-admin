import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { PageHeader, KpiCard, Badge } from '../components/UI';
import { api } from '../lib/api';

export default function Financeiro() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const leadsVendidos = stats?.leads_vendidos ?? 0;
  const receitaEstimada = leadsVendidos * 1; // 1 moeda = R$ valor configurado

  return (
    <Layout title="Financeiro">
      <PageHeader title="Financeiro" subtitle="Assinaturas, transações e receita do marketplace" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard icon="💰" label="Leads vendidos" value={stats?.leads_vendidos ?? '—'} color="#10b981" />
        <KpiCard icon="🪙" label="Moedas em circulação" value={stats?.moedas_total ?? '—'} color="#f5c842" />
        <KpiCard icon="🤝" label="Parceiros PRO ativos" value={stats?.parceiros_pro ?? '—'} color="#6366f1" />
        <KpiCard icon="📄" label="Assinaturas ativas" value={stats?.assinaturas_ativas ?? '—'} color="#ec4899" />
      </div>

      {/* Instruções Mercado Pago */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5dc', padding: 28, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600 }}>💳 Mercado Pago — Status da integração</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { label: 'Token configurado', status: true, detalhe: 'APP_USR-6889053935364382...' },
            { label: 'Webhook MP', status: false, detalhe: 'Configurar endpoint /api/webhooks/mercadopago' },
            { label: 'Planos criados no MP', status: false, detalhe: 'Criar planos de assinatura recorrente' },
            { label: 'Checkout transparente', status: false, detalhe: 'Integrar SDK MP no portal parceiro' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 16, background: '#f9f9f8', borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>{item.status ? '✅' : '⏳'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.detalhe}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos passos */}
      <div style={{ background: '#0a0a0a', borderRadius: 16, padding: 28, color: '#fff' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: '#f5c842' }}>🚀 Roadmap financeiro</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { fase: 'Fase 1 — Imediato', desc: 'Cobrar parceiros por moedas via link MP. Parceiro paga, admin credita moedas manualmente na tela de Parceiros.' },
            { fase: 'Fase 2 — Portal Parceiro', desc: 'Checkout automático no parceiro.beedika.com. Parceiro compra pacote de moedas e recebe crédito instantâneo.' },
            { fase: 'Fase 3 — Assinatura recorrente', desc: 'Planos mensais via Mercado Pago Subscriptions. Cobrança automática, renovação de moedas todo mês.' },
            { fase: 'Fase 4 — Split automático', desc: 'Receita de leads vendidos dividida automaticamente entre Beedika e distribuidores regionais.' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < 3 ? '1px solid #222' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5c842', flexShrink: 0, marginTop: 6 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f5c842', marginBottom: 4 }}>{f.fase}</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
