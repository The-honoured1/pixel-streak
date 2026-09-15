import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitContext';
import { calculateHabitStats, getStreakTier } from '../utils/streakCalculator';
import { PALETTES } from '../constants/palettes';
import { parseDate } from '../utils/dateUtils';
import { Milestone } from '../types';

export const StatsScreen: React.FC = () => {
  const { activeHabits } = useHabits();

  // Compute aggregated stats
  const analytics = useMemo(() => {
    let totalCompletionsAll = 0;
    let maxCurrentStreak = 0;
    let maxEverStreak = 0;
    let totalConsistencyRate = 0;

    const habitRanks = activeHabits.map(h => {
      const stats = calculateHabitStats(h);
      totalCompletionsAll += stats.totalCompletions;
      if (stats.currentStreak > maxCurrentStreak) maxCurrentStreak = stats.currentStreak;
      if (stats.longestStreak > maxEverStreak) maxEverStreak = stats.longestStreak;
      totalConsistencyRate += stats.completionRate;

      return {
        habit: h,
        stats,
      };
    });

    habitRanks.sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);

    const avgConsistency = activeHabits.length > 0
      ? Math.round(totalConsistencyRate / activeHabits.length)
      : 0;

    // Day of week distribution (0=Sun, 1=Mon, ..., 6=Sat)
    const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
    activeHabits.forEach(h => {
      Object.entries(h.records).forEach(([dateStr, level]) => {
        if (level > 0) {
          const d = parseDate(dateStr);
          dayDistribution[d.getDay()]++;
        }
      });
    });

    const maxDayCount = Math.max(1, ...dayDistribution);

    return {
      totalCompletionsAll,
      maxCurrentStreak,
      maxEverStreak,
      avgConsistency,
      habitRanks,
      dayDistribution,
      maxDayCount,
    };
  }, [activeHabits]);

  // Milestones system
  const milestones: Milestone[] = useMemo(() => {
    return [
      {
        id: 'first-pixel',
        title: 'First Pixel',
        description: 'Record your very first habit check-in',
        icon: 'seed',
        target: 1,
        current: analytics.totalCompletionsAll,
        unlocked: analytics.totalCompletionsAll >= 1,
      },
      {
        id: 'week-spark',
        title: '7-Day Ignition',
        description: 'Achieve a 7-day streak on any habit',
        icon: 'fire',
        target: 7,
        current: analytics.maxCurrentStreak,
        unlocked: analytics.maxCurrentStreak >= 7 || analytics.maxEverStreak >= 7,
      },
      {
        id: 'habit-former',
        title: '21-Day Routine',
        description: 'Forge an unbreakable routine with 21 consecutive days',
        icon: 'lightning-bolt',
        target: 21,
        current: analytics.maxEverStreak,
        unlocked: analytics.maxEverStreak >= 21,
      },
      {
        id: 'century-club',
        title: 'Century 100',
        description: 'Complete 100 total pixels across all habits',
        icon: 'trophy-award',
        target: 100,
        current: analytics.totalCompletionsAll,
        unlocked: analytics.totalCompletionsAll >= 100,
      },
      {
        id: 'iron-will',
        title: 'Iron Will (50-Day Streak)',
        description: 'Hit a massive 50-day streak milestone',
        icon: 'shield-star',
        target: 50,
        current: analytics.maxEverStreak,
        unlocked: analytics.maxEverStreak >= 50,
      },
    ];
  }, [analytics]);

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  if (activeHabits.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <View style={styles.headerTag}>
              <Text style={styles.headerTagText}>PERFORMANCE</Text>
            </View>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="chart-box-outline" size={32} color="#F97316" />
          </View>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Add habits on the Streaks tab and start checking in — your analytics will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>PERFORMANCE</Text>
          </View>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Cards Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <MaterialCommunityIcons name="fire" size={22} color="#F97316" />
            </View>
            <Text style={styles.kpiValue}>{analytics.maxCurrentStreak}d</Text>
            <Text style={styles.kpiLabel}>Current Best Streak</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(250, 204, 21, 0.15)' }]}>
              <MaterialCommunityIcons name="trophy" size={22} color="#FACC15" />
            </View>
            <Text style={styles.kpiValue}>{analytics.maxEverStreak}d</Text>
            <Text style={styles.kpiLabel}>Longest Streak</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color="#38BDF8" />
            </View>
            <Text style={styles.kpiValue}>{analytics.totalCompletionsAll}</Text>
            <Text style={styles.kpiLabel}>Total Check-ins</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <MaterialCommunityIcons name="chart-bell-curve" size={22} color="#10B981" />
            </View>
            <Text style={styles.kpiValue}>{analytics.avgConsistency}%</Text>
            <Text style={styles.kpiLabel}>30-Day Rate</Text>
          </View>
        </View>

        {/* Day of Week Consistency Histogram */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Weekly Activity Pattern</Text>
          <Text style={styles.cardSubtitle}>Check-ins by day of the week</Text>

          <View style={styles.chartContainer}>
            {analytics.dayDistribution.map((count, idx) => {
              const heightPercent = Math.max(8, Math.round((count / analytics.maxDayCount) * 100));
              const isToday = new Date().getDay() === idx;

              return (
                <View key={idx} style={styles.chartCol}>
                  <Text style={styles.chartColValue}>{count}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%` },
                        isToday && { backgroundColor: '#10B981' },
                      ]}
                    />
                  </View>
                  <Text style={[styles.chartDayLabel, isToday && { color: '#FFFFFF', fontWeight: '800' }]}>
                    {dayNames[idx]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Streaks Leaderboard */}
        {activeHabits.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Streak Leaderboard</Text>
            <Text style={styles.cardSubtitle}>Active habits ranked by consecutive consistency</Text>

            <View style={styles.leaderboardList}>
              {analytics.habitRanks.map((item, index) => {
                const pal = PALETTES[item.habit.palette] || PALETTES.emerald;
                const tier = getStreakTier(item.stats.currentStreak);

                return (
                  <View key={item.habit.id} style={styles.leaderboardRow}>
                    <Text style={styles.rankNum}>#{index + 1}</Text>
                    <View style={[styles.habitIconMini, { backgroundColor: `${pal.accent}18` }]}>
                      <MaterialCommunityIcons
                        name={(item.habit.icon as any) || 'check'}
                        size={16}
                        color={pal.accent}
                      />
                    </View>
                    <View style={styles.habitInfoMini}>
                      <Text style={styles.habitNameMini} numberOfLines={1}>
                        {item.habit.name}
                      </Text>
                      <Text style={styles.habitMetaMini}>
                        Best: {item.stats.longestStreak}d • {item.stats.totalCompletions} check-ins
                      </Text>
                    </View>
                    <View style={[styles.streakBadgeMini, { backgroundColor: `${tier.color}18` }]}>
                      <MaterialCommunityIcons name="fire" size={15} color={tier.color} />
                      <Text style={[styles.streakTextMini, { color: tier.color }]}>
                        {item.stats.currentStreak}d
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Pixel Milestones */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Pixel Achievements</Text>
          <Text style={styles.cardSubtitle}>Unlock badges as your habits compound</Text>

          <View style={styles.milestonesList}>
            {milestones.map(m => {
              const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));

              return (
                <View
                  key={m.id}
                  style={[
                    styles.milestoneCard,
                    m.unlocked && styles.milestoneCardUnlocked,
                  ]}
                >
                  <View
                    style={[
                      styles.milestoneIconBox,
                      m.unlocked && styles.milestoneIconBoxUnlocked,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={(m.icon as any) || 'star'}
                      size={22}
                      color={m.unlocked ? '#FACC15' : '#64748B'}
                    />
                  </View>
                  <View style={styles.milestoneContent}>
                    <View style={styles.milestoneTitleRow}>
                      <Text
                        style={[
                          styles.milestoneTitle,
                          m.unlocked && styles.milestoneTitleUnlocked,
                        ]}
                      >
                        {m.title}
                      </Text>
                      {m.unlocked && (
                        <View style={styles.unlockedBadge}>
                          <Text style={styles.unlockedBadgeText}>UNLOCKED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.milestoneDesc}>{m.description}</Text>

                    {!m.unlocked && (
                      <View style={styles.milestoneProgress}>
                        <View style={styles.milestoneTrack}>
                          <View
                            style={[
                              styles.milestoneFill,
                              { width: `${progressPct}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.milestoneProgressText}>
                          {m.current} / {m.target}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  headerTagText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#131824',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    alignItems: 'center',
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  kpiLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#131824',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartColValue: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  barTrack: {
    width: 14,
    height: 86,
    backgroundColor: '#1A2130',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 6,
  },
  chartDayLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0F17',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
  },
  rankNum: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    width: 26,
  },
  habitIconMini: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  habitInfoMini: {
    flex: 1,
  },
  habitNameMini: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  habitMetaMini: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  streakBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  streakTextMini: {
    fontSize: 13,
    fontWeight: '800',
  },
  milestonesList: {
    gap: 10,
  },
  milestoneCard: {
    flexDirection: 'row',
    backgroundColor: '#0C0F17',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    alignItems: 'center',
    opacity: 0.65,
  },
  milestoneCardUnlocked: {
    opacity: 1,
    borderColor: 'rgba(250, 204, 21, 0.25)',
    backgroundColor: 'rgba(250, 204, 21, 0.04)',
  },
  milestoneIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#181E2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  milestoneIconBoxUnlocked: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneTitleUnlocked: {
    color: '#FFFFFF',
  },
  unlockedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 0.5,
    borderColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unlockedBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  milestoneDesc: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  milestoneProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  milestoneTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#1E2536',
    borderRadius: 999,
    overflow: 'hidden',
  },
  milestoneFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 999,
  },
  milestoneProgressText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
});
