// pages/clientes.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getClientes } from '../lib/api';

function PlanoBadge({ plano }) {
  const map = {
    free: 'badge-slate',
    basico: 'badge-blue',
    pro: 'badge-yellow',
    enterprise: 'badge-green',
  };
  return <span className={`badge ${map[plano] || 'badge-slate'}`}>{plano || 'free'}</span>;
}

function AssinaturaBadge({ status }) {
  const map = {
    ativa: 'badge-green',
    pendente: 'badge-yellow',
    cancelada: 'badge-red',
    inadimplente: 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status || '—'}</span>;
}

export default function Clientes() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getClientes()
      .then(setClientes)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) return null;

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.user?.nome?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.user?.telefone?.includes(q)
    );
  });

  return (
    <Layout title="Clientes">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Search + stats */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input-dark"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 340 }}
          />
          <span style={{ fontSize: 12, color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)', marginLeft: 'auto' }}>
            {filtered.length} clientes
          </span>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {fetching ? (
            <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--slate)' }}>
              <div style={{ width: 16, height: 16, border: '2px solid var(--honey)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Carregando clientes...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Nome', 'Email', 'Telefone', 'Plano', 'Assinatura', 'Cadastro', ''].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px', color: 'var(--slate)', textAlign: 'center' }}>
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      const assinatura = c.assinaturas?.[0];
                      const isOpen = expanded === c.id;
                      return (
                        <>
                          <tr
                            key={c.id}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', cursor: 'pointer' }}
                            onClick={() => setExpanded(isOpen ? null : c.id)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = isOpen ? 'rgba(245,166,35,0.05)' : 'transparent')}
                          >
                            <td style={{ padding: '12px 16px', color: '#E8EBF0', fontWeight: 500 }}>
                              {c.user?.nome || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 12, fontFamily: 'var(--font-dm-mono)' }}>
                              {c.user?.email || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 12, fontFamily: 'var(--font-dm-mono)' }}>
                              {c.user?.telefone || '—'}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <PlanoBadge plano={c.plano_id} />
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <AssinaturaBadge status={c.status_assinatura} />
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 11, fontFamily: 'var(--font-dm-mono)', whiteSpace: 'nowrap' }}>
                              {c.user?.created_at ? new Date(c.user.created_at).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 12 }}>
                              {isOpen ? '▲' : '▼'}
                            </td>
                          </tr>

                          {/* Expanded row */}
                          {isOpen && (
                            <tr key={`${c.id}-exp`} style={{ background: 'rgba(245,166,35,0.03)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td colSpan={7} style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                  {/* Assinatura info */}
                                  {assinatura && (
                                    <div style={{ background: 'var(--dark-700)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                      <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                        Assinatura
                                      </div>
                                      <div style={{ fontSize: 12, color: '#E8EBF0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <span>Plano: <b>{assinatura.plano_id || '—'}</b></span>
                                        <span>Valor: <b style={{ color: '#34D399' }}>{assinatura.valor_mensal ? `R$ ${assinatura.valor_mensal}` : '—'}</b></span>
                                        <span>Início: {assinatura.created_at ? new Date(assinatura.created_at).toLocaleDateString('pt-BR') : '—'}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Cliente data */}
                                  <div style={{ background: 'var(--dark-700)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                      Dados
                                    </div>
                                    <div style={{ fontSize: 12, color: '#E8EBF0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      <span>CPF: {c.cpf || '—'}</span>
                                      <span>CEP: {c.cep || '—'}</span>
                                      <span>Cidade: {c.cidade ? `${c.cidade}/${c.uf}` : '—'}</span>
                                    </div>
                                  </div>

                                  {/* Contas */}
                                  <div style={{ background: 'var(--dark-700)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                      Histórico
                                    </div>
                                    <div style={{ fontSize: 12, color: '#E8EBF0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      <span>Contas enviadas: <b>{c.contas?.length ?? 0}</b></span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
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
