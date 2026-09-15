import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStreakTier } from '../utils/streakCalculator';

interface FlameStreakProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
}

export const FlameStreak: React.FC<FlameStreakProps> = ({ streak, size = 'medium' }) => {
  const tier = getStreakTier(streak);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak > 0) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [streak]);

  const iconSize = size === 'small' ? 14 : size === 'large' ? 22 : 16;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 13;

  const isActive = streak > 0;

  return (
    <View
      style={[
        styles.container,
        isActive
          ? {
              backgroundColor: `${tier.color}15`,
              borderColor: `${tier.color}35`,
            }
          : styles.containerInactive,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: isActive ? pulseAnim : 1 }] }}>
        <MaterialCommunityIcons
          name={isActive ? 'fire' : 'fire-off'}
          size={iconSize}
          color={isActive ? tier.color : '#64748B'}
        />
      </Animated.View>
      <Text
        style={[
          styles.streakCount,
          {
            fontSize,
            color: isActive ? tier.color : '#64748B',
          },
        ]}
      >
        {streak}
      </Text>
      {size === 'large' && (
        <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.name}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  containerInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  streakCount: {
    fontWeight: '800',
    marginLeft: 4,
    fontVariant: ['tabular-nums'],
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
