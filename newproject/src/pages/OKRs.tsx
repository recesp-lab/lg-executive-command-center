import DashboardLayout from '@/components/DashboardLayout';
import ProjectHealthBanner from '@/components/ProjectHealthBanner';
import { Target, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  computeStatusGeral,
  computeObjectives,
  achievementPct,
  statusEmoji,
  objectiveScore,
  overallProgramScore,
  overallStatusLabel,
  saveTarget,
  saveManualCurrent,
  loadBenefits,
  saveBenefits,
  generateExecutiveDraft,
  loadExecutiveMessage,
  saveExecutiveMessage,
  loadHistory,
  saveSnapshot,
  computeScheduleAdherence,
  computeWorkload,
  type KeyResult,
  type Benefit,
} from '@/data/okrData';

export default function OKRs() {
  const [, forceRefresh] = useState(0);
  const rerender = () => forceRefresh((n) => n + 1);

  const statusGeral = computeStatusGeral();
  const objectives = computeObjectives();
  const overallScore = overallProgramScore(objectives);
  const overallStatus = overallStatusLabel(overallScore);

  const [benefits, setBenefits] = useState<Benefit[]>(() => loadBenefits());
  const [execMessage, setExecMessage] = useState<string>(() => loadExecutiveMessage(objectives));
  const [snapshotSaved, setSnapshotSaved] = useState(false);
  const [history] = useState(() => loadHistory());
  const adherence = computeScheduleAdherence();
  const workload = computeWorkload();

  const handleTargetChange = (id: string, value: number) => {
    saveTarget(id, value);
    rerender();
  };

  const handleCurrentChange = (id: string, value: number) => {
    saveManualCurrent(id, value);
    rerender();
  };

  const handleBenefitImpactChange = (id: string, impact: Benefit['impact']) => {
    const updated = benefits.map((b) => (b.id === id ? { ...b, impact } : b));
    setBenefits(updated);
    saveBenefits(updated);
  };

  const handleAddBenefit = () => {
    const updated = [...benefits, { id: Date.now().toString(), label: 'Novo benefício', impact: 'Média' as const }];
    setBenefits(updated);
    saveBenefits(updated);
  };

  const handleDeleteBenefit = (id: string) => {
    const updated = benefits.filter((b) => b.id !== id);
    setBenefits(updated);
    saveBenefits(updated);
  };

  const handleBenefitLabelChange = (id: string, label: string) => {
    const updated = benefits.map((b) => (b.id === id ? { ...b, label } : b));
    setBenefits(updated);
    saveBenefits(updated);
  };

  const handleSaveExecMessage = () => {
    saveExecutiveMessage(execMessage);
  };

  const handleResetExecMessage = () => {
    const draft = generateExecutiveDraft(objectives);
    setExecMessage(draft);
    saveExecutiveMessage(draft);
  };

  const handleSaveSnapshot = () => {
    saveSnapshot(objectives);
    setSnapshotSaved(true);
    setTimeout(() => setSnapshotSaved(false), 2000);
  };

  const renderKrRow = (kr: KeyResult) => {
    const pct = achievementPct(kr);
    return (
      <tr key={kr.id} className="border-t border-border">
        <td className="p-3 text-sm text-foreground">
          {kr.label}
          {!kr.automatic && (
            <span className="ml-2 text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              manual
            </span>
          )}
        </td>
        <td className="text-center p-3">
          <input
            type="number"
            step="0.1"
            value={kr.target}
            className="w-20 text-center border border-border rounded px-2 py-1 text-sm"
            onChange={(e) => handleTargetChange(kr.id, Number(e.target.value))}
          />
          {kr.targetLabel && <p className="text-[10px] text-muted-foreground mt-0.5">{kr.targetLabel}</p>}
        </td>
        <td className="text-center p-3">
          {kr.automatic ? (
            <span className="font-semibold text-foreground">
              {kr.current}
              {kr.unit === '%' ? '%' : ''}
            </span>
          ) : (
            <input
              type="number"
              step="0.1"
              value={kr.current}
              className="w-20 text-center border border-border rounded px-2 py-1 text-sm"
              onChange={(e) => handleCurrentChange(kr.id, Number(e.target.value))}
            />
          )}
        </td>
        <td className="text-center p-3 text-xl">{statusEmoji(pct)}</td>
      </tr>
    );
  };

  return (
    <DashboardLayout currentPage="okrs">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Dashboard Executivo de OKRs
            </h1>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            Gerar Relatório
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Transformação Digital de RH · Projeto LG — para Steering Committee, Sponsors e acompanhamento mensal
        </p>

        {/* Status Executivo - mesma fonte usada em Dashboard, Riscos e Auditoria.
            Só este bloco (Status Geral do Programa) é sincronizado; o Health
            Score por pilar mais abaixo mede o andamento do negócio, não se o
            projeto está bloqueado - por isso fica com lógica própria. */}
        <div className="mb-6">
          <ProjectHealthBanner />
        </div>

        {/* Status Geral do Programa */}
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Status Geral do Programa
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Metas são configuráveis. Indicadores marcados "manual" precisam ser atualizados por alguém do time;
              os demais são recalculados automaticamente a partir de Módulos, Riscos e Auditoria.
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Indicador</th>
                <th className="text-center p-3 text-xs font-semibold text-muted-foreground">Meta</th>
                <th className="text-center p-3 text-xs font-semibold text-muted-foreground">Atual</th>
                <th className="text-center p-3 text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>{statusGeral.map(renderKrRow)}</tbody>
          </table>
        </div>

        {/* Os 5 OKRs */}
        <div className="space-y-8 mb-10">
          {objectives.map((obj, idx) => {
            const score = objectiveScore(obj);
            return (
              <div key={obj.id} className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                    OKR {idx + 1} — {obj.pillar}
                  </p>
                  <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Objetivo
                  </h3>
                  <p className="text-sm text-muted-foreground">{obj.objective}</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Key Result</th>
                      <th className="text-center p-3 text-xs font-semibold text-muted-foreground">Meta</th>
                      <th className="text-center p-3 text-xs font-semibold text-muted-foreground">Atual</th>
                      <th className="text-center p-3 text-xs font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>{obj.keyResults.map(renderKrRow)}</tbody>
                </table>
                <div className="p-4 bg-gray-50 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Score OKR</span>
                  <span
                    className={`text-lg font-bold ${
                      score > 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}
                  >
                    {score}% concluído
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground -mt-6 mb-10">
          🟢 Excelente {'>'}80% · 🟡 Atenção 60%-79% · 🔴 Crítico {'<'}60%
        </p>

        {/* Resumo Executivo */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Resumo Executivo
          </h2>

          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Health Score do Programa
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {objectives.map((obj) => {
              const score = objectiveScore(obj);
              return (
                <div key={obj.id} className="p-4 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">{obj.pillar}</p>
                  <p
                    className={`text-2xl font-bold ${
                      score > 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}
                  >
                    {score}%
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <div>
              <p className="text-xs text-blue-900 font-semibold">Score Geral · Projeto LG</p>
              <p className="text-3xl font-bold text-blue-900">{overallScore}%</p>
            </div>
            <span className="text-lg font-bold text-blue-900">
              {overallStatus.emoji} {overallStatus.label}
            </span>
          </div>

          {/* Benefícios */}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Benefícios Financeiros e Operacionais Esperados
          </h3>
          <div className="space-y-2 mb-4">
            {benefits.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <input
                  className="flex-1 p-2 border border-border rounded-lg text-sm"
                  value={b.label}
                  onChange={(e) => handleBenefitLabelChange(b.id, e.target.value)}
                />
                <select
                  className="p-2 border border-border rounded-lg text-sm"
                  value={b.impact}
                  onChange={(e) => handleBenefitImpactChange(b.id, e.target.value as Benefit['impact'])}
                >
                  <option value="Alta">Alta</option>
                  <option value="Média/Alta">Média/Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
                <button onClick={() => handleDeleteBenefit(b.id)} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddBenefit}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground py-2 px-3 border border-dashed border-border rounded-lg mb-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar benefício
          </button>

          {/* Mensagem Executiva */}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Mensagem Executiva para o Steering Committee
          </h3>
          <textarea
            className="w-full p-3 border border-border rounded-lg text-sm mb-3"
            rows={4}
            value={execMessage}
            onChange={(e) => setExecMessage(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="gap-2" onClick={handleResetExecMessage}>
              <RotateCcw className="w-4 h-4" />
              Restaurar sugestão automática
            </Button>
            <Button className="bg-primary hover:bg-blue-800 text-white gap-2" onClick={handleSaveExecMessage}>
              <Save className="w-4 h-4" />
              Salvar Mensagem
            </Button>
          </div>
        </div>

        {/* Fechamento mensal / histórico */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Fechamento Mensal
              </h2>
              <p className="text-xs text-muted-foreground">
                Salva o Score Geral e o Health Score de cada pilar na data de hoje, para acompanhar a evolução mês a mês
              </p>
            </div>
            <div className="flex items-center gap-3">
              {snapshotSaved && <span className="text-xs text-green-600">Salvo ✓</span>}
              <Button className="bg-primary hover:bg-blue-800 text-white" onClick={handleSaveSnapshot}>
                Salvar Fechamento de Hoje
              </Button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              Nenhum fechamento salvo ainda.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">Data</th>
                  <th className="text-center p-2 text-xs font-semibold text-muted-foreground">Score Geral</th>
                  {objectives.map((o) => (
                    <th key={o.id} className="text-center p-2 text-xs font-semibold text-muted-foreground">
                      {o.pillar}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((snap) => (
                  <tr key={snap.date} className="border-t border-border">
                    <td className="p-2">{new Date(snap.date).toLocaleDateString('pt-BR')}</td>
                    <td className="text-center p-2 font-semibold">{snap.overall}%</td>
                    {objectives.map((o) => (
                      <td key={o.id} className="text-center p-2">
                        {snap.pillars[o.pillar] ?? '—'}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* KPIs Operacionais Adicionais - 100% automáticos, complementam o PDF */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="card-premium p-6">
            <p className="text-xs text-muted-foreground font-semibold mb-3">Aderência ao Cronograma</p>
            <p className="text-3xl font-mono font-bold text-foreground mb-1">{adherence.rate}%</p>
            <p className="text-xs text-muted-foreground">
              {adherence.onTime} de {adherence.total} itens com data (módulos + auditoria) dentro do prazo
            </p>
          </div>
          <div className="card-premium p-6">
            <p className="text-xs text-muted-foreground font-semibold mb-3">Carga de Trabalho por Responsável</p>
            {workload.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum item aberto atribuído no momento.</p>
            ) : (
              <div className="space-y-1.5">
                {workload.slice(0, 5).map((w) => (
                  <div key={w.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate pr-2">{w.name}</span>
                    <span className={`font-bold ${w.total >= 4 ? 'text-red-600' : w.total >= 2 ? 'text-yellow-600' : 'text-foreground'}`}>
                      {w.total}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
