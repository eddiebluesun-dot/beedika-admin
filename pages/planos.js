import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Badge, PageHeader, Btn, Field, Input, Select } from '../components/UI';
import { api } from '../lib/api';

const COLS = [
  { key: 'nome',       label: 'Nome' },
  { key: 'target',     label: 'Target', render: v => <Badge label={v} color={v === 'PARCEIRO' ? 'blue' : 'green'} /> },
  { key: 'preco',  label: 'Preço/mês', render: v => v === 0 ? <Badge label="Grátis" color="green" /> : `R$ ${Number(v).toFixed(2)}` },
  { key: 'moedas_mes', label: '🪙 Moedas/mês' },
  { key: 'is_vip',     label: 'VIP', render: v => v ? <Badge label="VIP" color="amber" /> : '—' },
  { key: 'ativo',      label: 'Status', render: v => <Badge label={v ? 'Ativo' : 'Inativo'} color={v ? 'green' : 'red'} /> },
];

function empty() { return { nome: '', target: 'CLIENTE', preco_mes: 0, moedas_mes: 0, is_vip: false, ativo: true, vantagens: [], promocao: '', promocao_expira: '' }; }

export default function Planos() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(empty());
  const [saving, setSaving]   = useState(false);
  const [erro, setErro]       = useState('');

  async function load() {
    setLoading(true);
    try { setRows((await api.planos()) || []); }
    catch(e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function abrirCriar()    { setForm(empty()); setModal(true); setErro(''); }
  function abrirEditar(row){ setForm({ ...row, vantagens: Array.isArray(row.vantagens) ? row.vantagens.join('\n') : '' }); setModal(true); setErro(''); }

  async function salvar() {
    setSaving(true); setErro('');
    try {
      const payload = { ...form, vantagens: typeof form.vantagens === 'string' ? form.vantagens.split('\n').filter(Boolean) : form.vantagens };
      if (form.id) await api.atualizarPlano(form.id, payload);
      else         await api.criarPlano(payload);
      setModal(false); await load();
    } catch(e) { setErro(e.message); }
    finally { setSaving(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setBool = k => e => setForm(f => ({ ...f, [k]: e.target.value === 'true' }));

  return (
    <Layout title="Planos">
      <PageHeader
        title="Planos & Assinaturas"
        subtitle="Configure planos, preços, promoções e gratuidades"
        action={<Btn onClick={abrirCriar}>+ Novo plano</Btn>}
      />

      {erro && !modal && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{erro}</div>}

      {/* Cards dos planos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        {rows.map((p, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e5dc',
            borderTop: `4px solid ${p.is_vip ? '#f5c842' : p.target === 'PARCEIRO' ? '#6366f1' : '#10b981'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{p.nome}</span>
              {p.is_vip && <span style={{ background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>⭐ VIP</span>}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
              {p.preco === 0 ? <span style={{ color: '#10b981' }}>Grátis</span> : `R$${Number(p.preco).toFixed(0)}`}
              {p.preco > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/mês</span>}
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>🪙 {p.moedas_mes} moedas/mês · {p.target}</div>
            {Array.isArray(p.vantagens) && p.vantagens.slice(0,3).map((v, j) => (
              <div key={j} style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>✓ {v}</div>
            ))}
            <button onClick={() => abrirEditar(p)} style={{
              marginTop: 16, width: '100%', padding: '10px', background: '#f5f4f0',
              border: '1px solid #e8e5dc', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            }}>
              ✏️ Editar plano
            </button>
          </div>
        ))}
      </div>

      <DataTable columns={COLS} rows={rows} loading={loading} onEdit={abrirEditar} />

      <Modal open={modal} title={form.id ? 'Editar plano' : 'Novo plano'} onClose={() => setModal(false)} onSave={salvar} saving={saving}>
        {erro && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{erro}</div>}
        <Field label="Nome do plano"><Input value={form.nome} onChange={set('nome')} placeholder="Ex: Parceiro PRO" /></Field>
        <Field label="Target">
          <Select value={form.target} onChange={set('target')}>
            <option value="CLIENTE">Cliente</option>
            <option value="PARCEIRO">Parceiro</option>
          </Select>
        </Field>
        <Field label="Preço mensal (R$)"><Input value={form.preco_mes} onChange={set('preco_mes')} type="number" placeholder="0 = Grátis" /></Field>
        <Field label="Moedas por mês"><Input value={form.moedas_mes} onChange={set('moedas_mes')} type="number" /></Field>
        <Field label="É VIP (acesso antecipado a leads)?">
          <Select value={String(form.is_vip)} onChange={setBool('is_vip')}>
            <option value="false">Não</option>
            <option value="true">Sim — VIP</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={String(form.ativo)} onChange={setBool('ativo')}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </Field>
        <Field label="Vantagens (uma por linha)">
          <textarea value={form.vantagens} onChange={set('vantagens')} rows={5} placeholder={"Análises ilimitadas\nEnerData completo\nHistórico de contas"} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0ddd6', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        </Field>
        <Field label="Promoção (ex: 50% OFF — deixe vazio para sem promoção)">
          <Input value={form.promocao || ''} onChange={set('promocao')} placeholder="50% OFF por 3 meses" />
        </Field>
        <Field label="Promoção válida até">
          <Input value={form.promocao_expira || ''} onChange={set('promocao_expira')} type="date" />
        </Field>
      </Modal>
    </Layout>
  );
}
