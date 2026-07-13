import DashboardLayout from '@/components/DashboardLayout';
import { Target, TrendingUp, TrendingDown, AlertTriangle, Users, Clock, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  computeObjectives,
  keyResultProgress,
  computeScheduleAdherence,
  computeWorkload,
  generateExecutiveSummary,
  loadManualMetrics,
  saveManualMetrics,
  loadHistory,
  saveSnapshot,
  computeCoreMetrics,
  type ManualMetrics,
} from '@/data/okrData';

export default function OKRs() {
  const [objectives] = useState(computeObjectives());
  const [manual, setManual] = useState<ManualMetrics>(() => loadManualMetrics());
  const [history, setHistory] = useState(() => loadHistory());
  const [snapshotSaved, setSnapshotSaved] = useState(false);

  const summary = generateExecutiveSummary();
  const adherence = computeScheduleAdherence();
  const workload = computeWorkload();
  const core = computeCoreMetrics();

  const handleManualChange = (patch: Partial<ManualMetrics>) => {
    const updated = { ...manual, ...patch };
    setManual(updated);
    saveManualMetrics(updated);
  };

  const handleSaveSnapshot = () => {
    const today = new Date().toISOString().slice(0, 10);
    saveSnapshot({
      date: today,
      completionRate: core.completionRate,
      riskExposure: core.riskExposureIndex,
      auditProgress: core.auditProgress,
    });
    setHistory(loadHistory());
    setSnapshotSaved(true);
    setTimeout(() => setSnapshotSaved(false), 2000);
  };

  const progressColor = (pct: number) =>
    pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <DashboardLayout currentPage="okrs">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                OKRs & Indicadores Executivos
              </h1>
            </div>
            <Button variant="outline" onClick={() => window.print()}>
              Gerar Relatório
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Objetivos, resultados-chave e KPIs recalculados a partir dos dados reais de Módulos, Riscos, Auditoria e Equipe
          </p>
        </div>

        {/* Resumo Executivo */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">Resumo Executivo</h2>
          <p className="text-sm text-blue-900">{summary}</p>
        </div>

        {/* Objetivos e Key Results */}
        <div className="space-y-6 mb-10">
          {objectives.map((obj) => {
            const overallProgress = Math.round(
              obj.keyResults.reduce((sum, kr) => sum + keyResultProgress(kr), 0) / obj.keyResults.length
            );
            return (
              <div key={obj.id} className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground pr-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {obj.title}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
                      overallProgress >= 70
                        ? 'bg-green-50 text-green-700'
                        : overallProgress >= 40
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {overallProgress}% no geral
                  </span>
                </div>

                <div className="space-y-4">
                  {obj.keyResults.map((kr) => {
                    const pct = keyResultProgress(kr);
                    return (
                      <div key={kr.id}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            {kr.label}
                            {!kr.automatic && (
                              <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                manual
                              </span>
                            )}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {kr.current}
                            {kr.unit === '%' ? '%' : ''} / meta {kr.target}
                            {kr.unit === '%' ? '%' : ''}
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`${progressColor(pct)} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Edição manual dos KRs não-automáticos deste objetivo */}
                {obj.id === 'o2' && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold mb-1 block">
                        Satisfação da equipe de RH (0-10)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        className="w-full p-2 border border-border rounded-lg text-sm"
                        value={manual.satisfaction}
                        onChange={(e) => handleManualChange({ satisfaction: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold mb-1 block">
                        Chamados de suporte (pós-lançamento)
                      </label>
                      <input
                        type="number"
                        min={0}
                        className="w-full p-2 border border-border rounded-lg text-sm"
                        value={manual.supportTickets}
                        onChange={(e) => handleManualChange({ supportTickets: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* KPIs Executivos Novos */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            KPIs Executivos Adicionais
          </h2>
          <p className="text-xs text-muted-foreground">Três indicadores novos, além dos que já existem na Home</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* KPI 1: Aderência ao Cronograma */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground font-semibold">Aderência ao Cronograma</p>
              <div className={`${adherence.rate >= 70 ? 'bg-green-50' : 'bg-red-50'} p-3 rounded-lg`}>
                {adherence.rate >= 70 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground mb-1">{adherence.rate}%</p>
            <p className="text-xs text-muted-foreground">
              {adherence.onTime} de {adherence.total} itens com data (módulos + auditoria) dentro do prazo
            </p>
          </div>

          {/* KPI 2: Carga de Trabalho por Responsável */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground font-semibold">Carga de Trabalho por Responsável</p>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            {workload.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum item aberto atribuído no momento.</p>
            ) : (
              <div className="space-y-2">
                {workload.slice(0, 5).map((w) => (
                  <div key={w.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate pr-2">{w.name}</span>
                    <span
                      className={`shrink-0 font-bold ${
                        w.total >= 4 ? 'text-red-600' : w.total >= 2 ? 'text-yellow-600' : 'text-foreground'
                      }`}
                    >
                      {w.total}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">Riscos abertos + ações de auditoria ativas, por pessoa</p>
          </div>

          {/* KPI 3: Tempo Médio de Resolução (manual, com nota de transparência) */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground font-semibold">Tempo Médio de Resolução (dias)</p>
              <div className="bg-orange-50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <input
              type="number"
              min={0}
              className="w-24 p-2 border border-border rounded-lg text-2xl font-mono font-bold mb-2"
              value={manual.avgResolutionDays}
              onChange={(e) => handleManualChange({ avgResolutionDays: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Preenchimento manual. Para ficar 100% automático, riscos e ações de auditoria precisariam guardar a data em
              que foram criados e a data em que foram resolvidos — hoje só existe o prazo (due date).
            </p>
          </div>
        </div>

        {/* Tendência / Histórico */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tendência ao Longo do Tempo
              </h2>
              <p className="text-xs text-muted-foreground">
                Salve um snapshot periodicamente (ex.: toda semana) para acompanhar a evolução
              </p>
            </div>
            <div className="flex items-center gap-3">
              {snapshotSaved && <span className="text-xs text-green-600">Snapshot salvo ✓</span>}
              <Button className="bg-primary hover:bg-blue-800 text-white gap-2" onClick={handleSaveSnapshot}>
                <Save className="w-4 h-4" />
                Salvar Snapshot de Hoje
              </Button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              Nenhum snapshot salvo ainda. Clique em "Salvar Snapshot de Hoje" para começar o histórico.
            </div>
          ) : (
            <div className="space-y-4">
              {(['completionRate', 'riskExposure', 'auditProgress'] as const).map((key) => {
                const labels = {
                  completionRate: 'Taxa de Conclusão dos Módulos',
                  riskExposure: 'Índice de Exposição a Risco',
                  auditProgress: 'Progresso da Auditoria',
                };
                return (
                  <div key={key}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{labels[key]}</p>
                    <div className="flex items-end gap-1 h-16">
                      {history.map((snap) => (
                        <div key={snap.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${snap.date}: ${snap[key]}%`}>
                          <div
                            className="w-full bg-primary rounded-t"
                            style={{ height: `${Math.max(snap[key], 4)}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{history[0]?.date}</span>
                      <span>{history[history.length - 1]?.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alerta de riscos críticos, se houver */}
        {(core.riskMetrics.critical > 0 || core.overdueAudit > 0 || core.blockedAudit > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">
              Pontos de atenção: {core.riskMetrics.critical > 0 && `${core.riskMetrics.critical} risco(s) crítico(s) aberto(s)`}
              {core.riskMetrics.critical > 0 && (core.overdueAudit > 0 || core.blockedAudit > 0) && ' · '}
              {core.overdueAudit > 0 && `${core.overdueAudit} ação(ões) de auditoria em atraso`}
              {core.overdueAudit > 0 && core.blockedAudit > 0 && ' · '}
              {core.blockedAudit > 0 && `${core.blockedAudit} ação(ões) bloqueada(s)`}
            </p>
          </div>
        )}
        {core.riskMetrics.critical === 0 && core.overdueAudit === 0 && core.blockedAudit === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-900">Nenhum ponto crítico de atenção no momento.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
