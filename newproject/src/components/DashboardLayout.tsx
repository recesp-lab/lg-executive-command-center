import { ReactNode } from 'react';
import { BarChart3, AlertCircle, Calendar, ClipboardList, Users, Target } from 'lucide-react';
import { Link } from 'wouter';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'weekly' | 'risks' | 'audit' | 'team' | 'okrs' | 'admin' | 'control-panel';
}

export default function DashboardLayout({ children, currentPage = 'dashboard' }: DashboardLayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/' },
    { id: 'risks', label: 'Riscos', icon: AlertCircle, href: '/risks' },
    { id: 'weekly', label: 'Semanal', icon: Calendar, href: '/weekly' },
    { id: 'audit', label: 'Auditoria', icon: ClipboardList, href: '/audit' },
    { id: 'team', label: 'Equipe', icon: Users, href: '/team' },
    { id: 'admin', label: 'Administração', icon: Target, href: '/admin' },
    { id: 'okrs', label: 'OKRs & KPIs', icon: Target, href: '/okrs' },
{
  id: 'control-panel',
  label: 'Control Panel',
  icon: Target,
  href: '/control-panel',
},
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border shadow-sm relative">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              LG
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Projeto LG</h1>
              <p className="text-xs text-muted-foreground">Dashboard Executivo</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 block ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-sidebar-border bg-sidebar">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Projeto LG</p>
            <p>Versão 1.0</p>
            <p className="text-xs">Dashboard Executivo</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
