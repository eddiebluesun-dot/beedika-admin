import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Badge, PageHeader, Btn, Field, Select } from '../components/UI';
import { api } from '../lib/api';

const STATUS_COLOR = { NOVO:'blue', QUALIFICADO:'green', RESERVADO_PAG:'yellow', VENDIDO:'gray', EXCLUSIVO_3ES:'purple', ARQUIVADO:'red' };
const TEC_ICON = { ON_GRID:'☀️', BESS:'🔋', ACL:'⚡', TARIFA_BRANCA:'💡', ASSINATURA:'📝', ZERO_GRID:'⚡🔋', OM_LIMPEZA:'🧹' };
const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

const COLS = [
  { key: 'cidade',       label: 'Cidade/UF', render: (v, r) => v || r.uf ? `${v||'—'}/${r.uf||'—'}` : <span style={{color:'#EF4444',fontWeight:700}}>⚠️ —/—</span> },
  { key: 'tecnologia',   label: 'Solução', render: (v) => `${TEC_ICON[v] || ''} ${v || '—'}` },
  { key: 'consumo_kwh',  label: 'Consumo', render: (v) => v ? `${v} kWh` : '—' },
  { key: 'enerscore',    label: 'EnerScore', render: (v) => v ? `${v}/100` : '—' },
  { key: 'classificacao',label: 'Tier', render: (v) => <Badge label={v || '—'} color={v === 'OURO' ? 'amber' : v === 'PRATA' ? 'gray' : 'blue'} /> },
  { key: 'status',       label: 'Status', render: (v) => <Badge label={v} color={STATUS_COLOR[v] || 'gray'} /> },
  { key: 'preco_moedas', label: '🪙 Preço' },
  { key: 'created_at',   label: 'Data', render: v => v ? new Date(v).toLocaleDateString('pt-BR') : '—' },
];

