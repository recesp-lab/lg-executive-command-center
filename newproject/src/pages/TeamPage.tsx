import DashboardLayout from '@/components/DashboardLayout';
import TeamMembers from '@/components/TeamMembers';

export default function TeamPage() {
  return (
    <DashboardLayout currentPage="team">
      <div className="p-8">
        <TeamMembers />
      </div>
    </DashboardLayout>
  );
}
