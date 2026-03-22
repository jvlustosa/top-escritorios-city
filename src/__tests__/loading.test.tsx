import { mockOffices, rankOffices, formatRevenueRange } from '@/data/mock-offices';

describe('Mock data', () => {
  test('has 45 offices', () => {
    expect(mockOffices).toHaveLength(45);
  });

  test('every office has required fields', () => {
    mockOffices.forEach((o) => {
      expect(o.id).toBeDefined();
      expect(o.name).toBeTruthy();
      expect(o.slug).toBeTruthy();
      expect(o.city).toBeTruthy();
      expect(o.state).toHaveLength(2);
      expect(o.tier).toBeGreaterThanOrEqual(1);
      expect(o.tier).toBeLessThanOrEqual(5);
    });
  });

  test('verified offices have revenue_range', () => {
    mockOffices.filter((o) => o.verified).forEach((o) => {
      expect(o.revenue_range).not.toBeNull();
      const range = o.revenue_range as [number, number];
      expect(range[0]).toBeLessThan(range[1]);
    });
  });

  test('unverified offices have null revenue_range', () => {
    mockOffices.filter((o) => !o.verified).forEach((o) => {
      expect(o.revenue_range).toBeNull();
    });
  });

  test('slugs are unique', () => {
    const slugs = mockOffices.map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('map_positions are unique', () => {
    const positions = mockOffices.map((o) => `${o.map_position[0]},${o.map_position[1]}`);
    expect(new Set(positions).size).toBe(positions.length);
  });
});

describe('rankOffices', () => {
  test('verified offices get rank by revenue_range descending', () => {
    const ranked = rankOffices(mockOffices);
    const verified = ranked.filter((o) => o.rank !== null);

    expect(verified.length).toBe(29);
    expect(verified[0].rank).toBe(1);
    expect(verified[0].name).toBe('Koetz Advocacia');

    // ranks are sequential
    verified.forEach((o, i) => {
      expect(o.rank).toBe(i + 1);
    });

    // revenue_range top is descending
    for (let i = 1; i < verified.length; i++) {
      const prevMax = verified[i - 1].revenue_range?.[1] ?? 0;
      const currMax = verified[i].revenue_range?.[1] ?? 0;
      expect(prevMax).toBeGreaterThanOrEqual(currMax);
    }
  });

  test('unverified offices have null rank', () => {
    const ranked = rankOffices(mockOffices);
    const unverified = ranked.filter((o) => o.rank === null);

    expect(unverified.length).toBe(16);
    unverified.forEach((o) => {
      expect(o.verified).toBe(false);
    });
  });

  test('total count is preserved', () => {
    const ranked = rankOffices(mockOffices);
    expect(ranked.length).toBe(mockOffices.length);
  });
});

describe('formatRevenueRange', () => {
  test('formats millions', () => {
    expect(formatRevenueRange([2_000_000, 3_000_000])).toBe('R$2M–R$3M/mês');
  });

  test('formats thousands', () => {
    expect(formatRevenueRange([100_000, 200_000])).toBe('R$100K–R$200K/mês');
  });

  test('formats mixed', () => {
    expect(formatRevenueRange([800_000, 1_000_000])).toBe('R$800K–R$1M/mês');
  });
});
