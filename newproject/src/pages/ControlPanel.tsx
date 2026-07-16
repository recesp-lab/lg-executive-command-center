import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';
import { loadRisks, getRiskMetrics } from '@/data/risksData';
import { loadModules } from '@/data/modulesData';
import { loadAuditActions } from '@/data/auditData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { chartColors, chartTick } from '@/data/chartColors';

interface MonthlySnapshot {
  mes: string;
  healthScore: number;
  goLive: number;
  auditIssues: number;
  criticalRisks: number;
  createdAt: string;
}

// Critério de semáforo por contagem, igual ao usado em OKRs e no Status
// Executivo do Projeto: 0 = verde, 1-2 = amarelo, 3+ = vermelho.
const countToScore = (count: number) => (count === 0 ? 100 : count <= 2 ? 70 : 40);

export default function ControlPanel() {
  const TARGETS_STORAGE = 'lg-dashboard:control-panel-targets';
  const HISTORY_STORAGE = 'lg-dashboard:control-panel-history-v2';

  const [targets, setTargets] = React.useState(() => {
    try {
      const saved = localStorage.getItem(TARGETS_STORAGE);
      return saved
        ? JSON.parse(saved)
        : { healthScore: 100, goLiveModulos: 100 };
    } catch {
      return { healthScore: 100, goLiveModulos: 100 };
    }
  });

  // Antes: JSON.parse(localStorage.getItem('lg-dashboard:modules') || '[]')
  // direto, o que zerava o Go-Live no primeiro acesso de um navegador novo.
  // Agora usa o loader com fallback garantido, igual ao resto do dashboard.
  const modules = loadModules();
  const riskMetrics = getRiskMetrics(loadRisks());
  const auditActions = loadAuditActions();

  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const goLiveModulosCalculado = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;

  const today = new Date();
  const auditIssuesCalculado = new Set(
    auditActions
      .filter(
        (a) =>
          a.status === 'blocked' ||
          (a.status !== 'completed' && a.endDate && new Date(a.endDate) < today)
      )
      .map((a) => a.id)
  ).size;

  const criticalRisksCalculado = riskMetrics.critical;

  const auditScore = countToScore(auditIssuesCalculado);
  const riskScore = countToScore(criticalRisksCalculado);

  // Fórmula revisada: os dois indicadores manuais (Integrações/Testes) saíram
  // e viraram sinais 100% automáticos de Auditoria e Riscos, então o Health
  // Score agora pondera só o que é medido de verdade: Go-Live (50%),
  // problemas de auditoria (25%) e riscos críticos (25%).
  const healthScoreCalculado = Math.round(
    goLiveModulosCalculado * 0.5 + auditScore * 0.25 + riskScore * 0.25
  );

  React.useEffect(() => {
    try {
      localStorage.setItem(TARGETS_STORAGE, JSON.stringify(targets));
    } catch {
      // localStorage indisponível
    }
  }, [targets]);

  // Histórico agora é estado do React (não lido direto do localStorage no
  // render), então a tabela atualiza sozinha assim que você salva.
  const [history, setHistory] = React.useState<MonthlySnapshot[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_STORAGE) || '[]');
    } catch {
      return [];
    }
  });
  const [savedFeedback, setSavedFeedback] = React.useState(false);

  // higherIsBetter marca explicitamente o sentido de cada indicador. Sem
  // isso, editar a meta de um indicador "menor é melhor" para um valor
  // diferente de zero podia inverter o semáforo - esse já foi um bug real
  // aqui antes.
  const indicators = [
    { name: 'Health Score do Programa', target: targets.healthScore, current: healthScoreCalculado, higherIsBetter: true, editableTarget: true },
    { name: 'Go-Live dos Módulos', target: targets.goLiveModulos, current: goLiveModulosCalculado, higherIsBetter: true, editableTarget: true },
    { name: 'Ações de Auditoria em Atraso/Bloqueadas', target: 0, current: auditIssuesCalculado, higherIsBetter: false, editableTarget: false },
    { name: 'Riscos Críticos', target: 0, current: criticalRisksCalculado, higherIsBetter: false, editableTarget: false },
  ];

  const saveMonthlySnapshot = () => {
    const snapshot: MonthlySnapshot = {
      mes: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
      healthScore: healthScoreCalculado,
      goLive: goLiveModulosCalculado,
      auditIssues: auditIssuesCalculado,
      criticalRisks: criticalRisksCalculado,
      createdAt: new Date().toISOString(),
    };

    const updated = [...history.filter((s) => s.mes !== snapshot.mes), snapshot];
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE, JSON.stringify(updated));
    } catch {
      // localStorage indisponível
    }
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Fórmula depende de higherIsBetter, então indicadores "menor é melhor"
  // (Auditoria, Riscos) nunca invertem, seja qual for a meta.
  const getStatus = (target: number, current: number, higherIsBetter: boolean) => {
    if (higherIsBetter) {
      if (target === 0) return current === 0 ? '🟢' : '🔴';
      const ratio = current / target;
      if (ratio >= 0.8) return '🟢';
      if (ratio >= 0.5) return '🟡';
      return '🔴';
    }
    if (current <= target) return '🟢';
    const excess = current - target;
    if (excess <= 2) return '🟡';
    return '🔴';
  };

  return (
    <DashboardLayout currentPage="control-panel">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Painel de Controle
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Metas são configuráveis onde faz sentido. Os quatro indicadores abaixo são recalculados automaticamente a
          partir de Módulos, Auditoria e Riscos - nenhum é mais um número digitado manualmente.
        </p>

        <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Meta vs. Atual
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              layout="vertical"
              data={indicators.map((i) => ({ name: i.name, Meta: i.target, Atual: i.current }))}
              margin={{ left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={chartTick} />
              <YAxis type="category" dataKey="name" width={180} tick={chartTick} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Meta" fill={chartColors.grayLight} radius={[0, 4, 4, 0]} />
              <Bar dataKey="Atual" fill={chartColors.primary} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="Atual" position="right" style={{ fontSize: 11, fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Status Geral do Programa</h2>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4">Indicador</th>
                <th className="text-center p-4">Meta</th>
                <th className="text-center p-4">Atual</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {indicators.map((item) => (
                <tr key={item.name} className="border-t border-border">
                  <td className="p-4">{item.name}</td>

                  <td className="text-center p-4">
                    {item.editableTarget ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.target}
                        className="w-20 text-center border border-border rounded px-2 py-1"
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (item.name === 'Health Score do Programa') {
                            setTargets((prev: any) => ({ ...prev, healthScore: value }));
                          }
                          if (item.name === 'Go-Live dos Módulos') {
                            setTargets((prev: any) => ({ ...prev, goLiveModulos: value }));
                          }
                        }}
                      />
                    ) : (
                      <span className="text-muted-foreground">{item.target}</span>
                    )}
                  </td>

                  <td className="text-center p-4 font-semibold">{item.current}</td>

                  <td className="text-center p-4 text-xl">
                    {getStatus(item.target, item.current, item.higherIsBetter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-border p-6 bg-gray-50">
            <div className="flex items-center gap-3">
              <button
                onClick={saveMonthlySnapshot}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800"
              >
                Salvar Fechamento Mensal
              </button>
              {savedFeedback && <span className="text-sm text-green-600">Fechamento salvo ✓</span>}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Histórico Mensal</h3>

              {history.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-white">
                  Nenhum fechamento mensal salvo ainda.
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 font-semibold text-muted-foreground">Mês</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Health Score</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Go-Live</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Auditoria em Atraso/Bloqueada</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Riscos Críticos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((snap) => (
                        <tr key={snap.mes} className="border-t border-border">
                          <td className="p-3">{snap.mes}</td>
                          <td className="text-center p-3 font-semibold">{snap.healthScore}%</td>
                          <td className="text-center p-3">{snap.goLive}%</td>
                          <td className="text-center p-3">{snap.auditIssues}</td>
                          <td className="text-center p-3">{snap.criticalRisks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
