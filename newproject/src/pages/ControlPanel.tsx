
import DashboardLayout from '@/components/DashboardLayout';

export default function ControlPanel() {
  return (
    <DashboardLayout currentPage="control-panel">
      <div className="p-8">
        <h1
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Control Panel
        </h1>

        <p className="text-muted-foreground">
          Dashboard Executivo do Programa
        </p>
      </div>
    </DashboardLayout>
  );
}
