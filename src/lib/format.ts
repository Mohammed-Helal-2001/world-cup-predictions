export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function isPredictionOpen(kickoffTime: string) {
  return Date.now() < new Date(kickoffTime).getTime();
}

export function getMatchLabel(kickoffTime: string, status: string) {
  if (status === "finished") return "Result entered";
  return isPredictionOpen(kickoffTime) ? "Prediction open" : "Prediction locked";
}

export function formatPenaltyWinner(value: "home" | "away" | null | undefined, homeTeam: string, awayTeam: string) {
  if (value === "home") return homeTeam;
  if (value === "away") return awayTeam;
  return null;
}
