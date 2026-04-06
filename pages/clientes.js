import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import { PageHeader } from '../components/UI';
import { api } from '../lib/api';

const API_URL = 'https://api.beedika.com';

const COLS = [
  { key: 'nome_completo', label: 'Nome' },
  { key: 'whatsapp',      label: 'WhatsApp' },
  { key: 'email',         label: 'E-mail' },
  { key: '_bills',        label: '📄 Análises', render: (_, r) => r._count?.bills ?? '—' },
  { key: 'created_at',    label: 'Desde', render: v => v ? new Date(v).toLocaleDateString('pt-BR') : '—' },
];

const EMPTY_CLIENTE = { nome_completo:'', whatsapp:'', email:'', cidade:'', uf:'' };
const EMPTY_CONTA = { distribuidora:'', consumo_kwh:'', valor_total:'', tipo_imovel:'RESIDENCIAL', tarifa_kwh:'', mes_referencia:'' };

export default function Clientes() {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState('');
  const [detalhe, setDetalhe]       = useState(null);
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalConta, setModalConta] = useState(null); // cliente_id
  const [formCliente, setFormCliente] = useState(EMPTY_CLIENTE);
  const [formConta, setFormConta]     = useState(EMPTY_CONTA);
  const [saving, setSaving]         = useState(false);
  const [sucesso, setSucesso]       = useState('');

  async function load() {
    setLoading(true);
    try { setRows((await api.clientes())?.clientes || []); }
    catch(e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function verDetalhe(row) {
    try { setDetalhe(await api.clienteDetalhe(row.id)); }
    catch(e) { alert(e.message); }
  }

  async function excluir(row) {
    if (!confirm(`⚠️ LGPD: Excluir "${row.nome_completo}"?\n\nEsta ação removerá PERMANENTEMENTE todos os dados, análises e leads associados. Esta ação não pode ser desfeita.`)) return;
    try {
      await api.excluirCliente(row.id);
      setSucesso(`Cliente ${row.nome_completo} excluído com sucesso (LGPD).`);
      await load();
    } catch(e) { alert(e.message); }
  }

  async function criarCliente() {
    if (!formCliente.nome_completo || !formCliente.whatsapp) { setErro('Nome e WhatsApp obrigatórios'); return; }
    setSaving(true); setErro('');
    try {
      const token = localStorage.getItem('beedika_token');
      const r = await fetch(`${API_URL}/api/admin/clientes`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(formCliente)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erro ao criar cliente');
      setModalNovoCliente(false);
      setFormCliente(EMPTY_CLIENTE);
      setSucesso('Cliente criado com sucesso!');
      await load();
    } catch(e) { setErro(e.message); }
    setSaving(false);
  }

  async function adicionarConta() {
    if (!formConta.distribuidora || !formConta.consumo_kwh) { setErro('Distribuidora e consumo obrigatórios'); return; }
    setSaving(true); setErro('');
    try {
      const token = localStorage.getItem('beedika_token');
      const r = await fetch(`${API_URL}/api/admin/clientes/${modalConta}/conta-manual`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(formConta)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erro ao adicionar conta');
      setModalConta(null);
      setFormConta(EMPTY_CONTA);
      setSucesso('Conta de energia adicionada com sucesso!');
      if (detalhe) { const novo = await api.clienteDetalhe(detalhe.id); setDetalhe(novo); }
    } catch(e) { setErro(e.message); }
    setSaving(false);
  }

  const setC = (k,v) => setFormCliente(f => ({...f,[k]:v}));
  const setConta = (k,v) => setFormConta(f => ({...f,[k]:v}));

  const INP = ({label, value, onChange, type='text', placeholder=''}) => (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}
        onFocus={e=>e.target.style.borderColor='#0A2540'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
    </div>
  );

  return (
    <Layout title="Clientes">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <PageHeader title="Clientes" subtitle="Clientes captados via WhatsApp e inclusão manual" />
        <button onClick={() => {setModalNovoCliente(true);setErro('');}}
          style={{background:'#0A2540',color:'white',padding:'10px 20px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:14}}>
          + Novo cliente
        </button>
      </div>

      {sucesso && <div style={{background:'#ECFDF5',border:'1px solid rgba(5,150,105,0.2)',borderRadius:10,padding:'10px 16px',fontSize:13,color:'#059669',marginBottom:16,display:'flex',justifyContent:'space-between'}}>
        {sucesso} <span style={{cursor:'pointer'}} onClick={()=>setSucesso('')}>✕</span>
      </div>}
      {erro && !modalNovoCliente && !modalConta && <div style={{background:'#FEF2F2',borderRadius:10,padding:'10px 16px',fontSize:13,color:'#dc2626',marginBottom:16}}>{erro}</div>}

      <DataTable columns={COLS} rows={rows} loading={loading} onEdit={verDetalhe} onDelete={excluir} />

      {/* Detalhe lateral */}
      {detalhe && (
        <div style={{position:'fixed',right:0,top:0,bottom:0,width:440,background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.1)',zIndex:200,overflow:'auto',padding:28}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h2 style={{margin:0,fontSize:18,fontFamily:'Poppins,sans-serif',color:'#0A2540'}}>Perfil do cliente</h2>
            <button onClick={() => setDetalhe(null)} style={{background:'none',border:'none',fontSize:24,cursor:'pointer'}}>×</button>
          </div>

          {[['Nome',detalhe.nome_completo],['WhatsApp',detalhe.whatsapp],['E-mail',detalhe.email],['Cadastrado',detalhe.created_at?new Date(detalhe.created_at).toLocaleDateString('pt-BR'):'—']].map(([k,v]) => (
            <div key={k} style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',marginBottom:2}}>{k}</div>
              <div style={{fontSize:15,color:'#0A2540'}}>{v||'—'}</div>
            </div>
          ))}

          {/* Botão adicionar conta manual */}
          <button onClick={() => {setModalConta(detalhe.id);setErro('');}}
            style={{width:'100%',margin:'16px 0',background:'#f0fdf4',color:'#059669',border:'1px solid #bbf7d0',padding:'10px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:13}}>
            ⚡ Adicionar conta de energia manualmente
          </button>

          {detalhe.bills?.length > 0 && (
            <div>
              <h3 style={{fontSize:15,marginBottom:10,color:'#0A2540'}}>📄 Análises ({detalhe.bills.length})</h3>
              {detalhe.bills.map((b,i) => (
                <div key={i} style={{background:'#f9f9f8',borderRadius:10,padding:14,border:'1px solid #f0ede4',marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontWeight:600,fontSize:13}}>{b.distribuidora||'N/D'}</span>
                    <span style={{background:'#f5c842',color:'#333',padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700}}>
                      {b.enerscore??'—'}/100
                    </span>
                  </div>
                  <div style={{fontSize:12,color:'#666'}}>
                    {b.consumo_kwh??'—'} kWh · R$ {b.valor_total??'—'} · {b.tipo_imovel??'—'}
                  </div>
                  <div style={{fontSize:11,color:'#aaa',marginTop:3}}>
                    {b.tecnologia_recomendada} · {new Date(b.created_at).toLocaleDateString('pt-BR')}
                    {b.raw_gemini_response?.manual && <span style={{background:'#EFF6FF',color:'#2563EB',marginLeft:6,padding:'1px 6px',borderRadius:99,fontSize:10}}>Manual</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Excluir LGPD */}
          <button onClick={() => excluir(detalhe)}
            style={{width:'100%',marginTop:20,background:'#FEF2F2',color:'#dc2626',border:'1px solid #fecaca',padding:'10px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:13}}>
            🗑 Excluir cliente (LGPD)
          </button>
        </div>
      )}

      {/* Modal novo cliente */}
      {modalNovoCliente && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'white',borderRadius:20,padding:32,width:'100%',maxWidth:480}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{fontFamily:'Poppins,sans-serif',fontSize:18,fontWeight:700,color:'#0A2540',margin:0}}>+ Novo cliente manual</h2>
              <button onClick={()=>setModalNovoCliente(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#94a3b8'}}>✕</button>
            </div>
            {erro && <div style={{background:'#FEF2F2',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#dc2626',marginBottom:14}}>{erro}</div>}
            <INP label="Nome completo *" value={formCliente.nome_completo} onChange={v=>setC('nome_completo',v)} placeholder="João da Silva" />
            <INP label="WhatsApp *" value={formCliente.whatsapp} onChange={v=>setC('whatsapp',v)} type="tel" placeholder="(19) 99999-9999" />
            <INP label="E-mail" value={formCliente.email} onChange={v=>setC('email',v)} type="email" placeholder="joao@email.com" />
            <div style={{display:'grid',gridTemplateColumns:'1fr 80px',gap:12}}>
              <INP label="Cidade" value={formCliente.cidade} onChange={v=>setC('cidade',v)} placeholder="Campinas" />
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>UF</label>
                <input value={formCliente.uf} onChange={e=>setC('uf',e.target.value.toUpperCase().slice(0,2))} maxLength={2}
                  style={{width:'100%',padding:'9px 8px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none',textAlign:'center',fontFamily:'inherit'}} />
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button onClick={()=>setModalNovoCliente(false)} style={{flex:1,background:'#f1f5f9',color:'#475569',padding:'11px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Cancelar</button>
              <button onClick={criarCliente} disabled={saving} style={{flex:2,background:'#0A2540',color:'white',padding:'11px',borderRadius:10,border:'none',cursor:saving?'not-allowed':'pointer',fontWeight:700,fontFamily:'inherit',opacity:saving?0.7:1}}>
                {saving?'Salvando...':'Criar cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal conta manual */}
      {modalConta && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'white',borderRadius:20,padding:32,width:'100%',maxWidth:480}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{fontFamily:'Poppins,sans-serif',fontSize:18,fontWeight:700,color:'#0A2540',margin:0}}>⚡ Conta de energia manual</h2>
              <button onClick={()=>setModalConta(null)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#94a3b8'}}>✕</button>
            </div>
            {erro && <div style={{background:'#FEF2F2',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#dc2626',marginBottom:14}}>{erro}</div>}
            <INP label="Distribuidora *" value={formConta.distribuidora} onChange={v=>setConta('distribuidora',v)} placeholder="CPFL, Enel, Cemig..." />
            <INP label="Consumo médio kWh *" value={formConta.consumo_kwh} onChange={v=>setConta('consumo_kwh',v)} type="number" placeholder="350" />
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <INP label="Valor total R$" value={formConta.valor_total} onChange={v=>setConta('valor_total',v)} type="number" placeholder="280.00" />
              <INP label="Tarifa R$/kWh" value={formConta.tarifa_kwh} onChange={v=>setConta('tarifa_kwh',v)} type="number" placeholder="0.85" />
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>Tipo de imóvel</label>
              <select value={formConta.tipo_imovel} onChange={e=>setConta('tipo_imovel',e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none',background:'white',fontFamily:'inherit'}}>
                {['RESIDENCIAL','COMERCIAL','INDUSTRIAL','RURAL','APARTAMENTO'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <INP label="Mês de referência" value={formConta.mes_referencia} onChange={v=>setConta('mes_referencia',v)} placeholder="04/2026" />
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button onClick={()=>setModalConta(null)} style={{flex:1,background:'#f1f5f9',color:'#475569',padding:'11px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Cancelar</button>
              <button onClick={adicionarConta} disabled={saving} style={{flex:2,background:'#059669',color:'white',padding:'11px',borderRadius:10,border:'none',cursor:saving?'not-allowed':'pointer',fontWeight:700,fontFamily:'inherit',opacity:saving?0.7:1}}>
                {saving?'Salvando...':'Adicionar conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
