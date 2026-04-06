import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUser, removeToken } from '../lib/auth';
import Head from 'next/head';

const NAV = [
  { href: '/',            icon: '📊', label: 'Dashboard' },
  { href: '/usuarios',    icon: '👥', label: 'Usuários' },
  { href: '/clientes',    icon: '🏠', label: 'Clientes' },
  { href: '/leads',       icon: '🎯', label: 'Leads' },
  { href: '/parceiros',   icon: '🤝', label: 'Parceiros' },
  { href: '/planos',      icon: '💳', label: 'Planos' },
  { href: '/relatorios',  icon: '📈', label: 'Relatórios' },
  { href: '/whatsapp',    icon: '💬', label: 'WhatsApp' },
  { href: '/engenheiro',  icon: '🤖', label: 'Engenheiro IA' },
  { href: '/financeiro',    icon: '💰', label: 'Financeiro' },
  { href: '/distribuidoras', icon: '🏭', label: 'Distribuidoras' },
  { href: '/configuracoes',  icon: '⚙️',  label: 'Configurações' },
];

export default function Layout({ children, title = 'Admin' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
  }, []);

  function logout() {
    removeToken();
    router.replace('/login');
  }

  return (
    <>
      <Head>
        <title>{title} — Beedika Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f5f4f0' }}>
        {/* Sidebar */}
        <aside style={{
          width: collapsed ? 64 : 220,
          background: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          flexShrink: 0,
          position: 'fixed',
          top: 0, bottom: 0, left: 0,
          zIndex: 100,
          overflowX: 'hidden',
        }}>
          {/* Logo */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <span style={{ fontSize: 24 }}>🐝</span>
            {!collapsed && <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.5px', color: '#f5c842' }}>Beedika</span>}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            {NAV.map(({ href, icon, label }) => {
              const active = router.pathname === href;
              return (
                <a key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px',
                  color: active ? '#f5c842' : '#aaa',
                  background: active ? '#1a1a1a' : 'transparent',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? '3px solid #f5c842' : '3px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  {!collapsed && <span>{label}</span>}
                </a>
              );
            })}
          </nav>

          {/* User + logout */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #222' }}>
            {!collapsed && user && (
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            )}
            <button onClick={logout} style={{
              background: '#1a1a1a', color: '#e55', border: 'none', borderRadius: 6,
              padding: collapsed ? '8px 12px' : '8px 16px', cursor: 'pointer', fontSize: 13,
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}>
              <span>🚪</span>{!collapsed && 'Sair'}
            </button>
          </div>

          {/* Collapse toggle */}
          <button onClick={() => setCollapsed(c => !c)} style={{
            position: 'absolute', right: -12, top: 24,
            width: 24, height: 24, borderRadius: '50%',
            background: '#f5c842', border: 'none', cursor: 'pointer',
            fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {collapsed ? '›' : '‹'}
          </button>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, marginLeft: collapsed ? 64 : 220, transition: 'margin-left 0.2s ease', padding: 28, minHeight: '100vh' }}>
          {children}
        </main>
      </div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </>
  );
}
