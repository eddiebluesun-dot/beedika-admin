import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const CATEGORIAS = [
  'Fabricante de Painéis',
  'Fabricante de Inversores',
  'Distribuidora de Energia',
  'Banco / Financeira',
  'Seguradora',
  'Empresa de Homologação',
  'Curso Especializado',
  'Patrocinador',
  'Outros',
];

const EMPTY = { nome:'', categoria:'Fabricante de Painéis', site:'', whatsapp:'', logo_url:'', descricao:'', destaque:false, ativo:true, visivel_cliente:true };

export default function EmpresasAliadas() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef();

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
      const d = await api.distribuidoras();
      setLista(Array.isArray(d) ? d : (d.distribuidoras || []));
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  function abrirNovo() { setForm(EMPTY); setEditId(null); setErro(''); setModal(true); }

  function abrirEditar(item) {
    setForm({
      nome: item.nome || '', categoria: item.categoria || item.tipo || 'Outros',
      site: item.site || '', whatsapp: item.whatsapp || '',
      logo_url: item.logo_url || '', descricao: item.descricao || '',
      destaque: !!item.destaque, ativo: item.ativo !== false,
      visivel_cliente: item.visivel_cliente !== false,
    });
    setEditId(item.id); setErro(''); setModal(true);
  }

  async function uploadLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { setErro('Imagem máx 2MB'); return; }
    setUploadingLogo(true);
    try {
      const token = localStorage.getItem('beedika_token');
      const fd = new FormData();
      fd.append('logo', file);
      const r = await fetch('https://api.beedika.com/api/admin/distribuidoras/upload-logo', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      const d = await r.json();
      if (r.ok) setForm(f => ({ ...f, logo_url: d.logo_url || d.data?.logo_url }));
      else setErro(d.error || 'Erro no upload');
    } catch { setErro('Erro de conexão'); }
    setUploadingLogo(false);
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro('Nome obrigatório'); return; }
    setSaving(true); setErro('');
    try {
      const payload = { ...form, tipo: form.categoria }; // compatibilidade
      if (editId) await api.atualizarDistrib(editId, payload);
      else await api.criarDistribuidora(payload);
      setModal(false); carregar();
    } catch(e) { setErro(e.message); }
    setSaving(false);
  }

  async function excluir(item) {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    try { await api.excluirDistrib(item.id); carregar(); }
    catch(e) { alert(e.message); }
  }

  async function toggleAtivo(item) {
    try { await api.toggleDistrib(item.id, !item.ativo); carregar(); }
    catch(e) { alert(e.message); }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const listaFiltrada = filtroCategoria
    ? lista.filter(i => (i.categoria || i.tipo) === filtroCategoria)
    : lista;

  const INP = ({ label, k, type='text', placeholder='' }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={type} value={form[k]||''} placeholder={placeholder} onChange={e => set(k, e.target.value)}
        style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
        onFocus={e=>e.target.style.borderColor='#0A2540'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
    </div>
  );

  return (
    <Layout title="Empresas Aliadas">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Poppins,sans-serif', fontSize:22, fontWeight:700, color:'#0A2540', margin:0 }}>🤝 Empresas Aliadas</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:'4px 0 0' }}>Parceiros exibidos no portal de parceiros e portal do cliente</p>
        </div>
        <button onClick={abrirNovo} style={{ background:'#0A2540', color:'white', padding:'10px 20px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
          + Nova empresa aliada
        </button>
      </div>

      {/* Filtro por categoria */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <button onClick={() => setFiltroCategoria('')}
          style={{ padding:'6px 14px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: !filtroCategoria?'#0A2540':'white', color: !filtroCategoria?'white':'#475569', borderColor: !filtroCategoria?'#0A2540':'#e2e8f0' }}>
          Todas
        </button>
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setFiltroCategoria(c)}
            style={{ padding:'6px 14px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: filtroCategoria===c?'#0A2540':'white', color: filtroCategoria===c?'white':'#475569', borderColor: filtroCategoria===c?'#0A2540':'#e2e8f0' }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:48, color:'#94a3b8' }}>Carregando...</div>
      ) : listaFiltrada.length === 0 ? (
        <div style={{ background:'white', borderRadius:16, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🤝</div>
          <p style={{ color:'#64748b', fontSize:15 }}>Nenhuma empresa aliada cadastrada.</p>
          <button onClick={abrirNovo} style={{ marginTop:16, background:'#0A2540', color:'white', padding:'10px 20px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600 }}>
            Cadastrar primeira
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {listaFiltrada.map(item => (
            <div key={item.id} style={{ background:'white', borderRadius:16, border:`2px solid ${item.destaque?'#F59E0B':'#e2e8f0'}`, overflow:'hidden', opacity:item.ativo?1:0.6 }}>
              <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14, borderBottom:'1px solid #f1f5f9' }}>
                <div style={{ width:52, height:52, borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden', flexShrink:0, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {item.logo_url
                    ? <img src={item.logo_url} alt={item.nome} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                    : <span style={{ fontSize:22 }}>{item.nome.charAt(0)}</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:'#0A2540', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    {item.nome}
                    {item.destaque && <span style={{ background:'rgba(245,158,11,0.1)', color:'#d97706', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:100 }}>★ Destaque</span>}
                  </div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{item.categoria || item.tipo}</div>
                </div>
              </div>
              <div style={{ padding:'12px 20px' }}>
                {item.descricao && <p style={{ fontSize:13, color:'#64748b', lineHeight:1.5, margin:'0 0 8px' }}>{item.descricao}</p>}
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {item.site && <a href={item.site} target="_blank" rel="noopener" style={{ fontSize:12, color:'#0A2540', fontWeight:600, textDecoration:'none' }}>🌐 Site</a>}
                  {item.whatsapp && (
                    <a href={`https://wa.me/55${item.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener"
                      style={{ fontSize:12, color:'#16A34A', fontWeight:600, textDecoration:'none' }}>
                      📱 {item.whatsapp}
                    </a>
                  )}
                </div>
              </div>
              <div style={{ padding:'8px 20px', display:'flex', gap:6, flexWrap:'wrap', borderTop:'1px solid #f1f5f9' }}>
                <span style={{ background:item.ativo?'#ECFDF5':'#FEF2F2', color:item.ativo?'#059669':'#dc2626', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:100 }}>
                  {item.ativo?'Ativo':'Inativo'}
                </span>
                <span style={{ background:item.visivel_cliente?'rgba(99,102,241,0.1)':'#f1f5f9', color:item.visivel_cliente?'#6366f1':'#94a3b8', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:100 }}>
                  {item.visivel_cliente?'Visível clientes':'Oculto'}
                </span>
              </div>
              <div style={{ padding:'10px 20px', display:'flex', gap:8, borderTop:'1px solid #f1f5f9' }}>
                <button onClick={() => abrirEditar(item)} style={{ flex:1, background:'#f1f5f9', border:'none', padding:'7px', borderRadius:8, cursor:'pointer', fontSize:13, color:'#475569', fontWeight:600 }}>
                  ✏️ Editar
                </button>
                <button onClick={() => toggleAtivo(item)} style={{ flex:1, background:item.ativo?'rgba(239,68,68,0.08)':'rgba(5,150,105,0.08)', border:'none', padding:'7px', borderRadius:8, cursor:'pointer', fontSize:13, color:item.ativo?'#dc2626':'#059669', fontWeight:600 }}>
                  {item.ativo?'Desativar':'Ativar'}
                </button>
                <button onClick={() => excluir(item)} style={{ background:'rgba(239,68,68,0.06)', border:'none', padding:'7px 10px', borderRadius:8, cursor:'pointer', fontSize:16, color:'#dc2626' }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'white', borderRadius:20, padding:32, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:18, fontWeight:700, color:'#0A2540', margin:0 }}>
                {editId ? 'Editar empresa aliada' : 'Nova empresa aliada'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#94a3b8' }}>✕</button>
            </div>

            {erro && <div style={{ background:'#FEF2F2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:16 }}>{erro}</div>}

            <INP label="Nome *" k="nome" placeholder="Ex: Bluesun Solar" />

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Categoria *</label>
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
                style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', background:'white', fontFamily:'inherit' }}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <INP label="Site" k="site" placeholder="https://..." />
            <INP label="WhatsApp comercial" k="whatsapp" type="tel" placeholder="(11) 99999-9999" />

            {/* Logo upload */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Logo</label>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                {form.logo_url && <img src={form.logo_url} alt="logo" style={{ width:48, height:48, objectFit:'contain', border:'1px solid #e2e8f0', borderRadius:8 }} />}
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:13, color:'#475569', fontWeight:600 }}>
                  {uploadingLogo ? 'Enviando...' : '📎 Upload'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={uploadLogo} />
              </div>
              <input type="text" value={form.logo_url||''} placeholder="Ou cole a URL do logo"
                onChange={e => set('logo_url', e.target.value)}
                style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Descrição</label>
              <textarea value={form.descricao||''} onChange={e => set('descricao', e.target.value)} rows={3}
                placeholder="Breve descrição exibida no portal..."
                style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'inherit' }} />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {[['ativo','Ativo','Visível no portal'],['destaque','Destaque','Aparece primeiro com ★'],['visivel_cliente','Visível para clientes','Exibir no portal do cliente']].map(([key,label,desc]) => (
                <label key={key} style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', padding:'10px 14px', background:'#f8fafc', borderRadius:10, border:'1px solid #f1f5f9' }}>
                  <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} style={{ width:16, height:16, accentColor:'#0A2540', flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#334155' }}>{label}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, background:'#f1f5f9', color:'#475569', padding:'11px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, fontFamily:'inherit' }}>
                Cancelar
              </button>
              <button onClick={salvar} disabled={saving} style={{ flex:2, background:'#0A2540', color:'white', padding:'11px', borderRadius:10, border:'none', cursor:saving?'not-allowed':'pointer', fontWeight:700, fontSize:14, fontFamily:'inherit', opacity:saving?0.7:1 }}>
                {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Criar empresa aliada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
