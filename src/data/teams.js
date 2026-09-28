export const TEAMS = [
    {
        id: 'Australia',
        name: 'Australia',
        code: 'AUS',
        primary: '#f6c344',
        secondary: '#123c31',
    },
    {
        id: 'England',
        name: 'England',
        code: 'ENG',
        primary: '#4f7cff',
        secondary: '#d9e5ff',
    },
    {
        id: 'India',
        name: 'India',
        code: 'IND',
        primary: '#ff8a3d',
        secondary: '#1f5fbd',
    },
    {
        id: 'New_Zealand',
        name: 'New Zealand',
        code: 'NZ',
        primary: '#a7f3d0',
        secondary: '#111827',
    },
    {
        id: 'South_Africa',
        name: 'South Africa',
        code: 'SA',
        primary: '#28c78c',
        secondary: '#f4c84b',
    },
];

const FALLBACK_TEAM = {
    id: 'Team',
    name: 'Team',
    code: 'XI',
    primary: '#75e6b5',
    secondary: '#16332a',
};

export const getTeam = (teamId) =>
    TEAMS.find((team) => team.id === teamId) || {
        ...FALLBACK_TEAM,
        id: teamId || FALLBACK_TEAM.id,
        name: teamId ? teamId.replace(/_/g, ' ') : FALLBACK_TEAM.name,
    };
