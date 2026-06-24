export const homeMoodOptions = ['卖呆', '开心', '乐观', '焦虑', '沮丧', '痛苦'] as const;

export const homeMoodVoteOptions = ['开心', '焦虑', '痛苦', '沮丧'] as const;

export type HomeMood = (typeof homeMoodOptions)[number];
export type HomeMoodVote = (typeof homeMoodVoteOptions)[number];

const defaultHomeMood: HomeMood = '卖呆';

export function normalizeHomeMood(value: string | null | undefined): HomeMood {
  return homeMoodOptions.find((item) => item === value) ?? defaultHomeMood;
}

export function normalizeHomeMoodVote(value: string | null | undefined): HomeMoodVote {
  return homeMoodVoteOptions.find((item) => item === value) ?? '开心';
}
