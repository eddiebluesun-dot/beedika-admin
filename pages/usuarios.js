import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Badge, PageHeader, Btn, Field, Input, Select } from '../components/UI';
import { api } from '../lib/api';

const ROLES = ['ADMIN','ANALISTA','PARTNER_PRO','PARTNER_FREE','CLIENT_FREE','CLIENT_PRO','CLIENT_BUSINESS'];
const ROLE_COLOR = { ADMIN:'purple', ANALISTA:'blue', PARTNER_PRO:'green', PARTNER_FREE:'gray', CLIENT_FREE:'gray', CLIENT_PRO:'blue', CLIENT_BUSINESS:'amber' };

const COLS = [
  { key: 'nome',       label: 'Nome' },
  { key: 'email',      label: 'E-mail' },
  { key: 'role',       label: 'Role', render: (v) => <Badge label={v} color={ROLE_COLOR[v] || 'gray'} /> },
  { key: 'saldo_moedas', label: '🪙 Moedas' },
  { key: 'ativo',      label: 'Status', render: (v) => <Badge label={v ? 'Ativo' : 'Inativo'} color={v ? 'green' : 'red'} /> },
  { key: 'created_at', label: 'Criado em', render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '—' },
];

function empty() { return { nome: '', email: '', senha: '', role: 'CLIENT_FREE', saldo_moedas: 0, ativo: true }; }

export default function Usuarios() {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(empty());
  const [saving, setSaving] = useState(false);
  const [erro, setErro]     = useState('');

  async function load() {
    setLoading(true);
    try { setRows((await api.usuarios())?.users || []); }
    catch (e) { setErro(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function abrirCriar() { setForm(empty()); setModal(true); setErro(''); }
  function abrirEditar(row) { setForm({ ...row, senha: '' }); setModal(true); setErro(''); }

  async function salvar() {
    setSaving(true); setErro('');
    try {
      if (form.id) await api.atualizarUsuario(form.id, form);
      else         await api.criarUsuario(form);
      setModal(false);
      await load();
    } catch(e) { setErro(e.message); }
    finally { setSaving(false); }
  }

  async function excluir(row) {
    try { await api.excluirUsuario(row.id); await load(); }
    catch(e) { alert(e.message); }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Layout title="Usuários">
      <PageHeader
        title="Usuários"
        subtitle="Gerencie usuários, roles e permissões"
        action={<Btn onClick={abrirCriar}>+ Novo usuário</Btn>}
      />

      {erro && !modal && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{erro}</div>
      )}

      <DataTable columns={COLS} rows={rows} loading={loading} onEdit={abrirEditar} onDelete={excluir} />

      <Modal open={modal} title={form.id ? 'Editar usuário' : 'Novo usuário'} onClose={() => setModal(false)} onSave={salvar} saving={saving}>
        {erro && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{erro}</div>}
        <Field label="Nome"><Input value={form.nome} onChange={set('nome')} placeholder="Nome completo" /></Field>
        <Field label="E-mail"><Input value={form.email} onChange={set('email')} type="email" placeholder="email@exemplo.com" /></Field>
        {!form.id && <Field label="Senha"><Input value={form.senha} onChange={set('senha')} type="password" placeholder="Mínimo 8 caracteres" /></Field>}
        <Field label="Role">
          <Select value={form.role} onChange={set('role')}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Saldo de moedas"><Input value={form.saldo_moedas} onChange={set('saldo_moedas')} type="number" /></Field>
        <Field label="Status">
          <Select value={String(form.ativo)} onChange={e => setForm(f => ({ ...f, ativo: e.target.value === 'true' }))}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </Field>
      </Modal>
    </Layout>
  );
}
