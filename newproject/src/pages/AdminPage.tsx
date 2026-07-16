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

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSnapshot = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const backup = JSON.parse(String(reader.result));
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, String(value));
      });
      alert('Backup restaurado com sucesso.');
      location.reload();
    };
    reader.readAsText(file);
  };

  return (
    <DashboardLayout currentPage="admin">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-6">Administração</h1>

        <div className="grid gap-4">
          <Button className="w-full" onClick={exportSnapshot}>
            Exportar Snapshot
          </Button>

          <div className="w-full">
            <input
              id="snapshot-upload"
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={importSnapshot}
            />
            <Button className="w-full" onClick={() => document.getElementById('snapshot-upload')?.click()}>
              Importar Snapshot
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
