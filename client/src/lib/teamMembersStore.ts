export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: 'SODIMAC' | 'LG' | 'FALABELLA';
  department: string;
}

export const TEAM_STORAGE_KEY = 'lg-dashboard:team-members';

export const loadTeamMembers = (): TeamMember[] => {
  try {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};
