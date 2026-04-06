import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { PageHeader, Badge } from '../components/UI';
import { api } from '../lib/api';

const STATUS_COLOR = { START:'gray', AWAITING_NAME:'blue', AWAITING_EMAIL:'blue', AWAITING_BILL:'yellow', AWAITING_PROPERTY_TYPE:'yellow', ANALYZING:'purple', AWAITING_CONFIRMATION:'amber', COMPLETE:'green', BLOCKED:'red' };

export default function Whatsapp() {
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [ativa, setAtiva]         = useState(null);
  const [erro, setErro]           = useState('');

  useEffect(() => {
    api.conversas()
      .then(d => setConversas(Array.isArray(d) ? d : d?.conversas || []))
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const conv = conversas.find(c => c.id === ativa);

  return (
    <Layout title="WhatsApp">
      <PageHeader title="WhatsApp" subtitle="Conversas e sessões ativas" />

      {erro && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{erro}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, height: 'calc(100vh - 180px)' }}>
        {/* Lista de conversas */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5dc', overflow: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede4', fontSize: 13, fontWeight: 600, color: '#555' }}>
            {conversas.length} conversas
          </div>
          {loading && <div style={{ padding: 40, textAlign: 'center', color: '#ccc' }}>Carregando...</div>}
          {conversas.map(c => (
            <div key={c.id} onClick={() => setAtiva(c.id)} style={{
              padding: '14px 20px', borderBottom: '1px solid #f5f3ee', cursor: 'pointer',
              background: ativa === c.id ? '#f5f4f0' : 'transparent',
              borderLeft: ativa === c.id ? '3px solid #f5c842' : '3px solid transparent',
              transition: 'all 0.1s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {c.cliente?.nome_completo || c.numero || 'Anônimo'}
                </span>
                <Badge label={c.status} color={STATUS_COLOR[c.status] || 'gray'} />
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>{c.numero}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                {c.ultima_mensagem ? new Date(c.ultima_mensagem).toLocaleString('pt-BR') : '—'}
              </div>
            </div>
          ))}
          {!loading && conversas.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#ccc' }}>Nenhuma conversa</div>
          )}
        </div>

        {/* Detalhe da conversa */}
        {conv ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5dc', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{conv.cliente?.nome_completo || conv.numero}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{conv.numero} · {conv.cliente?.email || '—'}</p>
                </div>
                <Badge label={conv.status} color={STATUS_COLOR[conv.status] || 'gray'} />
              </div>
            </div>

            {/* Mensagens */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conv.mensagens?.length > 0 ? conv.mensagens.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: m.direcao === 'ENVIADA' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                    background: m.direcao === 'ENVIADA' ? '#f5c842' : '#f0ede4',
                    color: '#333', fontSize: 14, lineHeight: 1.5,
                    borderBottomRightRadius: m.direcao === 'ENVIADA' ? 4 : 12,
                    borderBottomLeftRadius: m.direcao === 'RECEBIDA' ? 4 : 12,
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.conteudo}</div>
                    <div style={{ fontSize: 11, color: m.direcao === 'ENVIADA' ? '#8a6f00' : '#aaa', marginTop: 4, textAlign: 'right' }}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: '#ccc', padding: 40 }}>Sem mensagens registradas</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>
            Selecione uma conversa
          </div>
        )}
      </div>
    </Layout>
  );
}
