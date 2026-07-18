export type Role = "user" | "admin";
export type MatchStatus = "scheduled" | "live" | "finished";
export type PenaltyWinnerTeam = "home" | "away";

export type Profile = {
  id: string;
  email: string;
  username: string | null;
  role: Role;
};

export type Match = {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_time: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  penalties_enabled: boolean;
  penalty_winner_team: PenaltyWinnerTeam | null;
  created_at: string;
};

export type Prediction = {
  id: string;
  match_id: string;
  user_id: string;
  home_score: number;
  away_score: number;
  penalty_winner_team: PenaltyWinnerTeam | null;
  points: number;
  exact_score: boolean;
  created_at: string;
  updated_at: string;
};

export type PredictionWithMatch = Prediction & {
  matches: Match | null;
};

export type AdminPredictionRow = Prediction & {
  profiles: Profile | null;
  matches: Match | null;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  total_points: number;
  prediction_count: number;
  exact_score_count: number;
};

export type LeaderboardPredictionDetail = {
  user_id: string;
  display_name: string;
  match_id: string;
  home_team: string;
  away_team: string;
  kickoff_time: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_penalty_winner_team: PenaltyWinnerTeam | null;
  final_home_score: number | null;
  final_away_score: number | null;
  final_penalty_winner_team: PenaltyWinnerTeam | null;
  penalties_enabled: boolean;
  points: number | null;
  exact_score: boolean | null;
  match_status: MatchStatus;
};

export type LeagueCelebrationSettings = {
  id: boolean;
  celebration_enabled: boolean;
  celebration_message: string;
  updated_at: string;
  updated_by: string | null;
};
