[15:00, 7/7/2026] Renato PEREIRA: import DashboardLayout from '@/components/DashboardLayout';
import { AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AuditAction {
  id: string;
  activity: string;
  section: string;
  startDate: string;
  endDate: string;
  responsible: string[];
  status: 'completed' | 'in-progress' | 'planned' | 'blocked';
}

export default function AuditPlan() {
  const auditActions: AuditAction[] = [
    // 3.1 Exposição de dados sensíveis (Backup Datamace)
    {
      id: '3.1.1',
      activity: 'Eliminar o backup da rede compartilhada',
      section: '3.1 Exposição de dados sensíveis (Backup Datamace)',
      startDate: '2026-06-15',
      endDate: '2026-06-22…
[15:03, 7/7/2026] Renato PEREIRA: import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

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
    owner: 'Dev Team',
    dueDate: '2026-07…
[17:23, 7/7/2026] Renato PEREIRA: import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';

interface Module {
  name: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'cancelled';
}

export default function ModulesDashboard() {
  const modules = {
    completed: [
      { name: 'Folha de Pagamento', status: 'completed' },
      { name: 'Ponto Eletrônico / REP', status: 'completed' },
      { name: 'Gestão de Benefícios', status: 'completed' },
      { name: 'Autoatendimento & Mobile', status: 'completed' },
      { name: 'Alteração Cadastral', status: 'completed' },
      { name: 'Workflow de Dependentes', status: 'completed' },
      { name: 'Workflow Férias, Dados', status: 'completed' },
      { name: 'Workflow de Afastamento', status: 'completed' },
    ],
    inProgress: [
      { name: 'Interface Contábil/Financ.', version: '5.08', status: 'in-progress' },
      { name: 'Cargos e Salários', version: '3.07-6.07', status: 'in-progress' },
      { name: 'Orçamento de Pessoal', version: '17.8', status: 'in-progress' },
      { name: 'Comissão Digital, Roteirização', version: 'J-C7-6.7', status: 'in-progress' },
      { name: 'Assinador Digital', version: '3.07', status: 'in-progress' },
      { name: 'Workflow Benefícios', version: '6.07 - 8.07', status: 'in-progress' },
      { name: 'Workflow Rescisão', version: '6.07 - 8.07', status: 'in-progress' },
      { name: 'Workflow de lançamento de valores', version: '5.07', status: 'in-progress' },
      { name: 'Workflow Vale-Transporte', version: '6.07', status: 'in-progress' },
    ],
    notStarted: [
      { name: 'People Analytics + IA', status: 'not-started' },
      { name: 'Workflow Movimentação', version: 'TBC', status: 'not-started' },
    ],
    cancelled: [
      { name: 'New Collector', status: 'cancelled' },
      { name: 'Reconhecimento Facial', status: 'cancelled' },
      { name: 'Restaurante', status: 'cancelled' },
    ],
  };

  const stats = {
    completed: modules.completed.length,
    inProgress: modules.inProgress.length,
    notStarted: modules.notStarted.length,
    cancelled: modules.cancelled.length,
  };

  const totalModules = stats.completed + stats.inProgress + stats.notStarted + stats.cancelled;

  const percentages = {
    completed: totalModules ? Math.round((stats.completed / totalModules) * 100) : 0,
    inProgress: totalModules ? Math.round((stats.inProgress / totalModules) * 100) : 0,
    notStarted: totalModules ? Math.round((stats.notStarted / totalModules) * 100) : 0,
    cancelled: totalModules ? Math.round((stats.cancelled / totalModules) * 100) : 0,
  };

  const statusConfig = {
    completed: {
      color: 'bg-blue-500',
      textColor: 'text-white',
      label: 'IMPLANTADOS (base sólida)',
      icon: CheckCircle2,
      bgLight: 'bg-blue-50',
    },
    inProgress: {
      color: 'bg-yellow-400',
      textColor: 'text-white',
      label: 'EM ANDAMENTO (alto volume crítico)',
      icon: Clock,
      bgLight: 'bg-yellow-50',
    },
    notStarted: {
      color: 'bg-red-500',
      textColor: 'text-white',
      label: 'NÃO INICIADO',
      icon: AlertCircle,
      bgLight: 'bg-red-50',
    },
    cancelled: {
      color: 'bg-gray-500',
      textColor: 'text-white',
      label: 'CANCELADOS',
      icon: XCircle,
      bgLight: 'bg-gray-50',
    },
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Status de Implementação: Visão Geral do Projeto
        </h2>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-teal-500 rounded"></div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Completed */}
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <div className="text-5xl font-bold mb-2">{String(stats.completed).padStart(2, '0')}</div>
          <div className="text-sm font-bold uppercase tracking-wide">
            {statusConfig.completed.label}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-yellow-400 text-white p-6 rounded-lg shadow-lg">
          <div className="text-5xl font-bold mb-2">{String(stats.inProgress).padStart(2, '0')}</div>
          <div className="text-sm font-bold uppercase tracking-wide">
            {statusConfig.inProgress.label}
          </div>
        </div>

        {/* Not Started */}
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
          <div className="text-5xl font-bold mb-2">{String(stats.notStarted).padStart(2, '0')}</div>
          <div className="text-sm font-bold uppercase tracking-wide">
            {statusConfig.notStarted.label}
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-gray-500 text-white p-6 rounded-lg shadow-lg">
          <div className="text-5xl font-bold mb-2">{String(stats.cancelled).padStart(2, '0')}</div>
          <div className="text-sm font-bold uppercase tracking-wide">
            {statusConfig.cancelled.label}
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Completed Modules */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 min-h-96">
          <h3 className="font-bold text-blue-900 mb-4 text-sm uppercase">
            Implantados
          </h3>
          <ul className="space-y-3">
            {modules.completed.map((module, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>{module.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* In Progress Modules */}
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400 min-h-96">
          <h3 className="font-bold text-yellow-900 mb-4 text-sm uppercase">
            Em Andamento
          </h3>
          <ul className="space-y-3">
            {modules.inProgress.map((module, idx) => (
              <li key={idx} className="text-sm text-yellow-800">
                <div className="font-semibold text-yellow-900">{module.name}</div>
                {module.version && (
                  <div className="text-xs text-yellow-700 mt-1">
                    {module.version}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Not Started Modules */}
        <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 min-h-96">
          <h3 className="font-bold text-red-900 mb-4 text-sm uppercase">
            Não Iniciado
          </h3>
          <ul className="space-y-3">
            {modules.notStarted.map((module, idx) => (
              <li key={idx} className="text-sm text-red-800">
                <div className="font-semibold text-red-900">{module.name}</div>
                {module.version && (
                  <div className="text-xs text-red-700 mt-1">
                    {module.version}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Cancelled Modules */}
        <div className="bg-gray-100 p-6 rounded-lg border-l-4 border-gray-500 min-h-96">
          <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">
            Cancelados
          </h3>
          <ul className="space-y-3">
            {modules.cancelled.map((module, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                <span className="line-through">{module.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex h-16 rounded-lg overflow-hidden shadow-lg mb-6">
        <div className="bg-blue-500 flex items-center justify-center text-white font-bold text-sm" style={{ width: ${percentages.completed}% }}>
          {percentages.completed}% CONCLUÍDO
        </div>
        <div className="bg-yellow-400 flex items-center justify-center text-white font-bold text-sm" style={{ width: ${percentages.inProgress}% }}>
          {percentages.inProgress}% EM ANDAMENTO
        </div>
        <div className="bg-red-500 flex items-center justify-center text-white font-bold text-sm" style={{ width: ${percentages.notStarted}% }}>
          {percentages.notStarted}%
        </div>
        <div className="bg-gray-500 flex items-center justify-center text-white font-bold text-sm" style={{ width: ${percentages.cancelled}% }}>
          {percentages.cancelled}%
        </div>
      </div>

      {/* Meta */}
      <div className="text-center text-gray-600 text-sm">
        <p className="font-semibold">
          Meta: 100% de conclusão até <span className="font-bold">Ago 26</span> · {totalModules} módulos no total
        </p>
      </div>
    </div>
  );
}
