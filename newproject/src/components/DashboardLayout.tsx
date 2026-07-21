import { ReactNode, useEffect, useState } from 'react';
import { BarChart3, AlertCircle, Calendar, ClipboardList, Users, Target, SlidersHorizontal, Shield, Activity, FileText, Gavel, Wallet, Flag, TrendingUp, Moon, Sun } from 'lucide-react';
import { Link } from 'wouter';
import { captureSnapshotIfNeeded } from '@/data/snapshotsData';

const THEME_STORAGE_KEY = 'lg-dashboard:theme';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'weekly' | 'risks' | 'audit' | 'team' | 'okrs' | 'admin' | 'control-panel' | 'cronograma' | 'onepager' | 'decisoes' | 'orcamento' | 'marcos' | 'tendencias';
}

export default function DashboardLayout({ children, currentPage = 'dashboard' }: DashboardLayoutProps) {
  // Modo escuro: persiste a escolha e aplica a classe .dark no <html>,
  // que ativa as sobrescritas de cor definidas no index.css.
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      // localStorage indisponível
    }
  }, [dark]);

  // Captura o snapshot diário dos indicadores - roda em qualquer página,
  // então basta abrir o dashboard para o histórico de Tendências crescer.
  useEffect(() => {
    captureSnapshotIfNeeded();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/' },
    { id: 'onepager', label: 'One Pager', icon: FileText, href: '/onepager' },
    { id: 'tendencias', label: 'Tendências', icon: TrendingUp, href: '/tendencias' },
    { id: 'risks', label: 'Riscos', icon: AlertCircle, href: '/risks' },
    { id: 'weekly', label: 'Semanal', icon: Calendar, href: '/weekly' },
    { id: 'decisoes', label: 'Decisões & Atas', icon: Gavel, href: '/decisoes' },
    { id: 'audit', label: 'Auditoria', icon: ClipboardList, href: '/audit' },
    { id: 'team', label: 'Equipe', icon: Users, href: '/team' },
    { id: 'okrs', label: 'OKRs & KPIs', icon: Target, href: '/okrs' },
    { id: 'control-panel', label: 'Painel de Controle', icon: SlidersHorizontal, href: '/control-panel' },
    { id: 'cronograma', label: 'Cronograma', icon: Activity, href: '/cronograma' },
    { id: 'marcos', label: 'Marcos', icon: Flag, href: '/marcos' },
    { id: 'orcamento', label: 'Orçamento', icon: Wallet, href: '/orcamento' },
    { id: 'admin', label: 'Administração', icon: Shield, href: '/admin' },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border shadow-sm flex flex-col">
        <div className="p-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              LG
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Projeto LG</h1>
              <p className="text-xs text-muted-foreground">Dashboard Executivo</p>
              <p className="text-xs text-muted-foreground">Renato Pereira</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 block ${
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
        <div className="p-3 border-t border-sidebar-border bg-sidebar shrink-0">
          <button
            onClick={() => setDark((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-secondary transition-colors"
            title={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Modo claro' : 'Modo escuro'}
          </button>
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
