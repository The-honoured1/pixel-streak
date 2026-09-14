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

    // Sort by current streak descending
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
        title: '21-Day Habit Former',
        description: 'Forge an unbreakable routine with 21 consecutive days',
        icon: 'lightning-bolt',
        target: 21,
        current: analytics.maxEverStreak,
        unlocked: analytics.maxEverStreak >= 21,
      },
      {
        id: 'century-club',
        title: 'Century 100',
        description: 'Paint 100 total pixels across all habits',
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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>PERFORMANCE</Text>
          <Text style={styles.headerTitle}>Analytics & Stats</Text>
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
            <MaterialCommunityIcons name="fire" size={24} color="#ff7b00" />
            <Text style={styles.kpiValue}>{analytics.maxCurrentStreak}d</Text>
            <Text style={styles.kpiLabel}>Current Best Streak</Text>
          </View>
          <View style={styles.kpiCard}>
            <MaterialCommunityIcons name="trophy" size={24} color="#facc15" />
            <Text style={styles.kpiValue}>{analytics.maxEverStreak}d</Text>
            <Text style={styles.kpiLabel}>Longest Streak</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color="#38bdf8" />
            <Text style={styles.kpiValue}>{analytics.totalCompletionsAll}</Text>
            <Text style={styles.kpiLabel}>Total Check-ins</Text>
          </View>
          <View style={styles.kpiCard}>
            <MaterialCommunityIcons name="chart-bell-curve" size={24} color="#39d353" />
            <Text style={styles.kpiValue}>{analytics.avgConsistency}%</Text>
            <Text style={styles.kpiLabel}>30-Day Consistency</Text>
          </View>
        </View>

        {/* Day of Week Consistency Histogram */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Weekly Activity Breakdown</Text>
          <Text style={styles.cardSubtitle}>Total habit check-ins by day of the week</Text>

          <View style={styles.chartContainer}>
            {analytics.dayDistribution.map((count, idx) => {
              const heightPercent = Math.max(8, Math.round((count / analytics.maxDayCount) * 100));
              return (
                <View key={idx} style={styles.chartCol}>
                  <Text style={styles.chartColValue}>{count}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                  </View>
                  <Text style={styles.chartDayLabel}>{dayNames[idx]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Streaks Leaderboard */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Streak Leaderboard</Text>
          <Text style={styles.cardSubtitle}>Your habits ranked by active consistency</Text>

          <View style={styles.leaderboardList}>
            {analytics.habitRanks.map((item, index) => {
              const pal = PALETTES[item.habit.palette] || PALETTES.emerald;
              const tier = getStreakTier(item.stats.currentStreak);

              return (
                <View key={item.habit.id} style={styles.leaderboardRow}>
                  <Text style={styles.rankNum}>#{index + 1}</Text>
                  <View style={[styles.habitIconMini, { backgroundColor: `${pal.accent}15` }]}>
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
                      Best: {item.stats.longestStreak}d • Total: {item.stats.totalCompletions}
                    </Text>
                  </View>
                  <View style={styles.streakBadgeMini}>
                    <MaterialCommunityIcons name="fire" size={16} color={tier.color} />
                    <Text style={[styles.streakTextMini, { color: tier.color }]}>
                      {item.stats.currentStreak}d
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pixel Milestones */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Pixel Achievements</Text>
          <Text style={styles.cardSubtitle}>Milestones forged through consistency</Text>

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
                      color={m.unlocked ? '#facc15' : '#6e7681'}
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
    backgroundColor: '#0d1117',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  headerSubtitle: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#f0f6fc',
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
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#161b22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 16,
    alignItems: 'center',
  },
  kpiValue: {
    color: '#f0f6fc',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
  },
  kpiLabel: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#f0f6fc',
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
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
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: '#0d1117',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 6,
  },
  chartDayLabel: {
    color: '#8b949e',
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
    backgroundColor: '#0d1117',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 10,
  },
  rankNum: {
    color: '#8b949e',
    fontSize: 13,
    fontWeight: '800',
    width: 26,
  },
  habitIconMini: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  habitInfoMini: {
    flex: 1,
  },
  habitNameMini: {
    color: '#f0f6fc',
    fontSize: 14,
    fontWeight: '600',
  },
  habitMetaMini: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 2,
  },
  streakBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: '#0d1117',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#21262d',
    padding: 12,
    alignItems: 'center',
    opacity: 0.7,
  },
  milestoneCardUnlocked: {
    opacity: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    backgroundColor: 'rgba(250, 204, 21, 0.03)',
  },
  milestoneIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#161b22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  milestoneIconBoxUnlocked: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
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
    color: '#8b949e',
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneTitleUnlocked: {
    color: '#f0f6fc',
  },
  unlockedBadge: {
    backgroundColor: 'rgba(57, 211, 83, 0.15)',
    borderWidth: 0.5,
    borderColor: '#39d353',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unlockedBadgeText: {
    color: '#39d353',
    fontSize: 9,
    fontWeight: '800',
  },
  milestoneDesc: {
    color: '#8b949e',
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
    backgroundColor: '#21262d',
    borderRadius: 2,
    overflow: 'hidden',
  },
  milestoneFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
  milestoneProgressText: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '600',
  },
});
