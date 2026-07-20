import DashboardLayout from '@/components/DashboardLayout';
import ProjectHealthBanner from '@/components/ProjectHealthBanner';
import { AlertCircle, CheckCircle2, Clock, Users, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { loadTeamMembers } from '@/data/teamData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartColors, chartFont } from '@/data/chartColors';
import { markUpdated } from '@/data/lastUpdated';
import { loadAuditActions, AUDIT_STORAGE_KEY, type AuditAction } from '@/data/auditData';

// Desenha a porcentagem centralizada dentro da espessura do anel da fatia,
// em vez de fora com uma linha guia (ficava confuso em fatias pequenas).
const RADIAN = Math.PI / 180;
const renderDonutLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${Math.round((percent ?? 0) * 100)}%`}
    </text>
  );
};

export default function AuditPlan() {
  const [auditActions, setAuditActions] = useState<AuditAction[]>(() => loadAuditActions());

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditActions));
      markUpdated();
    } catch {
      // localStorage indisponível - segue apenas em memória
    }
  }, [auditActions]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<AuditAction | null>(null);

  const teamMembers = loadTeamMembers();

  const startEdit = (action: AuditAction) => {
    setEditingId(action.id);
    setEditDraft({ ...action });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    setAuditActions((prev) => prev.map((a) => (a.id === editDraft.id ? editDraft : a)));
    setEditingId(null);
    setEditDraft(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in-progress':
        return 'Em Progresso';
      case 'planned':
        return 'Planejado';
      case 'blocked':
        return 'Bloqueado';
      default:
        return status;
    }
  };

  const sections = [
    '3.1 Exposição de dados sensíveis (Backup Datamace)',
    '3.2 Excesso de privilégios (Superusuários)',
    '3.3 Falta de segregação de funções (SoD)',
    '3.4 Acesso fora de ambiente seguro',
    '4. Ações estruturais complementares',
  ];

  const stats = {
    total: auditActions.length,
    completed: auditActions.filter((a) => a.status === 'completed').length,
    inProgress: auditActions.filter((a) => a.status === 'in-progress').length,
    planned: auditActions.filter((a) => a.status === 'planned').length,
    blocked: auditActions.filter((a) => a.status === 'blocked').length,
  };

  const donutData = [
    { name: 'Concluídas', value: stats.completed, color: chartColors.green },
    { name: 'Em Progresso', value: stats.inProgress, color: chartColors.primary },
    { name: 'Planejadas', value: stats.planned, color: chartColors.amber },
    { name: 'Bloqueadas', value: stats.blocked, color: chartColors.red },
  ].filter((d) => d.value > 0);

  const handleDownloadPlan = () => {
    const header = ['ID', 'Atividade', 'Seção', 'Início', 'Fim', 'Responsáveis', 'Status'];
    const rows = auditActions.map((a) => [
      a.id,
      a.activity,
      a.section,
      a.startDate,
      a.endDate,
      a.responsible.join(' | '),
      getStatusLabel(a.status),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-auditoria-RA600802-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleNotifyResponsibles = () => {
    const uniqueResponsibles = Array.from(new Set(auditActions.flatMap((a) => a.responsible)));
    toast.success('Notificação enviada', {
      description: `${uniqueResponsibles.length} responsáveis notificados sobre o status atual do plano de ação.`,
    });
  };

  return (
    <DashboardLayout currentPage="audit">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Plano de Ação - Auditoria do Sistema de RH LG
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Auditoria do Sistema de RH LG (RA600802) | Período: Junho - Agosto 2026
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-orange-500 rounded"></div>
        </div>

        {/* Status Executivo - mesma fonte usada na Home e em Riscos */}
        <div className="mb-8">
          <ProjectHealthBanner />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-border shadow-sm p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-2">Total de Ações</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 shadow-sm p-4">
            <p className="text-xs text-green-700 font-semibold mb-2">Concluídas</p>
            <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 shadow-sm p-4">
            <p className="text-xs text-blue-700 font-semibold mb-2">Em Progresso</p>
            <p className="text-3xl font-bold text-blue-700">{stats.inProgress}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm p-4">
            <p className="text-xs text-yellow-700 font-semibold mb-2">Planejadas</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.planned}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 shadow-sm p-4">
            <p className="text-xs text-red-700 font-semibold mb-2">Bloqueadas</p>
            <p className="text-3xl font-bold text-red-700">{stats.blocked}</p>
          </div>
        </div>

        {/* Distribuição visual do status - substitui a leitura mental da tabela de números */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Distribuição das Ações por Status
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={renderDonutLabel}
                labelLine={false}
              >
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={chartFont} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => {
            const sectionActions = auditActions.filter((a) => a.section === section);
            return (
              <div key={section} className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4" style={{ backgroundColor: chartColors.primary }}>
                  <h2 className="text-lg font-bold text-white">{section}</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Atividade</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Início</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Fim</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Responsáveis</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionActions.map((action, idx) => {
                        const isEditing = editingId === action.id;

                        if (isEditing && editDraft) {
                          return (
                            <tr key={action.id} className="bg-blue-50/40">
                              <td className="px-6 py-4 text-sm text-foreground align-top">{action.activity}</td>
                              <td className="px-6 py-3 align-top">
                                <input
                                  type="date"
                                  className="w-full p-1.5 border border-border rounded text-sm"
                                  value={editDraft.startDate}
                                  onChange={(e) => setEditDraft({ ...editDraft, startDate: e.target.value })}
                                />
                              </td>
                              <td className="px-6 py-3 align-top">
                                <input
                                  type="date"
                                  className="w-full p-1.5 border border-border rounded text-sm"
                                  value={editDraft.endDate}
                                  onChange={(e) => setEditDraft({ ...editDraft, endDate: e.target.value })}
                                />
                              </td>
                              <td className="px-6 py-3 align-top">
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {editDraft.responsible.map((resp) => (
                                    <span
                                      key={resp}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium cursor-pointer hover:bg-red-50 hover:text-red-700"
                                      onClick={() =>
                                        setEditDraft({
                                          ...editDraft,
                                          responsible: editDraft.responsible.filter((r) => r !== resp),
                                        })
                                      }
                                      title="Clique para remover"
                                    >
                                      {resp} ×
                                    </span>
                                  ))}
                                </div>
                                <select
                                  className="w-full p-1.5 border border-border rounded text-sm"
                                  value=""
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value && !editDraft.responsible.includes(value)) {
                                      setEditDraft({ ...editDraft, responsible: [...editDraft.responsible, value] });
                                    }
                                  }}
                                >
                                  <option value="">+ Adicionar responsável</option>
                                  {teamMembers
                                    .filter((m) => !editDraft.responsible.includes(m.name))
                                    .map((member) => (
                                      <option key={member.id} value={member.name}>
                                        {member.name}
                                      </option>
                                    ))}
                                </select>
                              </td>
                              <td className="px-6 py-3 align-top">
                                <select
                                  className="w-full p-1.5 border border-border rounded text-sm"
                                  value={editDraft.status}
                                  onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as AuditAction['status'] })}
                                >
                                  <option value="completed">Concluído</option>
                                  <option value="in-progress">Em Progresso</option>
                                  <option value="planned">Planejado</option>
                                  <option value="blocked">Bloqueado</option>
                                </select>
                              </td>
                              <td className="px-6 py-3 align-top">
                                <div className="flex items-center gap-2">
                                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={saveEdit} title="Salvar">
                                    <Save className="w-4 h-4 text-green-600" />
                                  </button>
                                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={cancelEdit} title="Cancelar">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={action.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 text-sm text-foreground">{action.activity}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {action.startDate ? new Date(action.startDate).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {action.endDate ? new Date(action.endDate).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex flex-wrap gap-1">
                                {action.responsible.map((resp) => (
                                  <span
                                    key={resp}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                  >
                                    <Users className="w-3 h-3" />
                                    {resp}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(action.status)}`}>
                                {getStatusIcon(action.status)}
                                {getStatusLabel(action.status)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                onClick={() => startEdit(action)}
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Este plano de ação é crítico para a conformidade de segurança do sistema de RH.
            Todas as ações devem ser concluídas dentro dos prazos estabelecidos.
            A auditoria periódica será realizada pela equipe de Auditoria (Dagmar Orlando Monteiro Duarte).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center py-8">
          <Button className="bg-primary hover:bg-blue-800 text-white px-6" onClick={handleDownloadPlan}>
            Baixar Plano Completo
          </Button>
          <Button variant="outline" className="px-6" onClick={handleNotifyResponsibles}>
            Enviar Notificação aos Responsáveis
          </Button>
          <Button variant="outline" className="px-6" onClick={() => window.print()}>
            Gerar Relatório
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
