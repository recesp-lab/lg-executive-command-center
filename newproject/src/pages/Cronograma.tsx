import DashboardLayout from '@/components/DashboardLayout';
import { Activity, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { loadAuditActions, AUDIT_STORAGE_KEY, type AuditAction } from '@/data/auditData';
import { loadModules, MODULES_STORAGE_KEY, type Module } from '@/data/modulesData';
import { markUpdated } from '@/data/lastUpdated';

const SECTIONS = [
  '3.1 Exposição de dados sensíveis (Backup Datamace)',
  '3.2 Excesso de privilégios (Superusuários)',
  '3.3 Falta de segregação de funções (SoD)',
  '3.4 Acesso fora de ambiente seguro',
  '4. Ações estruturais complementares',
];

const statusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'planned':
      return 'bg-yellow-400';
    case 'blocked':
      return 'bg-red-500';
    case 'not-started':
      return 'bg-red-400';
    case 'cancelled':
      return 'bg-gray-400';
    default:
      return 'bg-gray-300';
  }
};

const statusOptionsFor = (kind: 'audit' | 'module') =>
  kind === 'audit'
    ? [
        { value: 'completed', label: 'Concluído' },
        { value: 'in-progress', label: 'Em Progresso' },
        { value: 'planned', label: 'Planejado' },
        { value: 'blocked', label: 'Bloqueado' },
      ]
    : [
        { value: 'completed', label: 'Implantado' },
        { value: 'in-progress', label: 'Em Andamento' },
        { value: 'not-started', label: 'Não Iniciado' },
        { value: 'cancelled', label: 'Cancelado' },
      ];

