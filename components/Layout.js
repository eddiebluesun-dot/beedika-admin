// components/Layout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const NAV = [
  { href: '/',           icon: '◈',  label: 'Dashboard'  },
  { href: '/leads',      icon: '⚡', label: 'Leads'      },
  { href: '/clientes',   icon: '◉',  label: 'Clientes'   },
  { href: '/whatsapp',   icon: '◎',  label: 'WhatsApp'   },
  { href: '/financeiro', icon: '◆',  label: 'Financeiro' },
];

export default function Layout({ children, title }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--dark)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 64 : 220,
          background: 'var(--dark-800)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0 }}>🐝</span>
          {!collapsed && (
            <span
              className="font-display"
              style={{ fontSize: 16, fontWeight: 700, color: '#F5A623', letterSpacing: '-0.02em' }}
            >
              beedika
              <span style={{ color: 'var(--slate)', fontSize: 10, fontWeight: 500, marginLeft: 4 }}>
                admin
              </span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--slate)',
              cursor: 'pointer',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ href, icon, label }) => {
            const active = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 12px' : '10px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  background: active ? 'rgba(245,166,35,0.1)' : 'transparent',
                  color: active ? '#F5A623' : 'var(--slate)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  fontFamily: 'var(--font-syne)',
                  letterSpacing: active ? '0.01em' : 0,
                  transition: 'all 0.15s',
                  borderLeft: active ? '2px solid #F5A623' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = '#E8EBF0';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--slate)';
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div
          style={{
            padding: '12px 8px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {!collapsed && user && (
            <div style={{ padding: '8px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: '#E8EBF0', fontWeight: 500 }}>
                {user.nome?.split(' ')[0]}
              </div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>{user.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--slate)',
              fontSize: 12,
              cursor: 'pointer',
              borderRadius: 6,
              fontFamily: 'var(--font-dm-sans)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F87171')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--slate)')}
          >
            <span>↪</span>
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div
          style={{
            padding: '16px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--dark-800)',
            flexShrink: 0,
          }}
        >
          <h1
            className="font-display"
            style={{ fontSize: 18, fontWeight: 700, color: '#E8EBF0', letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: 'var(--font-dm-mono)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 28, overflow: 'auto' }}>{children}</div>
      </main>
    </div>
  );
}