export default function Leads() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [erro, setErro]       = useState('');
  const [sucesso, setSucesso] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [parceiros, setParceiros] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const f = filtroStatus ? `status=${filtroStatus}` : '';
      setRows((await api.leads(1, f))?.leads || []);
    } catch(e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  async function loadParceiros() {
    try {
      const d = await api.parceiros();
      setParceiros(d?.parceiros || []);
    } catch {}
  }

  useEffect(() => { load(); loadParceiros(); }, [filtroStatus]);

  function abrirEditar(row) {
    setForm({
      ...row,
      cidade: row.cidade || '',
      uf: row.uf || '',
      partner_id_transferir: '',
    });
    setModal(true);
    setErro('');
  }

  async function salvar() {
    setSaving(true); setErro('');
    try {
      const payload = {
        status: form.status,
        preco_moedas: Number(form.preco_moedas),
        classificacao: form.classificacao,
        cidade: form.cidade || null,
        uf: form.uf || null,
        tecnologia: form.tecnologia || null,
      };
      if (form.partner_id_transferir) payload.partner_id_transferir = form.partner_id_transferir;
      await api.atualizarLead(form.id, payload);
      setSucesso('Lead atualizado com sucesso!');
      setModal(false);
      await load();
    } catch(e) { setErro(e.message); }
    finally { setSaving(false); }
  }

  async function excluir(row) {
    if (!confirm('Excluir este lead permanentemente?')) return;
    try { await api.excluirLead(row.id); await load(); }
    catch(e) { alert(e.message); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const semCidade = rows.filter(r => !r.cidade || !r.uf).length;

  return (
    <Layout title="Leads">
      <PageHeader title="Leads" subtitle="Marketplace de leads qualificados" />

      {semCidade > 0 && (
        <div style={{background:'#FEF3C7',border:'1px solid #FDE68A',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#92400E',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
          <span>⚠️</span>
          <span><strong>{semCidade} lead(s)</strong> sem Cidade/UF registrada. Edite para corrigir — isso é essencial para o leilão por região.</span>
        </div>
      )}

      {sucesso && <div style={{background:'#ECFDF5',border:'1px solid rgba(5,150,105,0.2)',borderRadius:10,padding:'10px 16px',fontSize:13,color:'#059669',marginBottom:16,display:'flex',justifyContent:'space-between'}}>
        {sucesso} <span style={{cursor:'pointer'}} onClick={()=>setSucesso('')}>✕</span>
      </div>}
      {erro && !modal && <div style={{background:'#fee2e2',color:'#991b1b',padding:'12px 16px',borderRadius:8,marginBottom:16}}>{erro}</div>}

      {/* Filtros */}
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        {['','NOVO','QUALIFICADO','VENDIDO','EXCLUSIVO_3ES','ARQUIVADO'].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)} style={{
            padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13,
            background: filtroStatus===s ? '#0a0a0a' : '#fff',
            color: filtroStatus===s ? '#f5c842' : '#555',
            border: filtroStatus===s ? 'none' : '1px solid #e0ddd6',
          }}>{s || 'Todos'}</button>
        ))}
        {semCidade > 0 && (
          <button onClick={() => {}} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #FDE68A',cursor:'pointer',fontSize:13,background:'#FEF3C7',color:'#92400E',fontWeight:600}}>
            ⚠️ Sem cidade ({semCidade})
          </button>
        )}
      </div>

      <DataTable columns={COLS} rows={rows} loading={loading} onEdit={abrirEditar} onDelete={excluir} />

      <Modal open={modal} title="Editar lead" onClose={() => setModal(false)} onSave={salvar} saving={saving}>
        {erro && <div style={{background:'#fee2e2',color:'#991b1b',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13}}>{erro}</div>}

        {/* Aviso se sem cidade */}
        {(!form.cidade || !form.uf) && (
          <div style={{background:'#FEF3C7',border:'1px solid #FDE68A',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#92400E',marginBottom:16}}>
            ⚠️ Este lead está sem Cidade/UF. Preencha para que apareça no leilão correto.
          </div>
        )}

        {/* Cidade / UF */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px',gap:12,marginBottom:16}}>
          <Field label="Cidade">
            <input value={form.cidade||''} onChange={set('cidade')}
              placeholder="Ex: Campinas"
              style={{width:'100%',padding:'10px 14px',border:'1px solid #e0ddd6',borderRadius:8,fontSize:14,boxSizing:'border-box',fontFamily:'inherit'}} />
          </Field>
          <Field label="UF">
            <select value={form.uf||''} onChange={set('uf')}
              style={{width:'100%',padding:'10px 8px',border:'1px solid #e0ddd6',borderRadius:8,fontSize:14,background:'white',fontFamily:'inherit'}}>
              <option value="">—</option>
              {UFS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Status">
          <Select value={form.status} onChange={set('status')}>
            {['NOVO','QUALIFICADO','RESERVADO_PAG','VENDIDO','EXCLUSIVO_3ES','ARQUIVADO'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Classificação">
          <Select value={form.classificacao} onChange={set('classificacao')}>
            {['BRONZE','PRATA','OURO'].map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Tecnologia">
          <Select value={form.tecnologia||''} onChange={set('tecnologia')}>
            <option value="">Manter atual</option>
            {['ON_GRID','BESS','ACL','TARIFA_BRANCA','ASSINATURA'].map(t => <option key={t} value={t}>{TEC_ICON[t]} {t}</option>)}
          </Select>
        </Field>
        <Field label="Preço (moedas)">
          <input type="number" value={form.preco_moedas??1} onChange={set('preco_moedas')} min={0}
            style={{width:'100%',padding:'10px 14px',border:'1px solid #e0ddd6',borderRadius:8,fontSize:14,boxSizing:'border-box'}} />
        </Field>

        {/* Transferência */}
        <Field label="Transferir para parceiro (opcional)">
          <select value={form.partner_id_transferir||''} onChange={set('partner_id_transferir')}
            style={{width:'100%',padding:'10px 14px',border:'1px solid #e0ddd6',borderRadius:8,fontSize:14,background:'white',fontFamily:'inherit'}}>
            <option value="">Não transferir</option>
            {parceiros.map(p => (
              <option key={p.user_id||p.id} value={p.user_id||p.id}>
                {p.nome_responsavel} — {p.cidade}/{p.uf}
              </option>
            ))}
          </select>
        </Field>
      </Modal>
    </Layout>
  );
}