export default function Cronograma() {
  const [auditActions, setAuditActions] = useState<AuditAction[]>(() => loadAuditActions());
  const [modules, setModules] = useState<Module[]>(() => loadModules());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ start: string; end: string; status: string } | null>(null);

  const persistAudit = (updated: AuditAction[]) => {
    setAuditActions(updated);
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      markUpdated();
    } catch {
      // localStorage indisponível
    }
  };

  const persistModules = (updated: Module[]) => {
    setModules(updated);
    try {
      localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(updated));
      markUpdated();
    } catch {
      // localStorage indisponível
    }
  };

  const modulesWithDates = modules.filter((m) => m.startDate && m.endDate);

  const allDates: Date[] = [];
  auditActions.forEach((a) => {
    if (a.startDate) allDates.push(new Date(a.startDate));
    if (a.endDate) allDates.push(new Date(a.endDate));
  });
  modulesWithDates.forEach((m) => {
    allDates.push(new Date(m.startDate as string));
    allDates.push(new Date(m.endDate as string));
  });

  const startEditAudit = (a: AuditAction) => {
    setEditingKey(`audit-${a.id}`);
    setEditDraft({ start: a.startDate, end: a.endDate, status: a.status });
  };

  const startEditModule = (m: Module) => {
    setEditingKey(`module-${m.id}`);
    setEditDraft({ start: m.startDate || '', end: m.endDate || '', status: m.status });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditDraft(null);
  };

  const saveEditAudit = (id: string) => {
    if (!editDraft) return;
    const updated = auditActions.map((a) =>
      a.id === id ? { ...a, startDate: editDraft.start, endDate: editDraft.end, status: editDraft.status as AuditAction['status'] } : a
    );
    persistAudit(updated);
    cancelEdit();
  };

  const saveEditModule = (id: string) => {
    if (!editDraft) return;
    const updated = modules.map((m) =>
      m.id === id ? { ...m, startDate: editDraft.start, endDate: editDraft.end, status: editDraft.status as Module['status'] } : m
    );
    persistModules(updated);
    cancelEdit();
  };

  if (allDates.length === 0) {
    return (
      <DashboardLayout currentPage="cronograma">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Cronograma Integrado
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade com datas cadastradas ainda. Adicione datas de início/fim em Módulos ou Auditoria para
            este cronograma aparecer.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const rangeStart = new Date(Math.min(...allDates.map((d) => d.getTime())));
  rangeStart.setDate(rangeStart.getDate() - 3);
  const rangeEnd = new Date(Math.max(...allDates.map((d) => d.getTime())));
  rangeEnd.setDate(rangeEnd.getDate() + 3);
  const totalMs = rangeEnd.getTime() - rangeStart.getTime();

  const percentFor = (date: Date) => ((date.getTime() - rangeStart.getTime()) / totalMs) * 100;

  const today = new Date();
  const todayPercent = percentFor(today);
  const showTodayLine = todayPercent >= 0 && todayPercent <= 100;

  const months: { label: string; percent: number }[] = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  while (cursor <= rangeEnd) {
    months.push({ label: cursor.toLocaleDateString('pt-BR', { month: 'short' }), percent: percentFor(cursor) });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const renderRow = (
    key: string,
    label: string,
    start: string | undefined,
    end: string | undefined,
    status: string,
    responsible: string[] | undefined,
    kind: 'audit' | 'module',
    rawId: string
  ) => {
    if (!start || !end) return null;
    const isEditing = editingKey === key;
    const startPct = percentFor(new Date(start));
    const endPct = percentFor(new Date(end));
    const widthPct = Math.max(endPct - startPct, 0.8);

    return (
      <div key={key} className="flex items-center border-b border-border py-2 hover:bg-secondary/50">
        <div className="w-56 shrink-0 pr-3 text-xs text-foreground truncate" title={label}>
          {label}
        </div>
        <div className="flex-1 relative h-7">
          {isEditing && editDraft ? (
            <div className="flex items-center gap-2 h-full">
              <input
                type="date"
                className="p-1 border border-border rounded text-xs"
                value={editDraft.start}
                onChange={(e) => setEditDraft({ ...editDraft, start: e.target.value })}
              />
              <input
                type="date"
                className="p-1 border border-border rounded text-xs"
                value={editDraft.end}
                onChange={(e) => setEditDraft({ ...editDraft, end: e.target.value })}
              />
              <select
                className="p-1 border border-border rounded text-xs"
                value={editDraft.status}
                onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}
              >
                {statusOptionsFor(kind).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              className={`absolute h-4 top-1.5 rounded ${statusColor(status)}`}
              style={{ left: `${startPct}%`, width: `${widthPct}%` }}
              title={`${label}: ${new Date(start).toLocaleDateString('pt-BR')} → ${new Date(end).toLocaleDateString('pt-BR')}`}
            ></div>
          )}
        </div>
        <div className="w-36 shrink-0 px-3 text-xs text-muted-foreground truncate" title={responsible?.join(', ')}>
          {responsible ? responsible.join(', ') : '—'}
        </div>
        <div className="w-16 shrink-0 flex items-center justify-end gap-1">
          {isEditing ? (
            <>
              <button
                onClick={() => (kind === 'audit' ? saveEditAudit(rawId) : saveEditModule(rawId))}
                className="p-1 hover:bg-secondary rounded"
                title="Salvar"
              >
                <Save className="w-3.5 h-3.5 text-green-600" />
              </button>
              <button onClick={cancelEdit} className="p-1 hover:bg-secondary rounded" title="Cancelar">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (kind === 'audit') {
                  const a = auditActions.find((x) => x.id === rawId);
                  if (a) startEditAudit(a);
                } else {
                  const m = modules.find((x) => x.id === rawId);
                  if (m) startEditModule(m);
                }
              }}
              className="p-1 hover:bg-secondary rounded"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout currentPage="cronograma">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Cronograma Integrado
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Módulos e Auditoria no mesmo eixo do tempo. Editar aqui atualiza direto as páginas de Módulos e Auditoria.
        </p>

        <div className="bg-white rounded-lg border border-border shadow-sm p-6 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Month header */}
            <div className="flex items-center mb-3 relative h-6">
              <div className="w-56 shrink-0"></div>
              <div className="flex-1 relative h-full border-b border-border">
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="absolute text-xs font-semibold text-muted-foreground uppercase"
                    style={{ left: `${m.percent}%` }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
              <div className="w-36 shrink-0"></div>
              <div className="w-16 shrink-0"></div>
            </div>

            {/* Today marker */}
            <div className="relative">
              {showTodayLine && (
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-400 z-10 pointer-events-none"
                  style={{ left: `calc(224px + (100% - 224px - 144px - 64px) * ${todayPercent / 100})` }}
                  title={`Hoje: ${today.toLocaleDateString('pt-BR')}`}
                ></div>
              )}

              {/* Módulos */}
              {modulesWithDates.length > 0 && (
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 rounded text-white text-xs font-bold mb-1">
                    Módulos
                  </div>
                  {modulesWithDates.map((m) =>
                    renderRow(`module-${m.id}`, m.name, m.startDate, m.endDate, m.status, undefined, 'module', m.id)
                  )}
                </div>
              )}

              {/* Auditoria, por seção */}
              {SECTIONS.map((section) => {
                const items = auditActions.filter((a) => a.section === section && a.startDate && a.endDate);
                if (items.length === 0) return null;
                return (
                  <div key={section} className="mb-4">
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-3 py-1.5 rounded text-white text-xs font-bold mb-1">
                      {section}
                    </div>
                    {items.map((a) =>
                      renderRow(`audit-${a.id}`, a.activity, a.startDate, a.endDate, a.status, a.responsible, 'audit', a.id)
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Concluído / Implantado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Em Progresso / Andamento</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400 inline-block"></span> Planejado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Bloqueado / Não Iniciado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-400 inline-block"></span> Cancelado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 border-t-2 border-dashed border-red-400 inline-block"></span> Hoje</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
