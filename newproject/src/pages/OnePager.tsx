import DashboardLayout from '@/components/DashboardLayout';
import ProjectHealthBanner from '@/components/ProjectHealthBanner';
import { FileDown, Presentation, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { chartColors, chartTick } from '@/data/chartColors';
import { loadRisks, getRiskMetrics, type Risk } from '@/data/risksData';
import { loadModules } from '@/data/modulesData';
import { loadAuditActions } from '@/data/auditData';
import { loadTeamMembers } from '@/data/teamData';
import { computeObjectives, objectiveScore, overallProgramScore } from '@/data/okrData';
import { computeProjectHealth } from '@/data/projectHealth';
import { loadLastUpdated } from '@/data/lastUpdated';
import pptxgen from 'pptxgenjs';

const impactWeight: Record<Risk['impact'], number> = { critical: 3, medium: 2, low: 1 };

export default function OnePager() {
  const risks = loadRisks();
  const riskMetrics = getRiskMetrics(risks);

  const modules = loadModules();
  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const completionPct = modules.length ? Math.round((completedModules / modules.length) * 100) : 0;

  const moduleDonutData = [
    { name: 'Implantados', value: modules.filter((m) => m.status === 'completed').length, color: '#3B82F6' },
    { name: 'Em Andamento', value: modules.filter((m) => m.status === 'in-progress').length, color: '#FACC15' },
    { name: 'Não Iniciado', value: modules.filter((m) => m.status === 'not-started').length, color: chartColors.red },
    { name: 'Cancelados', value: modules.filter((m) => m.status === 'cancelled').length, color: chartColors.gray },
  ].filter((d) => d.value > 0);

  const auditActions = loadAuditActions();
  const auditStats = {
    total: auditActions.length,
    completed: auditActions.filter((a) => a.status === 'completed').length,
    inProgress: auditActions.filter((a) => a.status === 'in-progress').length,
    planned: auditActions.filter((a) => a.status === 'planned').length,
    blocked: auditActions.filter((a) => a.status === 'blocked').length,
  };
  const auditDonutData = [
    { name: 'Concluídas', value: auditStats.completed, color: chartColors.green },
    { name: 'Em Progresso', value: auditStats.inProgress, color: chartColors.primary },
    { name: 'Planejadas', value: auditStats.planned, color: chartColors.amber },
    { name: 'Bloqueadas', value: auditStats.blocked, color: chartColors.red },
  ].filter((d) => d.value > 0);

  const teamMembers = loadTeamMembers();
  const orgStats = {
    sodimac: teamMembers.filter((m) => m.organization === 'SODIMAC').length,
    lg: teamMembers.filter((m) => m.organization === 'LG').length,
    falabella: teamMembers.filter((m) => m.organization === 'FALABELLA').length,
    recrutai: teamMembers.filter((m) => m.organization === 'RECRUT.AI').length,
  };

  const objectives = computeObjectives();
  const overallScore = overallProgramScore(objectives);
  const radarData = objectives.map((o) => ({ pillar: o.pillar, score: objectiveScore(o) }));

  const health = computeProjectHealth();
  const healthDot = health.status === 'green' ? 'bg-green-500' : health.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500';

  const lastUpdated = loadLastUpdated();
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'sem edições registradas ainda';

  const projectDeadline = new Date('2026-08-31');
  const today = new Date();
  const daysToDeadline = Math.max(0, Math.ceil((projectDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const topRisks = risks
    .filter((r) => r.status !== 'resolved')
    .sort((a, b) => impactWeight[b.impact] - impactWeight[a.impact])
    .slice(0, 4);

  const kpis = [
    { label: 'Health Score do Programa (OKRs)', value: `${overallScore}%`, accent: 'border-blue-500', text: 'text-blue-700' },
    { label: 'Módulos Implantados', value: `${completionPct}%`, accent: 'border-sky-500', text: 'text-sky-700' },
    {
      label: 'Riscos Críticos',
      value: String(riskMetrics.critical),
      accent: riskMetrics.critical > 0 ? 'border-red-500' : 'border-green-500',
      text: riskMetrics.critical > 0 ? 'text-red-700' : 'text-green-700',
    },
    { label: 'Ações de Auditoria Concluídas', value: `${auditStats.completed}/${auditStats.total}`, accent: 'border-emerald-500', text: 'text-emerald-700' },
    { label: 'Dias até o Deadline', value: String(daysToDeadline), accent: 'border-amber-500', text: 'text-amber-700' },
    { label: 'Membros da Equipe', value: String(teamMembers.length), accent: 'border-purple-500', text: 'text-purple-700' },
  ];

  const handleExportPDF = () => window.print();

  const handleExportPPTX = async () => {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 pol, 16:9

    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Cabeçalho
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.05, fill: { color: '1E40AF' } });
    slide.addText('Projeto LG — One Pager Executivo', {
      x: 0.4, y: 0.13, w: 9, h: 0.5, fontSize: 24, bold: true, color: 'FFFFFF', fontFace: 'Arial',
    });
    slide.addText(`Renato Pereira  ·  ${new Date().toLocaleDateString('pt-BR')}`, {
      x: 0.4, y: 0.6, w: 6, h: 0.35, fontSize: 12, color: 'DBEAFE', fontFace: 'Arial',
    });

    const statusHex = health.status === 'green' ? '22C55E' : health.status === 'yellow' ? 'EAB308' : 'EF4444';
    slide.addShape(pptx.ShapeType.ellipse, { x: 12.35, y: 0.28, w: 0.4, h: 0.4, fill: { color: statusHex } });
    slide.addText(health.label, {
      x: 9.5, y: 0.68, w: 2.75, h: 0.3, fontSize: 12, bold: true, color: 'FFFFFF', align: 'right', fontFace: 'Arial',
    });

    // KPIs
    const cardW = 2.03;
    const cardGap = 0.14;
    const startX = 0.4;
    const cardY = 1.3;
    const cardH = 1.25;
    const kpiHex = ['1E40AF', '0EA5E9', riskMetrics.critical > 0 ? 'EF4444' : '22C55E', '10B981', 'F59E0B', '8B5CF6'];
    kpis.forEach((k, i) => {
      const x = startX + i * (cardW + cardGap);
      slide.addShape(pptx.ShapeType.rect, { x, y: cardY, w: cardW, h: cardH, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 0.75 } });
      slide.addShape(pptx.ShapeType.rect, { x, y: cardY, w: 0.06, h: cardH, fill: { color: kpiHex[i] } });
      slide.addText(k.value, { x: x + 0.12, y: cardY + 0.3, w: cardW - 0.24, h: 0.55, fontSize: 22, bold: true, color: '1F2937', fontFace: 'Arial' });
      slide.addText(k.label, { x: x + 0.12, y: cardY + 0.88, w: cardW - 0.24, h: 0.35, fontSize: 8.5, color: '6B7280', fontFace: 'Arial' });
    });

    // Pilares OKR (barras horizontais)
    slide.addText('Health Score por Pilar (OKRs & KPIs)', { x: 0.4, y: 2.85, w: 6, h: 0.3, fontSize: 13, bold: true, color: '1F2937', fontFace: 'Arial' });
    const pillarY0 = 3.25;
    const pillarH = 0.34;
    const pillarGap = 0.08;
    const barX = 2.7;
    const barMaxW = 3.4;
    objectives.forEach((o, i) => {
      const score = objectiveScore(o);
      const y = pillarY0 + i * (pillarH + pillarGap);
      slide.addText(o.pillar, { x: 0.4, y, w: 2.25, h: pillarH, fontSize: 9, color: '374151', valign: 'middle', fontFace: 'Arial' });
      slide.addShape(pptx.ShapeType.rect, { x: barX, y: y + 0.05, w: barMaxW, h: pillarH - 0.1, fill: { color: 'E5E7EB' } });
      const barColor = score > 80 ? '22C55E' : score >= 60 ? 'EAB308' : 'EF4444';
      slide.addShape(pptx.ShapeType.rect, { x: barX, y: y + 0.05, w: Math.max(0.1, barMaxW * (score / 100)), h: pillarH - 0.1, fill: { color: barColor } });
      slide.addText(`${score}%`, { x: barX + barMaxW + 0.1, y, w: 0.55, h: pillarH, fontSize: 9, bold: true, color: '1F2937', valign: 'middle', fontFace: 'Arial' });
    });

    // Módulos - barra empilhada
    const rightColX = 7.1;
    const rightColW = 5.8;
    slide.addText('Status dos Módulos', { x: rightColX, y: 2.85, w: rightColW, h: 0.3, fontSize: 13, bold: true, color: '1F2937', fontFace: 'Arial' });
    let stackX = rightColX;
    const stackY = 3.25;
    const stackH = 0.42;
    const totalModules = modules.length || 1;
    moduleDonutData.forEach((d) => {
      const segW = rightColW * (d.value / totalModules);
      slide.addShape(pptx.ShapeType.rect, { x: stackX, y: stackY, w: segW, h: stackH, fill: { color: d.color.replace('#', '') } });
      stackX += segW;
    });
    let legendX = rightColX;
    moduleDonutData.forEach((d) => {
      slide.addShape(pptx.ShapeType.rect, { x: legendX, y: stackY + 0.52, w: 0.14, h: 0.14, fill: { color: d.color.replace('#', '') } });
      slide.addText(`${d.name} (${d.value})`, { x: legendX + 0.19, y: stackY + 0.47, w: 1.5, h: 0.24, fontSize: 7.5, color: '374151', fontFace: 'Arial' });
      legendX += 1.55;
    });

    // Auditoria - barra empilhada
    slide.addText('Status da Auditoria', { x: rightColX, y: 4.15, w: rightColW, h: 0.3, fontSize: 13, bold: true, color: '1F2937', fontFace: 'Arial' });
    let auditX = rightColX;
    const auditY = 4.55;
    const totalAudit = auditStats.total || 1;
    auditDonutData.forEach((d) => {
      const segW = rightColW * (d.value / totalAudit);
      slide.addShape(pptx.ShapeType.rect, { x: auditX, y: auditY, w: segW, h: stackH, fill: { color: d.color.replace('#', '') } });
      auditX += segW;
    });
    let auditLegendX = rightColX;
    auditDonutData.forEach((d) => {
      slide.addShape(pptx.ShapeType.rect, { x: auditLegendX, y: auditY + 0.52, w: 0.14, h: 0.14, fill: { color: d.color.replace('#', '') } });
      slide.addText(`${d.name} (${d.value})`, { x: auditLegendX + 0.19, y: auditY + 0.47, w: 1.5, h: 0.24, fontSize: 7.5, color: '374151', fontFace: 'Arial' });
      auditLegendX += 1.55;
    });

    // Principais riscos
    slide.addText('Principais Riscos Abertos', { x: 0.4, y: 5.35, w: 6, h: 0.3, fontSize: 13, bold: true, color: '1F2937', fontFace: 'Arial' });
    const riskTableRows: any[] = [
      [
        { text: 'Risco', options: { bold: true, fill: { color: 'F1F5F9' }, fontSize: 9 } },
        { text: 'Impacto', options: { bold: true, fill: { color: 'F1F5F9' }, fontSize: 9 } },
        { text: 'Responsável', options: { bold: true, fill: { color: 'F1F5F9' }, fontSize: 9 } },
      ],
    ];
    if (topRisks.length === 0) {
      riskTableRows.push([{ text: 'Nenhum risco aberto no momento.', options: { fontSize: 9, colspan: 3 } }]);
    } else {
      topRisks.forEach((r) => {
        const impactLabel = r.impact === 'critical' ? 'Crítico' : r.impact === 'medium' ? 'Médio' : 'Baixo';
        const impactColor = r.impact === 'critical' ? 'DC2626' : r.impact === 'medium' ? 'CA8A04' : '16A34A';
        riskTableRows.push([
          { text: r.title, options: { fontSize: 9 } },
          { text: impactLabel, options: { fontSize: 9, color: impactColor, bold: true } },
          { text: r.owner, options: { fontSize: 9 } },
        ]);
      });
    }
    slide.addTable(riskTableRows, { x: 0.4, y: 5.7, w: 6.3, h: 1.15, border: { type: 'solid', color: 'E2E8F0', pt: 0.5 }, autoPage: false });

    // Equipe
    slide.addText('Equipe do Projeto', { x: rightColX, y: 5.35, w: rightColW, h: 0.3, fontSize: 13, bold: true, color: '1F2937', fontFace: 'Arial' });
    slide.addText(
      `${teamMembers.length} pessoas no total\nSODIMAC: ${orgStats.sodimac}   ·   LG: ${orgStats.lg}   ·   Falabella: ${orgStats.falabella}   ·   Recrut.AI: ${orgStats.recrutai}`,
      { x: rightColX, y: 5.7, w: rightColW, h: 0.7, fontSize: 10, color: '374151', fontFace: 'Arial', lineSpacingMultiple: 1.4 }
    );

    slide.addText(`Última atualização de dados: ${lastUpdatedLabel}`, {
      x: 0.4, y: 7.05, w: 8, h: 0.25, fontSize: 8, color: '9CA3AF', italic: true, fontFace: 'Arial',
    });

    await pptx.writeFile({ fileName: `Projeto-LG-One-Pager-${new Date().toISOString().slice(0, 10)}.pptx` });
  };

  return (
    <DashboardLayout currentPage="onepager">
      <style>{`
        @media print {
          aside { display: none !important; }
          .no-print { display: none !important; }
          @page { size: landscape; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div className="p-8 print:p-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 print:mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-6 h-6 text-primary print:hidden" />
              <h1 className="text-3xl font-bold text-foreground print:text-2xl">One Pager Executivo</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Projeto LG · Renato Pereira · {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button className="bg-primary hover:bg-blue-800 text-white gap-2" onClick={handleExportPPTX}>
              <Presentation className="w-4 h-4" />
              Exportar PPTX
            </Button>
          </div>
        </div>

        {/* Status Executivo */}
        <div className="mb-5 print:mb-3">
          <ProjectHealthBanner />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 print:mb-3 print:gap-2">
          {kpis.map((k) => (
            <div key={k.label} className={`bg-white rounded-lg border-l-4 ${k.accent} border-t border-r border-b border-border shadow-sm p-3 print:p-2`}>
              <p className={`text-2xl font-bold print:text-xl ${k.text}`}>{k.value}</p>
              <p className="text-[11px] text-muted-foreground font-semibold leading-tight mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Linha 1 de gráficos: OKRs (radar) + Módulos (rosca) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-2">
          <div className="bg-white rounded-lg border border-border shadow-sm p-4 print:p-2 print:break-inside-avoid">
            <h2 className="text-sm font-bold text-foreground mb-2">Health Score por Pilar (OKRs)</h2>
            <ResponsiveContainer width="100%" height={170}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="pillar" tick={{ ...chartTick, fontSize: 9 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ ...chartTick, fontSize: 8 }} />
                <Radar dataKey="score" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.35} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-border shadow-sm p-4 print:p-2 print:break-inside-avoid">
            <h2 className="text-sm font-bold text-foreground mb-2">Status dos Módulos</h2>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={moduleDonutData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                  {moduleDonutData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[11px] text-muted-foreground -mt-2">
              {moduleDonutData.map((d) => (
                <span key={d.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Linha 2: Auditoria (rosca) + Equipe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-2">
          <div className="bg-white rounded-lg border border-border shadow-sm p-4 print:p-2 print:break-inside-avoid">
            <h2 className="text-sm font-bold text-foreground mb-2">Status da Auditoria</h2>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={auditDonutData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={58} paddingAngle={2}>
                  {auditDonutData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[11px] text-muted-foreground -mt-2">
              {auditDonutData.map((d) => (
                <span key={d.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border shadow-sm p-4 print:p-2 print:break-inside-avoid">
            <h2 className="text-sm font-bold text-foreground mb-3">Equipe do Projeto</h2>
            <p className="text-3xl font-bold text-foreground mb-3">{teamMembers.length} <span className="text-sm font-normal text-muted-foreground">pessoas</span></p>
            <div className="space-y-2">
              {[
                { label: 'SODIMAC', value: orgStats.sodimac, color: 'bg-blue-500' },
                { label: 'LG', value: orgStats.lg, color: 'bg-purple-500' },
                { label: 'Falabella', value: orgStats.falabella, color: 'bg-orange-500' },
                { label: 'Recrut.AI', value: orgStats.recrutai, color: 'bg-teal-500' },
              ].map((o) => (
                <div key={o.label} className="flex items-center gap-2">
                  <span className="text-xs w-20 text-muted-foreground">{o.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 ${o.color}`}
                      style={{ width: `${teamMembers.length ? (o.value / teamMembers.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-foreground w-6 text-right">{o.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Principais riscos */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-4 print:p-2 print:break-inside-avoid mb-4 print:mb-2">
          <h2 className="text-sm font-bold text-foreground mb-2">Principais Riscos Abertos</h2>
          {topRisks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum risco aberto no momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topRisks.map((r) => (
                <div key={r.id} className="border border-border rounded-lg p-3">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                      r.impact === 'critical'
                        ? 'bg-red-50 text-red-700'
                        : r.impact === 'medium'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {r.impact === 'critical' ? 'Crítico' : r.impact === 'medium' ? 'Médio' : 'Baixo'}
                  </span>
                  <p className="text-xs font-semibold text-foreground leading-snug">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{r.owner}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground text-right">Última atualização de dados: {lastUpdatedLabel}</p>
      </div>
    </DashboardLayout>
  );
}
