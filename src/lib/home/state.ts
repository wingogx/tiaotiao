export const homeMoodOptions = ['卖呆', '开心', '乐观', '焦虑', '沮丧', '痛苦'] as const;

export const homeVitalMetricKeys = ['share', 'food', 'health', 'energy'] as const;

export type HomeMood = (typeof homeMoodOptions)[number];
export type HomeVitalMetric = (typeof homeVitalMetricKeys)[number];

export type SiteHomeState = {
  tagline: string;
  homeMood: HomeMood;
};

export type UserHomeVitals = {
  date: string;
  share: number;
  food: number;
  health: number;
  energy: number;
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

export function emptyUserHomeVitals(date: string): UserHomeVitals {
  return {
    date,
    share: 0,
    food: 0,
    health: 0,
    energy: 0,
  };
}

export function parseUserHomeVitals(rawValue: unknown, currentDate: string): UserHomeVitals {
  if (!isPlainObject(rawValue) || rawValue.date !== currentDate) {
    return emptyUserHomeVitals(currentDate);
  }

  return {
    date: currentDate,
    share: normalizeCount(rawValue.share),
    food: normalizeCount(rawValue.food),
    health: normalizeCount(rawValue.health),
    energy: normalizeCount(rawValue.energy),
  };
}

export function incrementUserHomeVitals(rawValue: unknown, currentDate: string, metric: HomeVitalMetric): UserHomeVitals {
  const current = parseUserHomeVitals(rawValue, currentDate);

  return {
    ...current,
    [metric]: current[metric] + 1,
  };
}

function normalizeTagline(value: unknown) {
  if (typeof value !== 'string') {
    return defaultTagline;
  }

  const trimmed = value.trim();
  return trimmed || defaultTagline;
}

function normalizeCount(value: unknown) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }

  return Math.floor(count);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
