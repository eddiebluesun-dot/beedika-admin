// pages/whatsapp.js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getConversations, getWhatsAppStatus, sendWhatsAppMessage, setWebhook } from '../lib/api';

function StatusDot({ status }) {
  const connected = status === 'open';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#34D399' : '#F87171',
          animation: connected ? 'pulse-honey 2s infinite' : 'none',
        }}
      />
      <span style={{ fontSize: 12, color: connected ? '#34D399' : '#F87171', fontFamily: 'var(--font-dm-mono)' }}>
        {connected ? 'Conectado' : status || 'Desconectado'}
      </span>
    </span>
  );
}

function ConvStatus({ status }) {
  const map = {
    aguardando_conta: ['badge-yellow', 'aguardando'],
    processando: ['badge-blue', 'processando'],
    concluido: ['badge-green', 'concluído'],
  };
  const [cls, label] = map[status] || ['badge-slate', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function WhatsApp() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [convs, setConvs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [botStatus, setBotStatus] = useState(null);
  const [qr, setQr] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [sendText, setSendText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState('');
  const [webhookLoading, setWebhookLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getConversations().then(setConvs),
      getWhatsAppStatus().then((d) => { setBotStatus(d.status); setQr(d.qr); }),
    ]).finally(() => setFetching(false));
  }, [user]);

  const handleSend = async () => {
    if (!sendText.trim() || !selected) return;
    setSending(true);
    setSendMsg('');
    try {
      await sendWhatsAppMessage(selected.numero + '@s.whatsapp.net', sendText.trim());
      setSendMsg('✅ Mensagem enviada!');
      setSendText('');
    } catch (err) {
      setSendMsg('❌ Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleSetWebhook = async () => {
    setWebhookLoading(true);
    try {
      await setWebhook();
      setSendMsg('✅ Webhook configurado com sucesso!');
    } catch (err) {
      setSendMsg('❌ Erro ao configurar webhook: ' + (err.response?.data?.error || err.message));
    } finally {
      setWebhookLoading(false);
    }
  };

  if (loading || !user) return null;

  const msgs = selected?.mensagens || [];

  return (
    <Layout title="WhatsApp">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Status bar */}
        <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--slate)', fontFamily: 'var(--font-syne)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bot</span>
            <StatusDot status={botStatus} />
          </div>

          {qr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--slate)' }}>QR Code:</span>
              <img
                src={qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`}
                alt="QR"
                style={{ width: 80, height: 80, borderRadius: 6, background: '#fff', padding: 2 }}
              />
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button
              className="btn-ghost"
              onClick={() => getWhatsAppStatus().then((d) => { setBotStatus(d.status); setQr(d.qr); })}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              ↻ Atualizar status
            </button>
            <button
              className="btn-ghost"
              onClick={handleSetWebhook}
              disabled={webhookLoading}
              style={{ fontSize: 12, padding: '6px 12px', opacity: webhookLoading ? 0.6 : 1 }}
            >
              {webhookLoading ? 'Configurando...' : '⚡ Set Webhook'}
            </button>
          </div>
        </div>

        {sendMsg && (
          <div
            style={{
              background: sendMsg.startsWith('✅') ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${sendMsg.startsWith('✅') ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 8, padding: '10px 16px', fontSize: 13,
              color: sendMsg.startsWith('✅') ? '#34D399' : '#F87171',
            }}
          >
            {sendMsg}
          </div>
        )}

        {/* Main area */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, minHeight: 480 }}>

          {/* Conversations list */}
          <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-display" style={{ fontSize: 13, fontWeight: 700, color: '#E8EBF0' }}>
                Conversas ({convs.length})
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {fetching ? (
                <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13 }}>Carregando...</div>
              ) : convs.length === 0 ? (
                <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13 }}>Nenhuma conversa ainda</div>
              ) : (
                convs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      background: selected?.id === conv.id ? 'rgba(245,166,35,0.08)' : 'transparent',
                      borderLeft: selected?.id === conv.id ? '2px solid var(--honey)' : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#E8EBF0' }}>
                        {conv.nome || conv.numero}
                      </span>
                      <ConvStatus status={conv.status} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.ultima_mensagem || '—'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3, fontFamily: 'var(--font-dm-mono)' }}>
                      {conv.ultima_mensagem_em ? new Date(conv.ultima_mensagem_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!selected ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', fontSize: 14 }}>
                ← Selecione uma conversa
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--dark-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    ◎
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EBF0' }}>{selected.nome || selected.numero}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)' }}>{selected.numero}</div>
                  </div>
                  <ConvStatus status={selected.status} />
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {msgs.length === 0 ? (
                    <div style={{ color: 'var(--slate)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                      Últimas 5 mensagens serão exibidas aqui
                    </div>
                  ) : (
                    [...msgs].reverse().map((m) => (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: m.direcao === 'out' ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          background: m.direcao === 'out' ? 'rgba(245,166,35,0.15)' : 'var(--dark-600)',
                          border: m.direcao === 'out' ? '1px solid rgba(245,166,35,0.25)' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: m.direcao === 'out' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          padding: '8px 12px',
                        }}
                      >
                        <div style={{ fontSize: 13, color: '#E8EBF0', lineHeight: 1.4 }}>{m.conteudo}</div>
                        <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 4, fontFamily: 'var(--font-dm-mono)', textAlign: m.direcao === 'out' ? 'right' : 'left' }}>
                          {m.tipo} · {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Send message */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
                  <input
                    className="input-dark"
                    placeholder="Digite uma mensagem..."
                    value={sendText}
                    onChange={(e) => setSendText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleSend}
                    disabled={sending || !sendText.trim()}
                    style={{ padding: '8px 16px', opacity: sending || !sendText.trim() ? 0.6 : 1 }}
                  >
                    {sending ? '...' : '→'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
