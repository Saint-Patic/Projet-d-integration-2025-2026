let teams = [
  {
    id: 1,
    name: "Équipe Alpha",
    playerCount: 7,
    color: "#3498db",
    players: ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley"],
  },
  {
    id: 2,
    name: "Équipe Beta",
    playerCount: 6,
    color: "#e74c3c",
    players: ["Jamie", "Quinn", "Avery", "Cameron", "Reese", "Finley"],
  },
  {
    id: 3,
    name: "Équipe Gamma",
    playerCount: 5,
    color: "#b4918dff",
    players: ["Peyton", "Dakota", "Skyler", "Parker", "Hayden"],
  },
  {
    id: 4,
    name: "Équipe Delta",
    playerCount: 0,
    color: "#27ae60",
    players: [],
  },
];

export const getTeams = () => {
  return Promise.resolve([...teams]);
};

export const getTeamById = (id) => {
  const team = teams.find((t) => t.id === id);
  return Promise.resolve(team ? { ...team } : null);
};

export const createTeam = (team) => {
  const newTeam = {
    id: teams.length > 0 ? Math.max(...teams.map((t) => t.id)) + 1 : 1,
    ...team,
    playerCount: team.playerCount || 0,
    players: team.players || [],
  };
  teams = [...teams, newTeam];
  return Promise.resolve({ ...newTeam });
};

export const updateTeam = (id, updates) => {
  let updatedTeam = null;
  teams = teams.map((team) => {
    if (team.id === id) {
      updatedTeam = { ...team, ...updates };
      if (updates.players) {
        updatedTeam.playerCount = updates.players.length;
      }
      return updatedTeam;
    }
    return team;
  });
  return Promise.resolve(updatedTeam);
};

export const deleteTeam = (id) => {
  const teamToDelete = teams.find((t) => t.id === id);
  teams = teams.filter((team) => team.id !== id);
  return Promise.resolve(teamToDelete ? { ...teamToDelete } : null);
};

export const addPlayerToTeam = (teamId, playerName) => {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return Promise.resolve(null);

  const updatedPlayers = [...(team.players || []), playerName];
  return updateTeam(teamId, {
    players: updatedPlayers,
    playerCount: updatedPlayers.length,
  });
};

export const removePlayerFromTeam = (teamId, playerName) => {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return Promise.resolve(null);

  const updatedPlayers = (team.players || []).filter((p) => p !== playerName);
  return updateTeam(teamId, {
    players: updatedPlayers,
    playerCount: updatedPlayers.length,
  });
};

// Stats functions
export const getTeamStats = (teamId) => {
  const teamMatches = teams.filter(
    (m) =>
      m.team1 === teams.find((t) => t.id === teamId)?.name ||
      m.team2 === teams.find((t) => t.id === teamId)?.name
  );

  const wins = teamMatches.filter((m) => {
    const isTeam1 = m.team1 === teams.find((t) => t.id === teamId)?.name;
    return (
      m.status === "finished" &&
      (isTeam1 ? m.score1 > m.score2 : m.score2 > m.score1)
    );
  }).length;

  const losses = teamMatches.filter((m) => {
    const isTeam1 = m.team1 === teams.find((t) => t.id === teamId)?.name;
    return (
      m.status === "finished" &&
      (isTeam1 ? m.score1 < m.score2 : m.score2 < m.score1)
    );
  }).length;

  const totalPoints = teamMatches.reduce((sum, m) => {
    const isTeam1 = m.team1 === teams.find((t) => t.id === teamId)?.name;
    return sum + (isTeam1 ? m.score1 : m.score2);
  }, 0);

  return Promise.resolve({
    matches: teamMatches.length,
    wins,
    losses,
    totalPoints,
  });
};
