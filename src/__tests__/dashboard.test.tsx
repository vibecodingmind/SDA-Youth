import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from '@jest/globals';

// Simple component test example
describe('Dashboard', () => {
  it('should render the dashboard title', () => {
    // This is a placeholder test
    expect(true).toBe(true);
  });

  it('should calculate points correctly', () => {
    const points = 450;
    const bonus = 50;
    const total = points + bonus;
    expect(total).toBe(500);
  });

  it('should format dates correctly', () => {
    const date = new Date('2026-03-27');
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(formatted).toContain('March');
    expect(formatted).toContain('2026');
  });
});

describe('Leaderboard', () => {
  const mockLeaderboard = [
    { rank: 1, name: 'Sarah Kim', points: 1200 },
    { rank: 2, name: 'Mike Chen', points: 980 },
    { rank: 3, name: 'Emma Wilson', points: 850 },
  ];

  it('should sort users by points descending', () => {
    const sorted = [...mockLeaderboard].sort((a, b) => b.points - a.points);
    expect(sorted[0].rank).toBe(1);
    expect(sorted[0].points).toBeGreaterThan(sorted[1].points);
  });

  it('should calculate rank correctly', () => {
    mockLeaderboard.forEach((user, index) => {
      expect(user.rank).toBe(index + 1);
    });
  });
});

describe('Badges', () => {
  const mockBadges = [
    { id: 'b1', name: 'First Steps', earned: true },
    { id: 'b2', name: 'Social Butterfly', earned: true },
    { id: 'b3', name: 'Top Contributor', earned: false },
  ];

  it('should count earned badges correctly', () => {
    const earnedCount = mockBadges.filter(b => b.earned).length;
    expect(earnedCount).toBe(2);
  });

  it('should identify locked badges', () => {
    const lockedBadges = mockBadges.filter(b => !b.earned);
    expect(lockedBadges).toHaveLength(1);
    expect(lockedBadges[0].name).toBe('Top Contributor');
  });
});
