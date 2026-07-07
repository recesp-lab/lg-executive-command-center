[17:27, 7/7/2026] Renato PEREIRA: import { ReactNode } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Calendar, ClipboardList, Users } from 'lucide-react';
import { Link } from 'wouter';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'weekly' | 'risks' | 'audit' | 'team';
}

export default function DashboardLayout({ children, currentPage = 'dashboard' }: DashboardLayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/' },
    { id: 'risks', label: 'Riscos', icon: AlertCircle, href: '/risks' },
    { id: 'weekly', label: 'Semanal', icon: Calendar, href: '/weekly' },
    { id: 'audit', label: 'Auditoria', icon: ClipboardList, href: '/audit' },
    { id: 'team', label: 'Equipe', icon: Users, hre…
[17:29, 7/7/2026] Renato PEREIRA: import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface RiskMetrics {
  critical: number;
  medium: number;
  low: number;
}

interface RiskSemaphoreProps {
  metrics: RiskMetrics;
}

export default function RiskSemaphore({ metrics }: RiskSemaphoreProps) {
  const riskItems = [
    {
      level: 'Crítico',
      count: metrics.critical,
      color: 'badge-risk-red',
      icon: AlertCircle,
      description: 'Riscos que requerem ação imediata',
    },
    {
      level: 'Médio',
      count: metrics.medium,
      color: 'badge-risk-yellow',
      icon: AlertTriangle,
      description: 'Riscos em monitoramento',
    },
    {
      level: 'Baixo',
      count: metrics.low,
      color: 'badge-risk-green',
      icon: CheckCircle,
      description: 'Riscos controlados',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Semáforo de Riscos
        </h2>
        <p className="text-sm text-muted-foreground">
          Status atual dos riscos do projeto
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {riskItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.level}
              className={p-6 rounded-lg border-2 ${item.color} transition-all duration-200 hover:shadow-md}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.level}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
                <Icon className="w-6 h-6" />
              </div>

              <div className="mt-6">
                <p className="text-4xl font-mono font-bold text-foreground">
                  {item.count}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {item.count === 1 ? 'risco' : 'riscos'} identificado{item.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Total de Riscos</p>
            <p className="text-xs text-muted-foreground">Soma de todos os níveis</p>
          </div>
          <p className="text-3xl font-mono font-bold text-primary">
            {metrics.critical + metrics.medium + metrics.low}
          </p>
        </div>
      </div>
    </div>
  );
}
