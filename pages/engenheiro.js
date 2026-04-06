import { useState } from 'react';
import Layout from '../components/Layout';
import { PageHeader, Btn } from '../components/UI';

// Prompts atuais do sistema — editáveis via API (quando endpoint for criado)
// Por ora, permite edição local e exportação para deploy
const PROMPT_DEFAULTS = {
  enerscan_extracao: `Você é um especialista em análise de contas de energia elétrica brasileiras. Extraia as seguintes informações da conta de energia em formato JSON...`,
  enerscore_interpretacao: `Você é auditor sênior de eficiência energética da Beedika. Use o EnerScore DEFINITIVO E IMUTÁVEL fornecido...`,
  normas_grupo_b: `Normas para Grupo B (BT): Res. ANEEL 733/2016 (Tarifa Branca), 956/2021, 1000/2021. NÃO citar Lei 14.300/2022 para apartamentos sem solar...`,
  normas_grupo_a: `Normas para Grupo A (MT/AT): Lei 14.120/2021, Res. ANEEL 1046/2023 (ACL), PRODIST Módulo 7, Res. 1000/2021 Art. 73 (fator de potência)...`,
  ren_1098: `REN 1.098/2024 (vigência jan/2025): Inversão de fluxo, limite de potência injetável, custo de reforço de rede (Art. 23), prazos de análise...`,
  conversacional_bee: `Você é a Bee, assistente especialista em eficiência energética da Beedika. Responda de forma amigável, clara e didática...`,
};

const DESCRICOES = {
  enerscan_extracao:       { titulo: '🔍 EnerScan — Extração de dados', desc: 'Prompt para extrair dados da conta de energia via Gemini' },
  enerscore_interpretacao: { titulo: '🎯 EnerScore — Interpretação', desc: 'Prompt para gerar EnerData completo com soluções personalizadas' },
  normas_grupo_b:          { titulo: '📋 Normas Grupo B (BT)', desc: 'Referências normativas para clientes residenciais e pequenos comércios' },
  normas_grupo_a:          { titulo: '⚡ Normas Grupo A (MT/AT)', desc: 'Referências normativas para indústrias e grandes consumidores' },
  ren_1098:                { titulo: '⚠️ REN 1.098/2024 — Inversão de Fluxo', desc: 'Conhecimento regulatório sobre risco de inversão de fluxo em GD' },
  conversacional_bee:      { titulo: '🤖 Bee — IA Conversacional', desc: 'Persona e comportamento da assistente Bee no WhatsApp' },
};

export default function Engenheiro() {
  const [prompts, setPrompts] = useState(PROMPT_DEFAULTS);
  const [ativo, setAtivo]     = useState('enerscan_extracao');
  const [salvo, setSalvo]     = useState(false);

  function salvar() {
    // Aqui chamaria api.atualizarPrompt(ativo, { conteudo: prompts[ativo] })
    // Por ora simula o save
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  function testar() {
    alert('Para testar: faça um teste completo no WhatsApp com uma conta de energia real e verifique o EnerData gerado.');
  }

  return (
    <Layout title="Engenheiro IA">
      <PageHeader
        title="Engenheiro IA"
        subtitle="Configure os prompts e a base de conhecimento do Gemini"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 180px)' }}>
        {/* Menu lateral */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5dc', overflow: 'auto' }}>
          {Object.keys(DESCRICOES).map(k => (
            <button key={k} onClick={() => setAtivo(k)} style={{
              width: '100%', padding: '14px 16px', border: 'none', textAlign: 'left',
              background: ativo === k ? '#f5f4f0' : 'transparent',
              borderLeft: ativo === k ? '3px solid #f5c842' : '3px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 14, fontWeight: ativo === k ? 600 : 400, color: ativo === k ? '#333' : '#555' }}>
                {DESCRICOES[k].titulo}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {DESCRICOES[k].desc}
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e5dc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>{DESCRICOES[ativo].titulo}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{DESCRICOES[ativo].desc}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={testar} style={{ padding: '10px 16px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                🧪 Testar
              </button>
              <button onClick={salvar} style={{
                padding: '10px 20px', background: salvo ? '#10b981' : '#f5c842',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: salvo ? '#fff' : '#333',
                transition: 'all 0.2s',
              }}>
                {salvo ? '✓ Salvo!' : '💾 Salvar'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: 24 }}>
            <textarea
              value={prompts[ativo]}
              onChange={e => setPrompts(p => ({ ...p, [ativo]: e.target.value }))}
              style={{
                width: '100%', height: '100%', minHeight: 400,
                padding: 16, border: '1px solid #e8e5dc', borderRadius: 10,
                fontSize: 13, fontFamily: "'DM Mono', 'Courier New', monospace",
                lineHeight: 1.6, resize: 'none', outline: 'none',
                background: '#fafafa', color: '#333', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ padding: '12px 24px', borderTop: '1px solid #f0ede4', fontSize: 12, color: '#aaa', display: 'flex', gap: 20 }}>
            <span>📝 {prompts[ativo].length} caracteres</span>
            <span>📊 ~{Math.ceil(prompts[ativo].length / 4)} tokens estimados</span>
            <span>⚠️ Alterações afetam todas as análises futuras</span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
        {[
          { icon: '⚡', label: 'Modelo ativo', value: 'Gemini 2.5 Flash' },
          { icon: '📋', label: 'Normas base', value: 'REN 1.098/2024 + Lei 14.300/2022' },
          { icon: '🎯', label: 'EnerScore', value: 'Determinístico v2.0 — 100% local' },
        ].map((c, i) => (
          <div key={i} style={{ background: '#0a0a0a', borderRadius: 12, padding: '16px 20px', color: '#fff' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f5c842' }}>{c.value}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
