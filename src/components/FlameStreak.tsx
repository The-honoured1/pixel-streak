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
      // Gentle pulsing animation for active streak
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
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

  const iconSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  return (
    <View style={[styles.container, streak === 0 && styles.containerInactive]}>
      <Animated.View style={{ transform: [{ scale: streak > 0 ? pulseAnim : 1 }] }}>
        <MaterialCommunityIcons
          name={streak > 0 ? 'fire' : 'fire-off'}
          size={iconSize}
          color={tier.color}
        />
      </Animated.View>
      <Text style={[styles.streakCount, { fontSize, color: tier.color }]}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  containerInactive: {
    opacity: 0.5,
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
