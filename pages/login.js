import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

export default function Login() {
  const [email, setEmail]       = useState('contato@grupo3es.com');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, user }         = useAuth();
  const router                  = useRouter();

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u?.role === 'ADMIN' || u?.role === 'ANALISTA') {
        router.replace('/');
      } else {
        setError('Acesso restrito a administradores.');
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#141414', borderRadius: 20, padding: '48px 44px',
        width: '100%', maxWidth: 420, border: '1px solid #222',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: '#f5c842', fontSize: 28, fontWeight: 700, margin: 0 }}>Beedika</h1>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Painel Administrativo</p>
        </div>

        {error && (
          <div style={{
            background: '#2a1010', border: '1px solid #5a1a1a',
            color: '#f87171', borderRadius: 10, padding: '12px 16px',
            fontSize: 13, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                background: '#1e1e1e', border: '1px solid #333', color: '#fff',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                background: '#1e1e1e', border: '1px solid #333', color: '#fff',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#8a6f00' : '#f5c842', color: '#0a0a0a',
              fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#333', fontSize: 12, marginTop: 28 }}>
          Beedika © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
