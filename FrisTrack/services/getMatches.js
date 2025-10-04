// dataService.js

// Mock data
let matches = [
  {
    id: 1,
    team1: "Équipe Alpha",
    team2: "Équipe Beta",
    score1: 15,
    score2: 12,
    date: "2025-10-01",
    status: "finished",
    color: "#27ae60",
  },
  {
    id: 2,
    team1: "Équipe Gamma",
    team2: "Équipe Alpha",
    score1: 8,
    score2: 21,
    date: "2025-10-02",
    status: "finished",
    color: "#e74c3c",
  },
  {
    id: 3,
    team1: "Équipe Beta",
    team2: "Équipe Gamma",
    score1: 0,
    score2: 0,
    date: "2025-10-03",
    status: "scheduled",
    color: "#f39c12",
  },
  {
    id: 4,
    team1: "Équipe Delta",
    team2: "Équipe Alpha",
    score1: 0,
    score2: 0,
    date: "2025-10-10",
    status: "scheduled",
    color: "#3498db",
  },
];

// Match functions
export const getMatches = () => {
  return Promise.resolve([...matches]);
};

export const getMatchById = (id) => {
  const match = matches.find((m) => m.id === id);
  return Promise.resolve(match ? { ...match } : null);
};

export const createMatch = (match) => {
  const newMatch = {
    id: matches.length > 0 ? Math.max(...matches.map((m) => m.id)) + 1 : 1,
    ...match,
    status: match.status || "scheduled",
    score1: match.score1 || 0,
    score2: match.score2 || 0,
  };
  matches = [...matches, newMatch];
  return Promise.resolve({ ...newMatch });
};

export const updateMatch = (id, updates) => {
  let updatedMatch = null;
  matches = matches.map((match) => {
    if (match.id === id) {
      updatedMatch = { ...match, ...updates };
      return updatedMatch;
    }
    return match;
  });
  return Promise.resolve(updatedMatch);
};

export const deleteMatch = (id) => {
  const matchToDelete = matches.find((m) => m.id === id);
  matches = matches.filter((match) => match.id !== id);
  return Promise.resolve(matchToDelete ? { ...matchToDelete } : null);
};

export const finishMatch = (id, score1, score2) => {
  return updateMatch(id, {
    status: "finished",
    score1,
    score2,
    color: score1 > score2 ? "#27ae60" : "#e74c3c",
  });
};
