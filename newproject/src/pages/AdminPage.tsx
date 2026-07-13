
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <DashboardLayout currentPage="dashboard">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-6">
          Administração
        </h1>

        <div className="grid gap-4">
          <Button>
            Exportar Snapshot
          </Button>

          <Button>
            Importar Snapshot
          </Button>

          <Button variant="outline">
            Restaurar Backup
          </Button>

          <Button variant="outline">
            Verificar Dados
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
