
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  
const exportSnapshot = () => {
  const backup: Record<string, string | null> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key) {
      backup[key] = localStorage.getItem(key);
    }
  }

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;

  a.download = `snapshot-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  a.click();

  URL.revokeObjectURL(url);
};
  return (
    <DashboardLayout currentPage="dashboard">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-6">
          Administração
        </h1>

        <div className="grid gap-4">
<Button onClick={exportSnapshot}>
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
