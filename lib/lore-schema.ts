export type CastMember = {
  name: string;
  role: string;
  special_trait: string;
  quote: string;
};

export type LoreStat = {
  label: string;
  value: string;
  evidence: string;
};

export type LoreResult = {
  season_title: string;
  episode_title: string;
  chat_recap: string;
  cast: CastMember[];
  lore_stats: LoreStat[];
  running_jokes: string[];
  iconic_quote: {
    speaker: string;
    quote: string;
  };
  iconic_moment: string;
  next_episode_teaser: string;
};
