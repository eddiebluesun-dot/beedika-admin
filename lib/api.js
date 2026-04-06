import { getToken, API_URL } from './auth';

async function req(method, path, body) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data.data ?? data;
}

export const api = {
  login:             (email, senha)    => req('POST', '/api/auth/login', { email, senha }),
  stats:             ()                => req('GET',  '/api/admin/stats'),
  usuarios:          ()                => req('GET',  '/api/admin/users'),
  criarUsuario:      (b)               => req('POST', '/api/admin/users', b),
  atualizarUsuario:  (id, b)           => req('PUT',  `/api/admin/users/${id}`, b),
  excluirUsuario:    (id)              => req('DELETE',`/api/admin/users/${id}`),
  clientes:          (p=1)             => req('GET',  `/api/admin/clientes?page=${p}`),
  clienteDetalhe:    (id)              => req('GET',  `/api/admin/clientes/${id}`),
  excluirCliente:    (id)              => req('DELETE',`/api/admin/clientes/${id}`),
  leads:             (p=1,f='')        => req('GET',  `/api/admin/leads?page=${p}&${f}`),
  atualizarLead:     (id, b)           => req('PUT',  `/api/admin/leads/${id}`, b),
  excluirLead:       (id)              => req('DELETE',`/api/admin/leads/${id}`),
  parceiros:         ()                => req('GET',  '/api/admin/parceiros'),
  atualizarParceiro: (id, b)           => req('PUT',  `/api/admin/parceiros/${id}`, b),
  planos:            ()                => req('GET',  '/api/admin/planos'),
  criarPlano:        (b)               => req('POST', '/api/admin/planos', b),
  atualizarPlano:    (id, b)           => req('PUT',  `/api/admin/planos/${id}`, b),
  conversas:         (p=1)             => req('GET',  `/api/admin/conversas?page=${p}`),

  // Distribuidoras
  distribuidoras:       ()        => req('GET',  '/api/admin/distribuidoras'),
  criarDistribuidora:   (b)       => req('POST', '/api/admin/distribuidoras', b),
  atualizarDistrib:     (id, b)   => req('PUT',  `/api/admin/distribuidoras/${id}`, b),
  excluirDistrib:       (id)      => req('DELETE',`/api/admin/distribuidoras/${id}`),
  toggleDistrib:        (id, ativo) => req('PUT', `/api/admin/distribuidoras/${id}`, { ativo }),

  // Configurações leilão
  configuracoes:        ()        => req('GET',  '/api/admin/configuracoes'),
  salvarConfiguracoes:  (b)       => req('POST', '/api/admin/configuracoes', b),

  // Parceiros — aprovar/banir/gratuidade/edição/bonus
  aprovarParceiro:      (id, acao, motivo) => req('POST', `/api/admin/parceiros/${id}/aprovar`, { acao, motivo }),
  gratuidade:           (id, b)   => req('POST', `/api/admin/parceiros/${id}/gratuidade`, b),
  atualizarParceiro:    (id, b)   => req('PUT',  `/api/admin/parceiros/${id}`, b),
  excluirParceiro:      (id)      => req('DELETE',`/api/admin/parceiros/${id}`),
  bonificarParceiro:    (id, b)   => req('POST', `/api/admin/parceiros/${id}/bonificar`, b),
  reembolsoParceiro:    (id, b)   => req('POST', `/api/admin/parceiros/${id}/reembolso`, b),
  forceAudit:           (b)       => req('POST', '/api/admin/force-audit', b),
  criarCliente:         (b)       => req('POST', '/api/admin/clientes', b),
};
