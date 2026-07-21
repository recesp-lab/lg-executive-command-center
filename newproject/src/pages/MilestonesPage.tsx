import DashboardLayout from '@/components/DashboardLayout';
import { Flag, Plus, Trash2, CheckCircle2, Clock, AlertCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { loadMilestones, MILESTONES_STORAGE_KEY, type Milestone } from '@/data/milestonesData';
import { loadTeamMembers } from '@/data/teamData';
import { markUpdated } from '@/data/lastUpdated';

const statusConfig: Record<Milestone['status'], { label: string; chip: string; icon: typeof Clock }> = {
  planned: { label: 'Planejado', chip: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  delivered: { label: 'Entregue', chip: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle2 },
  accepted: { label: 'Aceite formal', chip: 'bg-green-100 text-green-800 border-green-300', icon: Award },
  late: { label: 'Atrasado', chip: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle },
};

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadMilestones());

  useEffect(() => {
    try {
      localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
      markUpdated();
    } catch {
      // localStorage indisponível
    }
  }, [milestones]);

  const teamMembers = loadTeamMembers();

  const update = (id: string, patch: Partial<Milestone>) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...milestones].sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

  const stats = {
    total: milestones.length,
    accepted: milestones.filter((m) => m.status === 'accepted').length,
    delivered: milestones.filter((m) => m.status === 'delivered').length,
    late: milestones.filter((m) => m.status === 'late' || (m.status === 'planned' && m.dueDate < today)).length,
  };

  return (
    <DashboardLayout currentPage="marcos">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Flag className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Marcos Contratuais</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Entregáveis formais do programa, com data-alvo e status de aceite
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-blue-800 text-white gap-2"
              onClick={() =>
                setMilestones((prev) => [
                  ...prev,
                  { id: Date.now().toString(), title: 'Novo marco', dueDate: today, status: 'planned', acceptedBy: '', notes: '' },
                ])
              }
            >
              <Plus className="w-4 h-4" />
              Novo Marco
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-border shadow-sm p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-2">Total de Marcos</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 shadow-sm p-4">
            <p className="text-xs text-green-700 font-semibold mb-2">Com Aceite</p>
            <p className="text-3xl font-bold text-green-700">{stats.accepted}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 shadow-sm p-4">
            <p className="text-xs text-blue-700 font-semibold mb-2">Entregues (sem aceite)</p>
            <p className="text-3xl font-bold text-blue-700">{stats.delivered}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 shadow-sm p-4">
            <p className="text-xs text-red-700 font-semibold mb-2">Atrasados</p>
            <p className="text-3xl font-bold text-red-700">{stats.late}</p>
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {sorted.map((m) => {
            const overdue = m.status === 'planned' && m.dueDate < today;
            const cfg = statusConfig[overdue ? 'late' : m.status];
            const Icon = cfg.icon;
            return (
              <div key={m.id} className="bg-white rounded-lg border border-border shadow-sm p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shrink-0 ${cfg.chip}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>
                  <input
                    className="flex-1 min-w-[200px] text-sm font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                    value={m.title}
                    onChange={(e) => update(m.id, { title: e.target.value })}
                  />
                  <input
                    type="date"
                    className="p-1.5 border border-border rounded text-sm"
                    value={m.dueDate}
                    onChange={(e) => update(m.id, { dueDate: e.target.value })}
                  />
                  <select
                    className="p-1.5 border border-border rounded text-sm"
                    value={m.status}
                    onChange={(e) => update(m.id, { status: e.target.value as Milestone['status'] })}
                  >
                    <option value="planned">Planejado</option>
                    <option value="delivered">Entregue</option>
                    <option value="accepted">Aceite formal</option>
                    <option value="late">Atrasado</option>
                  </select>
                  <select
                    className="p-1.5 border border-border rounded text-sm"
                    value={m.acceptedBy}
                    onChange={(e) => update(m.id, { acceptedBy: e.target.value })}
                  >
                    <option value="">Aceite por...</option>
                    {teamMembers.map((tm) => (
                      <option key={tm.id} value={tm.name}>{tm.name}</option>
                    ))}
                  </select>
                  <button
                    className="p-2 hover:bg-secondary rounded-lg shrink-0"
                    onClick={() => setMilestones((prev) => prev.filter((x) => x.id !== m.id))}
                    title="Remover marco"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                <input
                  className="mt-2 w-full text-xs text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                  placeholder="Notas (opcional)"
                  value={m.notes}
                  onChange={(e) => update(m.id, { notes: e.target.value })}
                />
                {overdue && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    Data-alvo vencida em {new Date(m.dueDate).toLocaleDateString('pt-BR')} — atualize o status ou renegocie o prazo.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
