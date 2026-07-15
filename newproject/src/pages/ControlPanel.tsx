import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';
import { loadRisks, getRiskMetrics } from '@/data/risksData';
import { loadModules } from '@/data/modulesData';

interface MonthlySnapshot {
  mes: string;
  healthScore: number;
  goLive: number;
  integracoes: number;
  testes: number;
  incidentes: number;
  createdAt: string;
}

export default function ControlPanel() {
  const TARGETS_STORAGE = 'lg-dashboard:control-panel-targets';
  const METRICS_STORAGE = 'lg-dashboard:control-panel-metrics';
  const HISTORY_STORAGE = 'lg-dashboard:control-panel-history';

  const [targets, setTargets] = React.useState(() => {
    const saved = localStorage.getItem(TARGETS_STORAGE);
    return saved
      ? JSON.parse(saved)
      : {
          healthScore: 100,
          goLiveModulos: 100,
          integracoesImplementadas: 100,
          testesHomologados: 100,
          incidentesCriticos: 0,
        };
  });

  const [manualMetrics, setManualMetrics] = React.useState(() => {
    const saved = localStorage.getItem(METRICS_STORAGE);
    return saved
      ? JSON.parse(saved)
      : {
          integracoesImplementadas: 85,
          testesHomologados: 92,
        };
  });

  // Antes: JSON.parse(localStorage.getItem('lg-dashboard:modules') || '[]')
  // direto, o que zerava o Go-Live no primeiro acesso de um navegador novo.
  // Agora usa o loader com fallback garantido, igual ao resto do dashboard.
  const modules = loadModules();
  const riskMetrics = getRiskMetrics(loadRisks());

  const completedModules = modules.filter((m) => m.status === 'completed').length;

  const progressoProjetoCalculado =
    modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;
  const goLiveModulosCalculado = progressoProjetoCalculado;

  const integracoesImplementadasCalculado = manualMetrics.integracoesImplementadas;
  const testesHomologadosCalculado = manualMetrics.testesHomologados;
  const incidentesCriticosCalculado = riskMetrics.critical;

  const riscosScore =
    incidentesCriticosCalculado === 0 ? 100 : incidentesCriticosCalculado <= 3 ? 80 : 40;

  const healthScoreCalculado = Math.round(
    goLiveModulosCalculado * 0.4 +
      integracoesImplementadasCalculado * 0.2 +
      testesHomologadosCalculado * 0.2 +
      riscosScore * 0.2
  );

  React.useEffect(() => {
    localStorage.setItem(TARGETS_STORAGE, JSON.stringify(targets));
  }, [targets]);

  React.useEffect(() => {
    localStorage.setItem(METRICS_STORAGE, JSON.stringify(manualMetrics));
  }, [manualMetrics]);

  // Histórico agora é estado do React (não lido direto do localStorage no
  // render), então a tabela atualiza sozinha assim que você salva - antes
  // ficava "travado" até algo mais forçar a tela a atualizar.
  const [history, setHistory] = React.useState<MonthlySnapshot[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_STORAGE) || '[]');
    } catch {
      return [];
    }
  });
  const [savedFeedback, setSavedFeedback] = React.useState(false);

  // Indica explicitamente se "maior é melhor" (ex.: % implantado) ou "menor
  // é melhor" (ex.: incidentes). Sem essa marcação, editar a meta de
  // Incidentes Críticos para um valor diferente de zero invertia o semáforo
  // e passava a tratar mais incidentes como algo bom - esse era o bug.
  const indicators = [
    { name: 'Health Score do Programa', target: targets.healthScore, current: healthScoreCalculado, higherIsBetter: true },
    { name: 'Go-Live dos Módulos', target: targets.goLiveModulos, current: progressoProjetoCalculado, higherIsBetter: true },
    { name: 'Integrações Implementadas', target: targets.integracoesImplementadas, current: integracoesImplementadasCalculado, higherIsBetter: true },
    { name: 'Testes Homologados', target: targets.testesHomologados, current: testesHomologadosCalculado, higherIsBetter: true },
    { name: 'Incidentes Críticos', target: targets.incidentesCriticos, current: riskMetrics.critical, higherIsBetter: false },
  ];

  const saveMonthlySnapshot = () => {
    const snapshot: MonthlySnapshot = {
      mes: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }),
      healthScore: healthScoreCalculado,
      goLive: goLiveModulosCalculado,
      integracoes: integracoesImplementadasCalculado,
      testes: testesHomologadosCalculado,
      incidentes: incidentesCriticosCalculado,
      createdAt: new Date().toISOString(),
    };

    const updated = [...history.filter((s) => s.mes !== snapshot.mes), snapshot];
    setHistory(updated);
    localStorage.setItem(HISTORY_STORAGE, JSON.stringify(updated));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Fórmula agora depende de higherIsBetter, então "menor é melhor"
  // (Incidentes Críticos) nunca mais inverte, seja qual for a meta definida.
  const getStatus = (target: number, current: number, higherIsBetter: boolean) => {
    if (higherIsBetter) {
      if (target === 0) return current === 0 ? '🟢' : '🔴';
      const ratio = current / target;
      if (ratio >= 0.8) return '🟢';
      if (ratio >= 0.5) return '🟡';
      return '🔴';
    }
    // menor é melhor: está dentro da meta = ótimo; quanto mais passar, pior
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
          Metas são configuráveis. Valores atuais e status são calculados automaticamente.
        </p>

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
                    <input
                      type="number"
                      min={0}
                      max={item.name === 'Incidentes Críticos' ? undefined : 100}
                      value={item.target}
                      className="w-20 text-center border border-border rounded px-2 py-1"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        switch (item.name) {
                          case 'Health Score do Programa':
                            setTargets((prev: any) => ({ ...prev, healthScore: value }));
                            break;
                          case 'Go-Live dos Módulos':
                            setTargets((prev: any) => ({ ...prev, goLiveModulos: value }));
                            break;
                          case 'Integrações Implementadas':
                            setTargets((prev: any) => ({ ...prev, integracoesImplementadas: value }));
                            break;
                          case 'Testes Homologados':
                            setTargets((prev: any) => ({ ...prev, testesHomologados: value }));
                            break;
                          case 'Incidentes Críticos':
                            setTargets((prev: any) => ({ ...prev, incidentesCriticos: value }));
                            break;
                        }
                      }}
                    />
                  </td>

                  <td className="text-center p-4">
                    {item.name === 'Integrações Implementadas' || item.name === 'Testes Homologados' ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.current}
                        className="w-20 text-center border border-border rounded px-2 py-1"
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (item.name === 'Integrações Implementadas') {
                            setManualMetrics((prev: any) => ({ ...prev, integracoesImplementadas: value }));
                          }
                          if (item.name === 'Testes Homologados') {
                            setManualMetrics((prev: any) => ({ ...prev, testesHomologados: value }));
                          }
                        }}
                      />
                    ) : (
                      item.current
                    )}
                  </td>
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
                        <th className="text-center p-3 font-semibold text-muted-foreground">Integrações</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Testes</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Incidentes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((snap) => (
                        <tr key={snap.mes} className="border-t border-border">
                          <td className="p-3">{snap.mes}</td>
                          <td className="text-center p-3 font-semibold">{snap.healthScore}%</td>
                          <td className="text-center p-3">{snap.goLive}%</td>
                          <td className="text-center p-3">{snap.integracoes}%</td>
                          <td className="text-center p-3">{snap.testes}%</td>
                          <td className="text-center p-3">{snap.incidentes}</td>
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
