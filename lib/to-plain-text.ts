import type { LoreResult } from "@/lib/lore-schema";

export function toPlainText(result: LoreResult): string {
  const cast = result.cast
    .map(
      (member) =>
        `${member.name} - ${member.role}\nTrait: ${member.special_trait}\nQuote: "${member.quote}"`,
    )
    .join("\n\n");
  const stats = result.lore_stats
    .map(
      (stat, index) =>
        `${index + 1}. ${stat.label}: ${stat.value}\nEvidence: ${stat.evidence}`,
    )
    .join("\n\n");
  const jokes = result.running_jokes.map((joke) => `- ${joke}`).join("\n");

  return [
    `SEASON TITLE\n${result.season_title}`,
    `EPISODE TITLE\n${result.episode_title}`,
    `CHAT RECAP\n${result.chat_recap}`,
    `CAST\n${cast}`,
    `LORE STATS\n${stats}`,
    `RUNNING JOKES\n${jokes}`,
    `ICONIC QUOTE\n${result.iconic_quote.speaker}: "${result.iconic_quote.quote}"`,
    `ICONIC MOMENT\n${result.iconic_moment}`,
    `NEXT EPISODE TEASER\n${result.next_episode_teaser}`,
  ].join("\n\n");
}
