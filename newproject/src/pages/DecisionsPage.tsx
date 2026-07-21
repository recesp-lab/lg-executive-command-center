import DashboardLayout from '@/components/DashboardLayout';
import { Gavel, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { loadDecisions, DECISIONS_STORAGE_KEY, type Decision } from '@/data/decisionsData';
import { loadTeamMembers } from '@/data/teamData';
import { markUpdated } from '@/data/lastUpdated';

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  decision: '',
  owner: '',
  context: '',
  meeting: '',
};

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>(() => loadDecisions());
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Decision | null>(null);

  const teamMembers = loadTeamMembers();

  useEffect(() => {
    try {
      localStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify(decisions));
      markUpdated();
    } catch {
      // localStorage indisponível
    }
  }, [decisions]);

  const handleAdd = () => {
    if (!form.decision.trim()) return;
    setDecisions((prev) => [{ id: Date.now().toString(), ...form }, ...prev]);
    setForm(emptyForm);
    setShowAddForm(false);
  };

  const startEdit = (d: Decision) => {
    setEditingId(d.id);
    setEditDraft({ ...d });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    setDecisions((prev) => prev.map((d) => (d.id === editDraft.id ? editDraft : d)));
    setEditingId(null);
    setEditDraft(null);
  };

  const sorted = [...decisions].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <DashboardLayout currentPage="decisoes">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Gavel className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Decisões &amp; Atas</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Registro histórico das decisões do programa — quem decidiu, quando e por quê
              </p>
            </div>
            <Button className="bg-primary hover:bg-blue-800 text-white gap-2" onClick={() => setShowAddForm((v) => !v)}>
              <Plus className="w-4 h-4" />
              Nova Decisão
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Nova Decisão</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                placeholder="Decisão tomada"
                value={form.decision}
                onChange={(e) => setForm((f) => ({ ...f, decision: e.target.value }))}
              />
              <input
                className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                placeholder="Contexto / justificativa"
                value={form.context}
                onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
              />
              <input
                type="date"
                className="p-2 border border-border rounded-lg text-sm"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              >
                <option value="">Quem decidiu</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              <input
                className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                placeholder="Fórum (ex.: Steering Committee Jul/26, Reunião semanal)"
                value={form.meeting}
                onChange={(e) => setForm((f) => ({ ...f, meeting: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
              <Button className="bg-primary hover:bg-blue-800 text-white" onClick={handleAdd}>Salvar</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="bg-white rounded-lg border border-border shadow-sm p-12 text-center text-sm text-muted-foreground">
              Nenhuma decisão registrada ainda.
            </div>
          ) : (
            sorted.map((d) => {
              const isEditing = editingId === d.id;
              if (isEditing && editDraft) {
                return (
                  <div key={d.id} className="bg-white rounded-lg border-2 border-primary shadow-sm p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input
                        className="p-2 border border-border rounded-lg text-sm sm:col-span-2 font-semibold"
                        value={editDraft.decision}
                        onChange={(e) => setEditDraft({ ...editDraft, decision: e.target.value })}
                      />
                      <input
                        className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                        value={editDraft.context}
                        onChange={(e) => setEditDraft({ ...editDraft, context: e.target.value })}
                      />
                      <input
                        type="date"
                        className="p-2 border border-border rounded-lg text-sm"
                        value={editDraft.date}
                        onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })}
                      />
                      <select
                        className="p-2 border border-border rounded-lg text-sm"
                        value={editDraft.owner}
                        onChange={(e) => setEditDraft({ ...editDraft, owner: e.target.value })}
                      >
                        <option value="">Quem decidiu</option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                      <input
                        className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                        value={editDraft.meeting}
                        onChange={(e) => setEditDraft({ ...editDraft, meeting: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setEditingId(null); setEditDraft(null); }}>
                        <X className="w-4 h-4 mr-1" /> Cancelar
                      </Button>
                      <Button className="bg-primary hover:bg-blue-800 text-white" onClick={saveEdit}>
                        <Save className="w-4 h-4 mr-1" /> Salvar
                      </Button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={d.id} className="bg-white rounded-lg border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">{d.decision}</p>
                      {d.context && <p className="text-xs text-muted-foreground mb-2">{d.context}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>📅 {d.date ? new Date(d.date).toLocaleDateString('pt-BR') : '—'}</span>
                        {d.owner && <span>👤 {d.owner}</span>}
                        {d.meeting && <span>🗓 {d.meeting}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button className="p-2 hover:bg-secondary rounded-lg" onClick={() => startEdit(d)} title="Editar">
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button
                        className="p-2 hover:bg-secondary rounded-lg"
                        onClick={() => setDecisions((prev) => prev.filter((x) => x.id !== d.id))}
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
