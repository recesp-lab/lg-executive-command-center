import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { loadTeamMembers } from '@/data/teamData';
import { markUpdated } from '@/data/lastUpdated';

interface WeeklyUpdate {
  id: string;
  module: string;
  status: 'completed' | 'inProgress' | 'blocked';
  description: string;
  owner: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

const STORAGE_KEY = 'lg-dashboard:weekly-updates';
const NOTES_STORAGE_KEY = 'lg-dashboard:weekly-notes';

const defaultUpdates: WeeklyUpdate[] = [
  {
    id: '1',
    module: 'Backend API',
    status: 'completed',
    description: 'Implementação de endpoints de autenticação concluída',
    owner: 'Bruno Rafael Costa Freitas',
    dueDate: '2026-07-08',
    priority: 'high',
  },
  {
    id: '2',
    module: 'Frontend UI',
    status: 'inProgress',
    description: 'Desenvolvimento do dashboard em andamento',
    owner: 'André Silveira',
    dueDate: '2026-07-15',
    priority: 'high',
  },
  {
    id: '3',
    module: 'Integração CRM',
    status: 'blocked',
    description: 'Aguardando aprovação de segurança do cliente',
    owner: 'Denis Soares Dias',
    dueDate: '2026-07-22',
    priority: 'medium',
  },
  {
    id: '4',
    module: 'Testes E2E',
    status: 'inProgress',
    description: 'Testes de integração em andamento',
    owner: 'Daniel Neris de Souza',
    dueDate: '2026-07-10',
    priority: 'high',
  },
  {
    id: '5',
    module: 'Documentação',
    status: 'completed',
    description: 'Documentação técnica finalizada',
    owner: 'Alex Bertuqui',
    dueDate: '2026-07-05',
    priority: 'low',
  },
];

const emptyForm = {
  module: '',
  status: 'inProgress' as WeeklyUpdate['status'],
  description: '',
  owner: '',
  dueDate: '',
  priority: 'medium' as WeeklyUpdate['priority'],
};

export default function WeeklyTracking() {
  const [updates, setUpdates] = useState<WeeklyUpdate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultUpdates;
    } catch {
      return defaultUpdates;
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<WeeklyUpdate | null>(null);
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem(NOTES_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [notesSaved, setNotesSaved] = useState(false);

  // Mesma lista usada em Riscos e Auditoria, então editar a Equipe atualiza
  // essas opções aqui também.
  const teamMembers = loadTeamMembers();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
      markUpdated();
    } catch {
      // localStorage indisponível (ex.: modo privado) - segue apenas em memória
    }
  }, [updates]);

  const statusConfig = {
    completed: { label: 'Concluído', color: 'bg-green-50 text-green-700 border-green-200' },
    inProgress: { label: 'Em Andamento', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    blocked: { label: 'Bloqueado', color: 'bg-red-50 text-red-700 border-red-200' },
  };

  const priorityConfig = {
    high: { label: 'Alta', color: 'text-red-600' },
    medium: { label: 'Média', color: 'text-yellow-600' },
    low: { label: 'Baixa', color: 'text-green-600' },
  };

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay / 7) + 1;
  };

  const getWeekDateRange = () => {
    const now = new Date();
    const first = now.getDate() - now.getDay();
    const last = first + 6;

    const firstDay = new Date(now.setDate(first));
    const lastDay = new Date(now.setDate(last));

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${firstDay.toLocaleDateString('pt-BR', options)} - ${lastDay.toLocaleDateString('pt-BR', options)}`;
  };

  const handleAddUpdate = () => {
    if (!newUpdate.module.trim() || !newUpdate.owner.trim()) return;
    const update: WeeklyUpdate = {
      id: Date.now().toString(),
      ...newUpdate,
    };
    setUpdates((prev) => [update, ...prev]);
    setNewUpdate(emptyForm);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setUpdates((prev) => prev.filter((u) => u.id !== id));
  };

  const startEdit = (update: WeeklyUpdate) => {
    setEditingId(update.id);
    setEditDraft({ ...update });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    setUpdates((prev) => prev.map((u) => (u.id === editDraft.id ? editDraft : u)));
    setEditingId(null);
    setEditDraft(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  // Se o responsável salvo não bater com nenhum nome atual da Equipe (ex.:
  // dado antigo tipo "Dev Team"), mantém a opção visível no topo do
  // dropdown em vez de esconder silenciosamente o valor já salvo.
  const ownerOptionsFor = (currentOwner: string) =>
    currentOwner && !teamMembers.some((m) => m.name === currentOwner)
      ? [currentOwner, ...teamMembers.map((m) => m.name)]
      : teamMembers.map((m) => m.name);

  return (
    <DashboardLayout currentPage="weekly">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Acompanhamento Semanal
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Semana {getWeekNumber()} • {getWeekDateRange()}
              </p>
            </div>
            <Button className="bg-primary hover:bg-blue-800 text-white gap-2" onClick={() => setShowAddForm((v) => !v)}>
              <Plus className="w-4 h-4" />
              Nova Atualização
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Dica:</strong> Use esta página para acompanhamento recorrente em reuniões semanais. Atualize o status de cada módulo e identifique bloqueios.
            </p>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Nova Atualização</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                className="p-2 border border-border rounded-lg text-sm"
                placeholder="Módulo"
                value={newUpdate.module}
                onChange={(e) => setNewUpdate((f) => ({ ...f, module: e.target.value }))}
              />
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={newUpdate.owner}
                onChange={(e) => setNewUpdate((f) => ({ ...f, owner: e.target.value }))}
              >
                <option value="">Selecione um responsável</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={newUpdate.status}
                onChange={(e) => setNewUpdate((f) => ({ ...f, status: e.target.value as WeeklyUpdate['status'] }))}
              >
                <option value="completed">Concluído</option>
                <option value="inProgress">Em Andamento</option>
                <option value="blocked">Bloqueado</option>
              </select>
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={newUpdate.priority}
                onChange={(e) => setNewUpdate((f) => ({ ...f, priority: e.target.value as WeeklyUpdate['priority'] }))}
              >
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
              <input
                type="date"
                className="p-2 border border-border rounded-lg text-sm"
                value={newUpdate.dueDate}
                onChange={(e) => setNewUpdate((f) => ({ ...f, dueDate: e.target.value }))}
              />
              <input
                className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                placeholder="Descrição"
                value={newUpdate.description}
                onChange={(e) => setNewUpdate((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
              <Button className="bg-primary hover:bg-blue-800 text-white" onClick={handleAddUpdate}>
                Salvar
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card-premium p-4">
            <p className="text-xs text-muted-foreground font-semibold">Total de Atualizações</p>
            <p className="text-3xl font-mono font-bold text-foreground mt-2">{updates.length}</p>
          </div>
          <div className="card-premium p-4">
            <p className="text-xs text-muted-foreground font-semibold">Concluídos</p>
            <p className="text-3xl font-mono font-bold text-green-600 mt-2">
              {updates.filter((u) => u.status === 'completed').length}
            </p>
          </div>
          <div className="card-premium p-4">
            <p className="text-xs text-muted-foreground font-semibold">Em Andamento</p>
            <p className="text-3xl font-mono font-bold text-blue-600 mt-2">
              {updates.filter((u) => u.status === 'inProgress').length}
            </p>
          </div>
          <div className="card-premium p-4">
            <p className="text-xs text-muted-foreground font-semibold">Bloqueados</p>
            <p className="text-3xl font-mono font-bold text-red-600 mt-2">
              {updates.filter((u) => u.status === 'blocked').length}
            </p>
          </div>
        </div>

        {/* Updates Table */}
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          {updates.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Nenhuma atualização registrada ainda. Clique em "Nova Atualização" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Módulo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Descrição</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Responsável</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Prioridade</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Prazo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((update, index) => {
                    const isEditing = editingId === update.id;
                    return (
                      <tr
                        key={update.id}
                        className={`border-b border-border hover:bg-secondary transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {isEditing && editDraft ? (
                          <>
                            <td className="px-6 py-3">
                              <input
                                className="w-full p-1.5 border border-border rounded text-sm"
                                value={editDraft.module}
                                onChange={(e) => setEditDraft({ ...editDraft, module: e.target.value })}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <select
                                className="w-full p-1.5 border border-border rounded text-sm"
                                value={editDraft.status}
                                onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as WeeklyUpdate['status'] })}
                              >
                                <option value="completed">Concluído</option>
                                <option value="inProgress">Em Andamento</option>
                                <option value="blocked">Bloqueado</option>
                              </select>
                            </td>
                            <td className="px-6 py-3">
                              <input
                                className="w-full p-1.5 border border-border rounded text-sm"
                                value={editDraft.description}
                                onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <select
                                className="w-full p-1.5 border border-border rounded text-sm"
                                value={editDraft.owner}
                                onChange={(e) => setEditDraft({ ...editDraft, owner: e.target.value })}
                              >
                                {ownerOptionsFor(editDraft.owner).map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-3">
                              <select
                                className="w-full p-1.5 border border-border rounded text-sm"
                                value={editDraft.priority}
                                onChange={(e) => setEditDraft({ ...editDraft, priority: e.target.value as WeeklyUpdate['priority'] })}
                              >
                                <option value="high">Alta</option>
                                <option value="medium">Média</option>
                                <option value="low">Baixa</option>
                              </select>
                            </td>
                            <td className="px-6 py-3">
                              <input
                                type="date"
                                className="w-full p-1.5 border border-border rounded text-sm"
                                value={editDraft.dueDate}
                                onChange={(e) => setEditDraft({ ...editDraft, dueDate: e.target.value })}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={saveEdit}>
                                  <Save className="w-4 h-4 text-green-600" />
                                </button>
                                <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={cancelEdit}>
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-foreground">{update.module}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                                  statusConfig[update.status].color
                                }`}
                              >
                                {statusConfig[update.status].label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground max-w-xs truncate">
                                {update.description}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-foreground">{update.owner}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className={`text-sm font-semibold ${priorityConfig[update.priority].color}`}>
                                {priorityConfig[update.priority].label}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground">
                                {update.dueDate ? new Date(update.dueDate).toLocaleDateString('pt-BR') : '—'}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={() => startEdit(update)}>
                                  <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                                <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={() => handleDelete(update.id)}>
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Notes */}
        <div className="mt-8 p-6 bg-secondary rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Notas da Reunião</h3>
          <textarea
            className="w-full p-3 border border-border rounded-lg bg-white text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            placeholder="Adicione notas e decisões tomadas durante a reunião semanal..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="mt-4 flex items-center justify-end gap-3">
            {notesSaved && <span className="text-xs text-green-600">Notas salvas ✓</span>}
            <Button
              className="bg-primary hover:bg-blue-800 text-white"
              onClick={() => {
                try {
                  localStorage.setItem(NOTES_STORAGE_KEY, notes);
                  markUpdated();
                  setNotesSaved(true);
                  setTimeout(() => setNotesSaved(false), 2000);
                } catch {
                  // localStorage indisponível
                }
              }}
            >
              Salvar Notas
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
