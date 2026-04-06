import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const API_URL = 'https://api.beedika.com';
const STATUS_COR = { ATIVO:'#059669', PENDENTE:'#d97706', SUSPENSO:'#dc2626', BANIDO:'#111827' };
const PLANO_COR  = { VIP:'#F59E0B', FREE:'#64748b' };

function Badge({ label, cor }) {
  return <span style={{ background: cor+'18', color: cor, fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:100, whiteSpace:'nowrap' }}>{label}</span>;
}
function Stat({ label, value, cor='#0A2540' }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:'18px 22px', border:'1px solid #e2e8f0' }}>
      <div style={{ fontSize:26, fontWeight:700, color:cor }}>{value}</div>
      <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{label}</div>
    </div>
  );
}

export default function Parceiros() {
  const [parceiros, setParceiros]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPlano, setFiltroPlano]   = useState('');
  const [filtroUF, setFiltroUF]         = useState('');
  const [busca, setBusca]               = useState('');

  // Modals
  const [modalAcao, setModalAcao]   = useState(null);
  const [modalGrat, setModalGrat]   = useState(null);
  const [modalCfg, setModalCfg]     = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalBonus, setModalBonus] = useState(null);
  const [detalhe, setDetalhe]       = useState(null);

  // Forms
  const [motivo, setMotivo]   = useState('');
  const [grat, setGrat]       = useState({ plano:'VIP', vitalicio:true, validade:'', motivo:'' });
  const [formEditar, setFormEditar] = useState({});
  const [formBonus, setFormBonus]   = useState({ valor:'', motivo:'', tipo:'bonus' });
  const [cfg, setCfg]         = useState({ preco_ouro:40, preco_prata:20, preco_bronze:13.50, max_parceiros_prata:2, max_parceiros_bronze:3, janela_vip_minutos:10, janela_pagamento_minutos:10, dias_expiracao_lead:5, mensalidade_vip:250 });
  const [saving, setSaving]   = useState(false);
  const [erro, setErro]       = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => { carregar(); carregarCfg(); }, []);

  async function carregar() {
    setLoading(true);
    try { setParceiros((await api.parceiros())?.parceiros || []); }
    catch(e) { setErro(e.message); }
    setLoading(false);
  }

  async function carregarCfg() {
    try { const d = await api.configuracoes(); if (d) setCfg(prev => ({ ...prev, ...d })); } catch {}
  }

  async function executarAcao() {
    if (!modalAcao) return;
    setSaving(true); setErro('');
    try {
      await api.aprovarParceiro(modalAcao.parceiro.id, modalAcao.acao, motivo);
      setSucesso(`Parceiro ${modalAcao.acao.toLowerCase()} com sucesso`);
      setModalAcao(null); setMotivo(''); carregar();
    } catch(e) { setErro(e.message); }
    setSaving(false);
  }

  async function concederGratuidade() {
    if (!modalGrat) return;
    setSaving(true); setErro('');
    try {
      await api.gratuidade(modalGrat.parceiro.id, grat);
      setSucesso(`Plano ${grat.plano} concedido com sucesso`);
      setModalGrat(null); carregar();
    } catch(e) { setErro(e.message); }
    setSaving(false);
  }

  async function salvarEdicao() {
    if (!modalEditar) return;
    setSaving(true); setErro('');
    try {
      await api.atualizarParceiro(modalEditar.id, formEditar);
      setSucesso('Parceiro atualizado com sucesso!');
      setModalEditar(null); carregar();
    } catch(e) { setErro(e.message); }
    setSaving(false);
  }

  async function executarBonus() {
    if (!modalBonus || !formBonus.valor) { setErro('Informe o valor'); return; }
    setSaving(true); setErro('');
    try {
      const token = localStorage.getItem('beedika_token');
      const endpoint = formBonus.tipo === 'reembolso' ? 'reembolso' : 'bonificar';
      const r = await fetch(`${API_URL}/api/admin/parceiros/${modalBonus.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ valor: Number(formBonus.valor), motivo: formBonus.motivo })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erro');
      setSucesso(formBonus.tipo === 'reembolso' ? `Reembolso de R$ ${formBonus.valor} realizado!` : `Bonificação de R$ ${formBonus.valor} creditada!`);
      setModalBonus(null); setFormBonus({ valor:'', motivo:'', tipo:'bonus' }); carregar();
    } catch(e) { setErro(e.message); }
    setSaving(false);
  }

  async function salvarCfg() {
    setSaving(true); setErro('');
    try { await api.salvarConfiguracoes(cfg); setSucesso('Configurações salvas'); setModalCfg(false); }
    catch(e) { setErro(e.message); }
    setSaving(false);
  }

  const lista = parceiros.filter(p => {
    if (filtroStatus && p.status !== filtroStatus) return false;
    if (filtroPlano  && p.plano  !== filtroPlano)  return false;
    if (filtroUF     && p.uf     !== filtroUF)     return false;
    if (busca) {
      const b = busca.toLowerCase();
      if (!p.nome_responsavel?.toLowerCase().includes(b) && !p.email?.toLowerCase().includes(b) && !p.cidade?.toLowerCase().includes(b)) return false;
    }
    return true;
  });

  const ufsDisponiveis = [...new Set(parceiros.map(p => p.uf).filter(Boolean))].sort();

  const S = {
    btn: (bg, color='white') => ({ background:bg, color, padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }),
    inp: { width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' },
    label: { fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:4 },
    modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
    card: { background:'white', borderRadius:20, padding:32, width:'100%', maxWidth:480 },
  };

  return (
    <Layout title="Parceiros">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Poppins,sans-serif', fontSize:22, fontWeight:700, color:'#0A2540', margin:0 }}>Parceiros</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:'4px 0 0' }}>Gerencie parceiros, aprovações, bonificações e leilão de leads</p>
        </div>
        <button onClick={() => setModalCfg(true)} style={S.btn('#0A2540')}>⚙️ Config. Leilão</button>
      </div>

      {sucesso && <div style={{ background:'#ECFDF5', border:'1px solid rgba(5,150,105,0.2)', borderRadius:10, padding:'10px 16px', fontSize:13, color:'#059669', marginBottom:16, display:'flex', justifyContent:'space-between' }}>
        {sucesso} <span style={{ cursor:'pointer' }} onClick={()=>setSucesso('')}>✕</span>
      </div>}
      {erro && !modalAcao && !modalGrat && !modalCfg && !modalEditar && !modalBonus &&
        <div style={{ background:'#FEF2F2', borderRadius:10, padding:'10px 16px', fontSize:13, color:'#dc2626', marginBottom:16 }}>{erro}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
        <Stat label="Total" value={parceiros.length} />
        <Stat label="Pendentes" value={parceiros.filter(p=>p.status==='PENDENTE').length} cor="#d97706" />
        <Stat label="Ativos" value={parceiros.filter(p=>p.status==='ATIVO').length} cor="#059669" />
        <Stat label="VIP" value={parceiros.filter(p=>p.plano==='VIP').length} cor="#F59E0B" />
        <Stat label="Banidos" value={parceiros.filter(p=>p.status==='BANIDO').length} cor="#dc2626" />
      </div>

      <div style={{ background:'white', borderRadius:12, padding:'14px 20px', border:'1px solid #e2e8f0', marginBottom:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <input placeholder="Buscar nome, email, cidade..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ ...S.inp, flex:1, minWidth:200 }} />
        {[
          ['Status', filtroStatus, setFiltroStatus, [['','Todos'],['PENDENTE','Pendente'],['ATIVO','Ativo'],['SUSPENSO','Suspenso'],['BANIDO','Banido']]],
          ['Plano',  filtroPlano,  setFiltroPlano,  [['','Todos planos'],['FREE','Free'],['VIP','VIP']]],
          ['UF',     filtroUF,     setFiltroUF,     [['','Todas UFs'], ...ufsDisponiveis.map(u=>[u,u])]],
        ].map(([lbl,val,setter,opts]) => (
          <select key={lbl} value={val} onChange={e=>setter(e.target.value)}
            style={{ padding:'8px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', background:'white', fontFamily:'inherit' }}>
            {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <span style={{ fontSize:12, color:'#94a3b8' }}>{lista.length} parceiros</span>
      </div>

      <div style={{ background:'white', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #f1f5f9' }}>
                {['Parceiro','Tipo','Cidade/UF','Plano','Status','Saldo','Ações'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#94a3b8' }}>Carregando...</td></tr>
              ) : lista.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#94a3b8' }}>Nenhum parceiro encontrado</td></tr>
              ) : lista.map(p => (
                <tr key={p.id} style={{ borderBottom:'1px solid #f8fafc', cursor:'pointer' }}
                  onMouseOver={e=>e.currentTarget.style.background='#fafafa'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px' }} onClick={()=>setDetalhe(p)}>
                    <div style={{ fontWeight:600, color:'#0A2540', display:'flex', alignItems:'center', gap:6 }}>
                      {p.nome_responsavel||p.nome}
                      {p.plano_gratuito && <span style={{ fontSize:9, background:'#ECFDF5', color:'#059669', padding:'1px 5px', borderRadius:99, fontWeight:700 }}>FUNDADOR</span>}
                    </div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>{p.email}</div>
                  </td>
                  <td style={{ padding:'12px 16px', color:'#64748b', fontSize:13 }}>{p.tipo_parceiro||'—'}</td>
                  <td style={{ padding:'12px 16px', color:'#64748b', fontSize:13 }}>{p.cidade||'—'}/{p.uf||'—'}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <Badge label={p.plano||'FREE'} cor={PLANO_COR[p.plano]||'#64748b'} />
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <Badge label={p.status||'PENDENTE'} cor={STATUS_COR[p.status]||'#d97706'} />
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:600, color:'#059669' }}>
                    R$ {Number(p.saldo||0).toFixed(2)}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {p.status==='PENDENTE' && <button onClick={()=>{setModalAcao({parceiro:p,acao:'APROVAR'});setMotivo('');setErro('');}} style={S.btn('#059669')}>✓</button>}
                      {p.status==='ATIVO' && <button onClick={()=>{setModalAcao({parceiro:p,acao:'SUSPENDER'});setMotivo('');setErro('');}} style={S.btn('#d97706')}>⏸</button>}
                      <button onClick={()=>{setModalEditar(p);setFormEditar({nome_responsavel:p.nome_responsavel,tipo_parceiro:p.tipo_parceiro||'',cidade:p.cidade||'',uf:p.uf||'',status:p.status||'ATIVO',plano:p.plano||'FREE'});setErro('');}} style={S.btn('#6366F1')}>✏️</button>
                      <button onClick={()=>{setModalBonus(p);setFormBonus({valor:'',motivo:'',tipo:'bonus'});setErro('');}} style={S.btn('#F59E0B','#0A2540')}>💰</button>
                      <button onClick={()=>{setModalGrat({parceiro:p});setGrat({plano:'VIP',vitalicio:true,validade:'',motivo:''});setErro('');}} style={S.btn('#0A2540')}>★</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL AÇÃO ─────────────────────────────────────────── */}
      {modalAcao && (
        <div style={S.modal}>
          <div style={S.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:18, fontWeight:700, color:'#0A2540', margin:0 }}>
                {modalAcao.acao==='APROVAR'?'✅ Aprovar':modalAcao.acao==='SUSPENDER'?'⚠️ Suspender':'🚫 Banir'} parceiro
              </h2>
              <button onClick={()=>setModalAcao(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>✕</button>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
              <div style={{ fontWeight:600 }}>{modalAcao.parceiro.nome_responsavel}</div>
              <div style={{ fontSize:13, color:'#64748b' }}>{modalAcao.parceiro.email}</div>
            </div>
            {modalAcao.acao!=='APROVAR' && (
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>{modalAcao.acao==='BANIR'?'Motivo *':'Motivo (opcional)'}</label>
                <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} rows={3}
                  style={{ ...S.inp, resize:'vertical' }} />
              </div>
            )}
            {erro && <div style={{ background:'#FEF2F2', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#dc2626', marginBottom:12 }}>{erro}</div>}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setModalAcao(null)} style={{ ...S.btn('#f1f5f9','#475569'), flex:1 }}>Cancelar</button>
              <button onClick={executarAcao} disabled={saving||(modalAcao.acao==='BANIR'&&!motivo.trim())}
                style={{ ...S.btn(modalAcao.acao==='APROVAR'?'#059669':modalAcao.acao==='SUSPENDER'?'#d97706':'#dc2626'), flex:2, opacity:saving?0.7:1 }}>
                {saving?'...':modalAcao.acao==='APROVAR'?'Confirmar aprovação':modalAcao.acao==='SUSPENDER'?'Confirmar suspensão':'Confirmar banimento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR ────────────────────────────────────────── */}
      {modalEditar && (
        <div style={S.modal}>
          <div style={{ ...S.card, maxWidth:520 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:18, fontWeight:700, color:'#0A2540', margin:0 }}>✏️ Editar parceiro</h2>
              <button onClick={()=>setModalEditar(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>✕</button>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#64748b' }}>
              {modalEditar.email}
            </div>
            {erro && <div style={{ background:'#FEF2F2', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#dc2626', marginBottom:12 }}>{erro}</div>}
            {[
              ['nome_responsavel','Nome responsável','text'],
              ['tipo_parceiro','Tipo de parceiro','text'],
              ['cidade','Cidade','text'],
              ['uf','UF (2 letras)','text'],
            ].map(([k,lbl,type]) => (
              <div key={k} style={{ marginBottom:14 }}>
                <label style={S.label}>{lbl}</label>
                <input type={type} value={formEditar[k]||''} onChange={e=>setFormEditar(f=>({...f,[k]:e.target.value}))} style={S.inp} />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={S.label}>Status</label>
                <select value={formEditar.status||''} onChange={e=>setFormEditar(f=>({...f,status:e.target.value}))} style={{ ...S.inp, background:'white' }}>
                  {['PENDENTE','ATIVO','SUSPENSO','BANIDO'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Plano</label>
                <select value={formEditar.plano||''} onChange={e=>setFormEditar(f=>({...f,plano:e.target.value}))} style={{ ...S.inp, background:'white' }}>
                  {['FREE','VIP'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setModalEditar(null)} style={{ ...S.btn('#f1f5f9','#475569'), flex:1 }}>Cancelar</button>
              <button onClick={salvarEdicao} disabled={saving} style={{ ...S.btn('#0A2540'), flex:2, opacity:saving?0.7:1 }}>
                {saving?'Salvando...':'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL BONUS / REEMBOLSO ─────────────────────────────── */}
      {modalBonus && (
        <div style={S.modal}>
          <div style={S.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:18, fontWeight:700, color:'#0A2540', margin:0 }}>💰 Créditos do parceiro</h2>
              <button onClick={()=>setModalBonus(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>✕</button>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
              <div style={{ fontWeight:600 }}>{modalBonus.nome_responsavel}</div>
              <div style={{ fontSize:13, color:'#64748b' }}>Saldo atual: <strong style={{ color:'#059669' }}>R$ {Number(modalBonus.saldo||0).toFixed(2)}</strong></div>
            </div>
            {/* Tipo */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {[['bonus','🎁 Bonificação','#059669'],['reembolso','↩️ Reembolso','#3B82F6']].map(([tipo,label,cor]) => (
                <button key={tipo} onClick={()=>setFormBonus(f=>({...f,tipo}))}
                  style={{ flex:1, padding:'10px', borderRadius:10, border:`2px solid ${formBonus.tipo===tipo?cor:'#e2e8f0'}`, background:formBonus.tipo===tipo?cor+'12':'white', color:formBonus.tipo===tipo?cor:'#64748b', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Valor R$ *</label>
              <input type="number" step="1" min="1" value={formBonus.valor} onChange={e=>setFormBonus(f=>({...f,valor:e.target.value}))}
                placeholder="Ex: 40.00" style={S.inp} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Motivo / Observação</label>
              <input value={formBonus.motivo} onChange={e=>setFormBonus(f=>({...f,motivo:e.target.value}))}
                placeholder={formBonus.tipo==='bonus'?'Ex: Campanha de lançamento':'Ex: Lead entregue fora da área'}
                style={S.inp} />
            </div>
            {formBonus.tipo==='bonus' && (
              <div style={{ background:'#ECFDF5', border:'1px solid #BBF7D0', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#166534', marginBottom:14 }}>
                🎁 O saldo será creditado imediatamente e poderá ser usado em leilões.
              </div>
            )}
            {erro && <div style={{ background:'#FEF2F2', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#dc2626', marginBottom:12 }}>{erro}</div>}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setModalBonus(null)} style={{ ...S.btn('#f1f5f9','#475569'), flex:1 }}>Cancelar</button>
              <button onClick={executarBonus} disabled={saving||!formBonus.valor}
                style={{ ...S.btn(formBonus.tipo==='bonus'?'#059669':'#3B82F6'), flex:2, opacity:saving||!formBonus.valor?0.7:1 }}>
                {saving?'...':`Confirmar ${formBonus.tipo==='bonus'?'bonificação':'reembolso'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL GRATUIDADE ──────────────────────────────────── */}
      {modalGrat && (
        <div style={S.modal}>
          <div style={S.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:18, fontWeight:700, color:'#0A2540', margin:0 }}>★ Conceder plano gratuito</h2>
              <button onClick={()=>setModalGrat(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
              <div style={{ fontWeight:600 }}>{modalGrat.parceiro.nome_responsavel}</div>
              <div style={{ fontSize:13, color:'#64748b' }}>Plano atual: <strong>{modalGrat.parceiro.plano||'FREE'}</strong></div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Plano a conceder</label>
              <select value={grat.plano} onChange={e=>setGrat(g=>({...g,plano:e.target.value}))} style={{ ...S.inp, background:'white' }}>
                <option value="VIP">VIP</option><option value="FREE">FREE</option>
              </select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:14 }}>
              <input type="checkbox" checked={grat.vitalicio} onChange={e=>setGrat(g=>({...g,vitalicio:e.target.checked}))} style={{ width:15, height:15, accentColor:'#0A2540' }} />
              <span style={{ fontSize:14, color:'#334155' }}>Vitalício (sem expiração)</span>
            </label>
            {!grat.vitalicio && (
              <div style={{ marginBottom:14 }}>
                <label style={S.label}>Válido até</label>
                <input type="date" value={grat.validade} onChange={e=>setGrat(g=>({...g,validade:e.target.value}))} style={S.inp} />
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Motivo</label>
              <input value={grat.motivo} onChange={e=>setGrat(g=>({...g,motivo:e.target.value}))} placeholder="Ex: Parceiro fundador..." style={S.inp} />
            </div>
            {erro && <div style={{ background:'#FEF2F2', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#dc2626', marginBottom:12 }}>{erro}</div>}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setModalGrat(null)} style={{ ...S.btn('#f1f5f9','#475569'), flex:1 }}>Cancelar</button>
              <button onClick={concederGratuidade} disabled={saving} style={{ ...S.btn('#F59E0B','#0A2540'), flex:2, opacity:saving?0.7:1 }}>
                {saving?'Salvando...':'Conceder plano gratuito'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIGURAÇÕES ─────────────────────────────────── */}
      {modalCfg && (
        <div style={S.modal}>
          <div style={{ ...S.card, maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:18, fontWeight:700, color:'#0A2540', margin:0 }}>⚙️ Configurações do Leilão</h2>
              <button onClick={()=>setModalCfg(false)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>✕</button>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#0A2540', marginBottom:12 }}>💰 Preços por categoria</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {[['preco_ouro','OURO','#F59E0B'],['preco_prata','PRATA','#94A3B8'],['preco_bronze','BRONZE','#CD7F32']].map(([k,lbl,cor])=>(
                  <div key={k} style={{ background:cor+'12', border:`1.5px solid ${cor}44`, borderRadius:10, padding:14, textAlign:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:cor, marginBottom:8 }}>{lbl}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
                      <span style={{ fontSize:13, color:'#64748b' }}>R$</span>
                      <input type="number" step="0.50" min="0" value={cfg[k]} onChange={e=>setCfg(c=>({...c,[k]:parseFloat(e.target.value)||0}))}
                        style={{ width:70, padding:'6px 8px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:15, fontWeight:700, textAlign:'center', outline:'none', fontFamily:'inherit' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              {[['max_parceiros_prata','Máx PRATA'],['max_parceiros_bronze','Máx BRONZE'],['janela_vip_minutos','Janela VIP (min)'],['janela_pagamento_minutos','Prazo pgto (min)'],['dias_expiracao_lead','Expirar lead (dias)'],['mensalidade_vip','Mensalidade VIP R$']].map(([k,lbl])=>(
                <div key={k}>
                  <label style={S.label}>{lbl}</label>
                  <input type="number" min={0} value={cfg[k]} onChange={e=>setCfg(c=>({...c,[k]:parseFloat(e.target.value)||0}))} style={S.inp} />
                </div>
              ))}
            </div>
            {erro && <div style={{ background:'#FEF2F2', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#dc2626', marginBottom:12 }}>{erro}</div>}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setModalCfg(false)} style={{ ...S.btn('#f1f5f9','#475569'), flex:1 }}>Cancelar</button>
              <button onClick={salvarCfg} disabled={saving} style={{ ...S.btn('#0A2540'), flex:2, opacity:saving?0.7:1 }}>
                {saving?'Salvando...':'Salvar configurações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER DETALHE ──────────────────────────────────────── */}
      {detalhe && (
        <div style={{ position:'fixed', inset:0, zIndex:90 }} onClick={()=>setDetalhe(null)}>
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:380, background:'white', boxShadow:'-4px 0 24px rgba(0,0,0,0.12)', padding:28, overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:16, fontWeight:700, color:'#0A2540', margin:0 }}>Detalhe do parceiro</h3>
              <button onClick={()=>setDetalhe(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#94a3b8' }}>✕</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:16, background:'#f8fafc', borderRadius:12 }}>
              {detalhe.logo_url
                ? <img src={detalhe.logo_url} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', border:'2px solid #e2e8f0' }} alt="" />
                : <div style={{ width:52, height:52, borderRadius:'50%', background:'#0A2540', display:'flex', alignItems:'center', justifyContent:'center', color:'#00E5A8', fontWeight:700, fontSize:20 }}>{detalhe.nome_responsavel?.charAt(0)||'?'}</div>}
              <div>
                <div style={{ fontWeight:700, color:'#0A2540', fontSize:15 }}>{detalhe.nome_responsavel}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>{detalhe.tipo_parceiro}</div>
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <Badge label={detalhe.plano||'FREE'} cor={PLANO_COR[detalhe.plano]||'#64748b'} />
                  <Badge label={detalhe.status||'PENDENTE'} cor={STATUS_COR[detalhe.status]||'#d97706'} />
                </div>
              </div>
            </div>
            {[['E-mail',detalhe.email],['Celular',detalhe.celular],['CNPJ',detalhe.cnpj],['Razão Social',detalhe.razao_social],
              ['Cidade/UF',`${detalhe.cidade||'—'}/${detalhe.uf||'—'}`],['Raio',detalhe.raio_atuacao_km?`${detalhe.raio_atuacao_km}km`:'—'],
              ['Saldo',`R$ ${Number(detalhe.saldo||0).toFixed(2)}`],['Arremates',detalhe.total_arremates||0],
              ['Cadastro',detalhe.created_at?new Date(detalhe.created_at).toLocaleDateString('pt-BR'):'—'],
              ...(detalhe.plano_gratuito?[['Gratuidade',detalhe.plano_gratuito_motivo||'Sim']]:[]),
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f1f5f9', fontSize:13 }}>
                <span style={{ color:'#94a3b8' }}>{k}</span>
                <span style={{ color:'#334155', fontWeight:500, textAlign:'right', maxWidth:220, wordBreak:'break-word' }}>{v||'—'}</span>
              </div>
            ))}
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={()=>{setDetalhe(null);setModalEditar(detalhe);setFormEditar({nome_responsavel:detalhe.nome_responsavel,tipo_parceiro:detalhe.tipo_parceiro||'',cidade:detalhe.cidade||'',uf:detalhe.uf||'',status:detalhe.status||'ATIVO',plano:detalhe.plano||'FREE'});setErro('');}} style={{ ...S.btn('#6366F1'), padding:'10px' }}>✏️ Editar dados</button>
              <button onClick={()=>{setDetalhe(null);setModalBonus(detalhe);setFormBonus({valor:'',motivo:'',tipo:'bonus'});}} style={{ ...S.btn('#059669'), padding:'10px' }}>🎁 Bonificar créditos</button>
              <button onClick={()=>{setDetalhe(null);setModalBonus(detalhe);setFormBonus({valor:'',motivo:'',tipo:'reembolso'});}} style={{ ...S.btn('#3B82F6'), padding:'10px' }}>↩️ Reembolso</button>
              {detalhe.status==='PENDENTE' && <button onClick={()=>{setDetalhe(null);setModalAcao({parceiro:detalhe,acao:'APROVAR'});setMotivo('');}} style={{ ...S.btn('#059669'), padding:'10px' }}>✅ Aprovar</button>}
              {detalhe.status==='ATIVO' && <button onClick={()=>{setDetalhe(null);setModalAcao({parceiro:detalhe,acao:'SUSPENDER'});setMotivo('');}} style={{ ...S.btn('#d97706'), padding:'10px' }}>⚠️ Suspender</button>}
              <button onClick={()=>{setDetalhe(null);setModalGrat({parceiro:detalhe});setGrat({plano:'VIP',vitalicio:true,validade:'',motivo:''});}} style={{ ...S.btn('#F59E0B','#0A2540'), padding:'10px' }}>★ Conceder VIP gratuito</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
