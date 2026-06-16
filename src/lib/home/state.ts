export const homeMoodOptions = ['卖呆', '开心', '乐观', '焦虑', '沮丧', '痛苦'] as const;

export const homeMoodVoteOptions = ['开心', '焦虑', '痛苦', '沮丧'] as const;

export type HomeMood = (typeof homeMoodOptions)[number];
export type HomeMoodVote = (typeof homeMoodVoteOptions)[number];

export type SiteHomeState = {
  tagline: string;
  homeMood: HomeMood;
};

type SiteHomeStatePayload = {
  tagline?: unknown;
  homeMood?: unknown;
};

const defaultTagline = '一个人，一千天，一笔笔记录真实进展。';
const defaultHomeMood: HomeMood = '卖呆';

export function normalizeHomeMood(value: string | null | undefined): HomeMood {
  return homeMoodOptions.find((item) => item === value) ?? defaultHomeMood;
}

export function normalizeHomeMoodVote(value: string | null | undefined): HomeMoodVote {
  return homeMoodVoteOptions.find((item) => item === value) ?? '开心';
}

export function parseSiteHomeState(rawValue: string | null | undefined): SiteHomeState {
  if (!rawValue) {
    return {
      tagline: defaultTagline,
      homeMood: defaultHomeMood,
    };
  }

  try {
    const payload = JSON.parse(rawValue) as SiteHomeStatePayload;
    return {
      tagline: normalizeTagline(payload.tagline),
      homeMood: normalizeHomeMood(typeof payload.homeMood === 'string' ? payload.homeMood : undefined),
    };
  } catch {
    return {
      tagline: normalizeTagline(rawValue),
      homeMood: defaultHomeMood,
    };
  }
}

export function serializeSiteHomeState(input: Partial<SiteHomeState>) {
  return JSON.stringify({
    tagline: normalizeTagline(input.tagline),
    homeMood: normalizeHomeMood(input.homeMood),
  });
}

function normalizeTagline(value: unknown) {
  if (typeof value !== 'string') {
    return defaultTagline;
  }

  const trimmed = value.trim();
  return trimmed || defaultTagline;
}
