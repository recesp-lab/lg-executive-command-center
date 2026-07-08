import { Users, Mail, Building2 } from 'lucide-react';
import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: 'SODIMAC' | 'LG' | 'FALABELLA';
  department: string;
}

export default function TeamMembers() {
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Bruno Rafael Costa Freitas',
      email: 'bfreitas@sodimac.com.br',
      role: 'Desenvolvedor',
      organization: 'SODIMAC',
      department: 'Desenvolvimento',
    },
    {
      id: '2',
      name: 'Raquel Patta Lisboa',
      email: 'rlisboa@sodimac.com.br',
      role: 'Analista de Sistemas',
      organization: 'SODIMAC',
      department: 'Análise',
    },
    {
      id: '3',
      name: 'André Silveira',
      email: 'ansilveira@sodimac.com.br',
      role: 'Desenvolvedor',
      organization: 'SODIMAC',
      department: 'Desenvolvimento',
    },
    {
      id: '4',
      name: 'Marislani',
      email: 'marislani@sodimac.com.br',
      role: 'Administrativo',
      organization: 'SODIMAC',
      department: 'Administrativo',
    },
    {
      id: '5',
      name: 'Douglas Martins Moura',
      email: 'douglas.moura@lg.com.br',
      role: 'Gerente de Projeto',
      organization: 'LG',
      department: 'Gerência',
    },
    {
      id: '6',
      name: 'Silvia Melo Neves',
      email: 'sneves@sodimac.com.br',
      role: 'Gerente de RH',
      organization: 'SODIMAC',
      department: 'RH',
    },
    {
      id: '7',
      name: 'Rodrigo Froes Pereira',
      email: 'rfroes@sodimac.com.br',
      role: 'Suporte Técnico',
      organization: 'SODIMAC',
      department: 'Suporte',
    },
    {
      id: '8',
      name: 'Roger Patrocinio Cardoso',
      email: 'roger.cardoso@lg.com.br',
      role: 'Gerente Executivo',
      organization: 'LG',
      department: 'Gerência',
    },
    {
      id: '9',
      name: 'Valdirene Santos',
      email: 'valdirene.santos@lg.com.br',
      role: 'Administrativo',
      organization: 'LG',
      department: 'Administrativo',
    },
    {
      id: '10',
      name: 'Douglas Felipe Belio',
      email: 'dbelio@sodimac.com.br',
      role: 'Desenvolvedor',
      organization: 'SODIMAC',
      department: 'Desenvolvimento',
    },
    {
      id: '11',
      name: 'Denis Soares Dias',
      email: 'ddias@sodimac.com.br',
      role: 'Gerente de TI',
      organization: 'SODIMAC',
      department: 'TI',
    },
    {
      id: '12',
      name: 'Alex Bertuqui',
      email: 'abertuqui@sodimac.com.br',
      role: 'Desenvolvedor',
      organization: 'SODIMAC',
      department: 'Desenvolvimento',
    },
    {
      id: '13',
      name: 'Daniel Neris de Souza',
      email: 'dsouza@sodimac.com.br',
      role: 'Analista de Sistemas',
      organization: 'SODIMAC',
      department: 'Análise',
    },
    {
      id: '14',
      name: 'Jessé Pereira de Souza Toledo',
      email: 'jtoledo_ext@sodimac.com.br',
      role: 'Suporte Técnico',
      organization: 'SODIMAC',
      department: 'Suporte',
    },
    {
      id: '15',
      name: 'Dagmar Orlando Monteiro Duarte',
      email: 'dduarte@sodimac.com.br',
      role: 'Auditor',
      organization: 'SODIMAC',
      department: 'Auditoria',
    },
    {
      id: '16',
      name: 'Renato Pereira',
      email: 'rpereira@falabella.cl',
      role: 'Administrativo',
      organization: 'FALABELLA',
      department: 'Administrativo',
    },
  ];

  const getOrgColor = (org: string) => {
    switch (org) {
      case 'SODIMAC':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LG':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FALABELLA':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDepartmentColor = (dept: string) => {
    const colors: { [key: string]: string } = {
      'Desenvolvimento': 'bg-green-100 text-green-800',
      'Análise': 'bg-blue-100 text-blue-800',
      'TI': 'bg-purple-100 text-purple-800',
      'RH': 'bg-pink-100 text-pink-800',
      'Gerência': 'bg-orange-100 text-orange-800',
      'Suporte': 'bg-yellow-100 text-yellow-800',
      'Auditoria': 'bg-red-100 text-red-800',
      'Administrativo': 'bg-gray-100 text-gray-800',
    };
    return colors[dept] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: teamMembers.length,
    sodimac: teamMembers.filter((m) => m.organization === 'SODIMAC').length,
    lg: teamMembers.filter((m) => m.organization === 'LG').length,
    falabella: teamMembers.filter((m) => m.organization === 'FALABELLA').length,
  };

  const departments = Array.from(new Set(teamMembers.map((m) => m.department))).sort();

  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const filteredMembers = selectedDept
    ? teamMembers.filter((m) => m.department === selectedDept)
    : teamMembers;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Membros da Equipe
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Total de {stats.total} membros distribuídos entre SODIMAC, LG e Falabella
        </p>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-border shadow-sm p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-2">Total de Membros</p>
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 shadow-sm p-4">
          <p className="text-xs text-blue-700 font-semibold mb-2">SODIMAC</p>
          <p className="text-3xl font-bold text-blue-700">{stats.sodimac}</p>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 shadow-sm p-4">
          <p className="text-xs text-purple-700 font-semibold mb-2">LG</p>
          <p className="text-3xl font-bold text-purple-700">{stats.lg}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 shadow-sm p-4">
          <p className="text-xs text-orange-700 font-semibold mb-2">FALABELLA</p>
          <p className="text-3xl font-bold text-orange-700">{stats.falabella}</p>
        </div>
      </div>

      {/* Departments Tabs - clique para filtrar a tabela abaixo */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDept(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
              selectedDept === null
                ? 'border-primary bg-primary text-white'
                : 'border-transparent bg-gray-100 text-gray-700 hover:border-gray-300'
            }`}
          >
            Todos ({teamMembers.length})
          </button>
          {departments.map((dept) => {
            const count = teamMembers.filter((m) => m.department === dept).length;
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(isActive ? null : dept)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${getDepartmentColor(dept)} ${
                  isActive ? 'border-current' : 'border-transparent hover:border-gray-300'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum membro encontrado para este departamento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Departamento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Organização</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, idx) => (
                  <tr key={member.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{member.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                          {member.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{member.role}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDepartmentColor(member.department)}`}>
                        {member.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getOrgColor(member.organization)}`}>
                        <Building2 className="w-3 h-3" />
                        {member.organization}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Total de Membros Únicos:</strong> {stats.total} pessoas
          <br />
          <strong>Distribuição:</strong> SODIMAC ({stats.sodimac}), LG ({stats.lg}), Falabella ({stats.falabella})
          <br />
          <strong>Departamentos:</strong> {departments.join(', ')}
        </p>
      </div>
    </div>
  );
}
